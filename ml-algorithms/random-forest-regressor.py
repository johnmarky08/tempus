"""Random Forest regressor for hourly heat-index forecasting.

Reads the heat_index table and produces an hourly forecast of heat
index values. CLI usage:

    python random-forest-regressor.py <forecast_hours>

Outputs JSON with evaluation metrics and per-day forecasts. The
implementation trains a RandomForestRegressor with engineered features
including time-derived fields, rolling means and lag features, then
produces iterative forecasts by feeding predicted values back as lags.

Warning: model training is performed at runtime and can be slow for
large datasets; for production use pre-train models or run training
as background tasks.
"""

import random
import warnings
warnings.filterwarnings("ignore")
import argparse
import json
import os

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from db_utils import load_table_dataframe

FORECAST_HOURS = 24
SEED          = 42

# ── reproducibility ──────────────────────────────────────────────────────────
random.seed(SEED)
np.random.seed(SEED)

# ── constants ─────────────────────────────────────────────────────────────────
FEATURE_COLS = [
    "temperature", "humidity", "wind_speed",
    "day_of_year", "day_of_week", "hour_of_day",
    "temperature_roll3", "humidity_roll3", "wind_speed_roll3",
    "heat_index_lag1", "heat_index_lag2", "heat_index_lag3",
    "heat_index_lag4", "heat_index_lag5", "heat_index_lag6", "heat_index_lag7",
]
TARGET = "heat_index"


# ── feature engineering ──────────────────────────────────────────────────────
def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add time features, rolling means, and lag features to a sorted dataframe."""
    df = df.copy()

    # Time features derived from timestamp
    df["day_of_year"] = df["date"].dt.dayofyear
    df["day_of_week"] = df["date"].dt.dayofweek
    df["hour_of_day"] = df["date"].dt.hour

    # Rolling means (window=3) for weather predictors
    for col in ["temperature", "humidity", "wind_speed"]:
        df[f"{col}_roll3"] = df[col].rolling(window=3, min_periods=1).mean()

    # Lag features for heat_index (lags 1..7)
    for lag in range(1, 8):
        df[f"heat_index_lag{lag}"] = df["heat_index"].shift(lag)

    return df


# ── preprocessing ─────────────────────────────────────────────────────────────
def load_and_preprocess() -> pd.DataFrame:
    df = load_table_dataframe(
        "heat_index",
        ["date", "temperature", "humidity", "wind_speed", "heat_index"],
        order_by="`date` ASC, `id` ASC",
        parse_dates=("date",),
    ).reset_index(drop=True)

    if df.empty:
        return df

    # Impute: forward-fill then median for any remaining NaNs in numeric cols
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    df[numeric_cols] = df[numeric_cols].ffill()
    for col in numeric_cols:
        if df[col].isna().any():
            df[col] = df[col].fillna(df[col].median())

    df = build_features(df)
    return df


# ── train / evaluate ─────────────────────────────────────────────────────────
def train_evaluate(df: pd.DataFrame):
    df_clean = df.dropna(subset=FEATURE_COLS + [TARGET]).reset_index(drop=True)

    # Use last 14 rows as test; fall back to 20% if dataset is short
    n = len(df_clean)
    test_size = 14 if n > 28 else max(1, int(n * 0.2))
    split = n - test_size

    train = df_clean.iloc[:split]
    test  = df_clean.iloc[split:]

    X_train, y_train = train[FEATURE_COLS], train[TARGET]
    X_test,  y_test  = test[FEATURE_COLS],  test[TARGET]

    model = RandomForestRegressor(
        n_estimators=200, max_depth=None,
        random_state=SEED, n_jobs=-1
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae   = mean_absolute_error(y_test, preds)
    rmse  = np.sqrt(mean_squared_error(y_test, preds))
    r2    = r2_score(y_test, preds)

    return model, mae, rmse, r2, df_clean


# ── iterative 7-day forecast ──────────────────────────────────────────────────
def iterative_forecast(model, df_clean: pd.DataFrame, forecast_hours: int) -> list:
    """
    Produce a deterministic n-hour forecast by iteratively predicting
    the next hour's heat_index and feeding it back as the lag feature.
    """
    last_row  = df_clean.iloc[-1].copy()
    last_date = last_row["date"]

    # Start forecasts from the next full hour relative to now (exclude current hour)
    now = pd.Timestamp.now()
    start_time = now.replace(minute=0, second=0, microsecond=0) + pd.Timedelta(hours=1)

    # Grow this list with predicted values to feed back as lags
    hi_history = list(df_clean["heat_index"].values)

    results = []
    for i in range(0, forecast_hours):
        next_date = start_time + pd.Timedelta(hours=i)

        # Reuse last known weather values; update only timestamp-derived features
        row = last_row.copy()
        row["date"]        = next_date
        row["day_of_year"] = next_date.dayofyear
        row["day_of_week"] = next_date.dayofweek
        row["hour_of_day"] = next_date.hour

        # Lag features drawn from the growing history
        for lag in range(1, 8):
            row[f"heat_index_lag{lag}"] = hi_history[-lag] if len(hi_history) >= lag else np.nan

        X_row   = pd.DataFrame([row[FEATURE_COLS]])
        pred_hi = model.predict(X_row)[0]

        hi_history.append(pred_hi)
        results.append((next_date.strftime("%Y-%m-%dT%H:%M"), round(pred_hi, 2)))

    return results


def run_rfr(forecast_hours: int):
    df = load_and_preprocess()
    if df.empty:
        return {
            "metrics": {
                "mae": 0.0,
                "rmse": 0.0,
                "r2": 0.0,
            },
            "forecasts": [],
        }

    model, mae, rmse, r2, df_clean = train_evaluate(df)
    forecast = iterative_forecast(model, df_clean, forecast_hours)

    return {
        "metrics": {
            "mae": round(float(mae), 4),
            "rmse": round(float(rmse), 4),
            "r2": round(float(r2), 4),
        },
        "forecasts": [
            {
                "date": date_str,
                "heat_index": float(round(hi, 2)),
            }
            for date_str, hi in forecast
        ],
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Random Forest heat index forecaster")
    parser.add_argument(
        "forecast_hours",
        nargs="?",
        type=int,
        default=FORECAST_HOURS,
        help="Number of hours to forecast",
    )
    args = parser.parse_args()

    if args.forecast_hours < 1:
        raise ValueError("forecast_hours must be >= 1")

    output = run_rfr(args.forecast_hours)
    print(json.dumps(output))