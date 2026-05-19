"""
Random Forest 7-day heat index forecast.

Model:
  - sklearn RandomForestRegressor with n_estimators=200, max_depth=None,
    random_state=42, n_jobs=-1.
  - No seasonal or ARIMA structure; the ensemble captures non-linear
    relationships between weather predictors and heat index directly.

Feature set:
  - Base weather inputs : temperature, humidity, wind_speed.
  - Time features       : day_of_year, day_of_week (derived from date column).
  - Rolling means       : 3-day rolling average of temperature, humidity,
                          and wind_speed (min_periods=1 to handle series edges).
  - Lag features        : heat_index at lags 1 through 7 (t-1 .. t-7),
                          added as exogenous columns during training.

Lag strategy (documented):
  - 7 heat_index lags are included as features during training.
  - During forecasting, lags are built iteratively:
      day 1 : all 7 lags come from the last 7 observed heat_index values.
      day 2 : lag1 = day-1 predicted value; lags 2-7 from observed history.
      day k : lag1 = predicted[k-1], lag2 = predicted[k-2] (or observed if k<3),
               ..., lag7 = predicted[k-7] (or observed if k<8).
    This rolling substitution propagates uncertainty forward correctly.

Gap-filling strategy (documented):
  - All numeric columns : forward-fill (ffill) first to carry last known value
                          forward across mid-series gaps, then median-fill for
                          any remaining NaNs at the start of the series.
  - Categorical / date  : date is parsed and sorted ascending before any
                          imputation; no categorical columns in this module.

Train / test split:
  - Last 14 rows held out as test set (time-ordered, no shuffle).
  - Falls back to 20% of rows if the dataset has fewer than 28 rows.
  - Evaluation metrics: MAE, RMSE, R² printed to stdout.
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

# ── config ────────────────────────────────────────────────────────────────────
INPUT_PATH    = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "datasets", "heat_index.csv")
)
FORECAST_DAYS = 7
SEED          = 42

# ── reproducibility ──────────────────────────────────────────────────────────
random.seed(SEED)
np.random.seed(SEED)

# ── constants ─────────────────────────────────────────────────────────────────
FEATURE_COLS = [
    "temperature", "humidity", "wind_speed",
    "day_of_year", "day_of_week",
    "temperature_roll3", "humidity_roll3", "wind_speed_roll3",
    "heat_index_lag1", "heat_index_lag2", "heat_index_lag3",
    "heat_index_lag4", "heat_index_lag5", "heat_index_lag6", "heat_index_lag7",
]
TARGET = "heat_index"


# ── feature engineering ──────────────────────────────────────────────────────
def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add time features, rolling means, and lag features to a sorted dataframe."""
    df = df.copy()

    # Time features derived from date
    df["day_of_year"] = df["date"].dt.dayofyear
    df["day_of_week"] = df["date"].dt.dayofweek

    # Rolling means (window=3) for weather predictors
    for col in ["temperature", "humidity", "wind_speed"]:
        df[f"{col}_roll3"] = df[col].rolling(window=3, min_periods=1).mean()

    # Lag features for heat_index (lags 1..7)
    for lag in range(1, 8):
        df[f"heat_index_lag{lag}"] = df["heat_index"].shift(lag)

    return df


# ── preprocessing ─────────────────────────────────────────────────────────────
def load_and_preprocess(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date").reset_index(drop=True)

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
def iterative_forecast(model, df_clean: pd.DataFrame, forecast_days: int) -> list:
    """
    Produce a deterministic n-day forecast by iteratively predicting
    the next day's heat_index and feeding it back as the lag feature.
    """
    last_row  = df_clean.iloc[-1].copy()
    last_date = last_row["date"]

    # Grow this list with predicted values to feed back as lags
    hi_history = list(df_clean["heat_index"].values)

    results = []
    for i in range(1, forecast_days + 1):
        next_date = last_date + pd.Timedelta(days=i)

        # Reuse last known weather values; update only date-derived features
        row = last_row.copy()
        row["date"]        = next_date
        row["day_of_year"] = next_date.dayofyear
        row["day_of_week"] = next_date.dayofweek

        # Lag features drawn from the growing history
        for lag in range(1, 8):
            row[f"heat_index_lag{lag}"] = hi_history[-lag] if len(hi_history) >= lag else np.nan

        X_row   = pd.DataFrame([row[FEATURE_COLS]])
        pred_hi = model.predict(X_row)[0]

        hi_history.append(pred_hi)
        results.append((next_date.date().isoformat(), round(pred_hi, 2)))

    return results


def run_rfr(forecast_days: int):
    df = load_and_preprocess(INPUT_PATH)
    model, mae, rmse, r2, df_clean = train_evaluate(df)
    forecast = iterative_forecast(model, df_clean, forecast_days)

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
    parser.add_argument("forecast_days", type=int, help="Number of days to forecast")
    args = parser.parse_args()

    if args.forecast_days < 1:
        raise ValueError("forecast_days must be >= 1")

    output = run_rfr(args.forecast_days)
    print(json.dumps(output))