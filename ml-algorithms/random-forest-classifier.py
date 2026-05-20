"""Random Forest classifier for outdoor safety assessment.

Reads the safety_assessment table and trains a RandomForestClassifier
to predict safety labels (safe, moderate, caution, high, extreme). CLI
usage for the current bridge integration is to provide inference features
as positional arguments; the script prints a JSON object containing
model metrics and a single prediction with class probabilities.

Implementation highlights:
- Ordinal encoding for `age_range` to preserve vulnerability ordering.
- Imputation uses training-set medians/modes to avoid leakage.
- Outputs probabilities in a fixed order for stable downstream parsing.
"""

import random
import warnings
warnings.filterwarnings("ignore")
import argparse
import json
import os

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import train_test_split

from db_utils import load_table_dataframe

SEED       = 42

# ── input row defaults ───────────────────────────────────────────────────────
DEFAULT_PREDICT_ROW = {
    "date": "2026-05-05",
    "temperature": 34.0,
    "humidity": 53.0,
    "wind_speed": 16.0,
    "age_range": "18-39",
    "exertion_level": 3,
}

# ── reproducibility ──────────────────────────────────────────────────────────
random.seed(SEED)
np.random.seed(SEED)

# ── constants ─────────────────────────────────────────────────────────────────
# Probabilities printed in this fixed order
LABEL_ORDER = ["safe", "moderate", "high", "extreme"]

# Ordinal encoding for age_range preserves natural vulnerability ordering
AGE_RANGE_MAP = {
    "0-3":   0,
    "4-12":  1,
    "13-17": 2,
    "18-39": 3,
    "40-64": 4,
    "65-79": 5,
    "80+":   6,
}

NUMERIC_COLS = ["temperature", "humidity", "wind_speed", "exertion_level"]
TARGET       = "safety_label"

FEATURE_COLS = [
    "temperature", "humidity", "wind_speed", "exertion_level",
    "age_range_enc", "day_of_year", "day_of_week",
]


# ── preprocessing ─────────────────────────────────────────────────────────────
def preprocess(df: pd.DataFrame, fit_medians: dict = None, fit_modes: dict = None):
    """
    Parse dates → time features, encode age_range ordinally,
    impute missing values.
    Pass fit_medians/fit_modes=None to compute from df (training);
    pass dicts from training when preprocessing inference rows.
    """
    df = df.copy()
    df["date"] = pd.to_datetime(df["date"])

    # Time features
    df["day_of_year"] = df["date"].dt.dayofyear
    df["day_of_week"] = df["date"].dt.dayofweek

    # Ordinal encode age_range; unknown categories → -1 temporarily
    df["age_range_enc"] = df["age_range"].map(AGE_RANGE_MAP).fillna(-1).astype(int)

    # Impute numeric columns with training medians
    if fit_medians is None:
        fit_medians = {c: df[c].median() for c in NUMERIC_COLS}
    for c in NUMERIC_COLS:
        df[c] = df[c].fillna(fit_medians[c])

    # Impute unknown age_range with training mode
    if fit_modes is None:
        fit_modes = {"age_range_enc": int(df["age_range_enc"].mode()[0])}
    df["age_range_enc"] = df["age_range_enc"].replace(-1, fit_modes["age_range_enc"])

    return df, fit_medians, fit_modes


# ── train / evaluate ─────────────────────────────────────────────────────────
def train_evaluate(df: pd.DataFrame):
    df_clean = df.dropna(subset=FEATURE_COLS + [TARGET]).reset_index(drop=True)

    X = df_clean[FEATURE_COLS]
    y = df_clean[TARGET]

    # Stratified 80/20 split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=SEED, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=200,
        class_weight="balanced",
        random_state=SEED,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc    = accuracy_score(y_test, y_pred)
    f1     = f1_score(y_test, y_pred, average="macro", zero_division=0)

    return model, acc, f1


# ── predict ───────────────────────────────────────────────────────────────────
def predict_rows(model, df: pd.DataFrame) -> list:
    """
    For each row return (iso_date, predicted_label, [prob_safe, ..., prob_extreme]).
    Probabilities are always in LABEL_ORDER and rounded to 3 decimals.
    """
    X           = df[FEATURE_COLS]
    dates       = df["date"].dt.date
    pred_labels = model.predict(X)
    pred_probas = model.predict_proba(X)

    # Map model's internal class order → fixed LABEL_ORDER
    classes     = list(model.classes_)
    label_idx   = {c: i for i, c in enumerate(classes)}
    ordered_idx = [label_idx.get(lbl, -1) for lbl in LABEL_ORDER]

    results = []
    for i, (date, label) in enumerate(zip(dates, pred_labels)):
        probs = [
            round(pred_probas[i][oi], 3) if oi != -1 else 0.0
            for oi in ordered_idx
        ]
        results.append((str(date), label, probs))
    return results


def run_rfc(predict_row: dict):
    raw_train = load_table_dataframe(
        "safety_assessment",
        [
            "date",
            "temperature",
            "humidity",
            "wind_speed",
            "age_range",
            "exertion_level",
            "safety_label",
        ],
        order_by="`date` ASC, `id` ASC",
        parse_dates=("date",),
    ).reset_index(drop=True)

    if raw_train.empty:
        return {
            "metrics": {"acc": 0.0, "f1_macro": 0.0},
            "result": {
                "date": predict_row["date"],
                "label": "unknown",
                "prob_safe": 0.0,
                "prob_moderate": 0.0,
                "prob_high": 0.0,
                "prob_extreme": 0.0,
            },
        }

    train_df, fit_medians, fit_modes = preprocess(raw_train)
    train_df_clean = train_df.dropna(subset=[TARGET]).reset_index(drop=True)

    model, acc, f1 = train_evaluate(train_df_clean)

    pred_raw = pd.DataFrame([predict_row])
    pred_df, _, _ = preprocess(pred_raw, fit_medians=fit_medians, fit_modes=fit_modes)
    date_str, label, probs = predict_rows(model, pred_df)[0]

    return {
        "metrics": {
            "acc": round(float(acc), 4),
            "f1_macro": round(float(f1), 4),
        },
        "result": {
            "date": date_str,
            "label": str(label),
            "prob_safe": float(probs[0]),
            "prob_moderate": float(probs[1]),
            "prob_high": float(probs[2]),
            "prob_extreme": float(probs[3]),
        },
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Random Forest safety classifier")
    parser.add_argument("date", help="Date in YYYY-MM-DD")
    parser.add_argument("temperature", type=float, help="Temperature in C")
    parser.add_argument("humidity", type=float, help="Humidity in %%")
    parser.add_argument("wind_speed", type=float, help="Wind speed in km/h")
    parser.add_argument("age_range", help="Age range: 0-3, 4-12, 13-17, 18-39, 40-64, 65-79, 80+")
    parser.add_argument("exertion_level", type=float, help="Exertion level")
    args = parser.parse_args()

    row = DEFAULT_PREDICT_ROW.copy()
    row.update(
        {
            "date": args.date,
            "temperature": args.temperature,
            "humidity": args.humidity,
            "wind_speed": args.wind_speed,
            "age_range": args.age_range,
            "exertion_level": args.exertion_level,
        }
    )

    output = run_rfc(row)
    print(json.dumps(output))