"""
ARIMAX 7-day price forecast per fuel type.

Model:
  - statsmodels SARIMAX used as a pure ARIMAX: seasonal_order=(0,0,0,0),
    making it equivalent to ARIMA(p,d,q) + exogenous regressors.
  - Exogenous matrix = [exchange_rate_to_usd, normal_supply_flag, lag1, lag2, lag3].
  - Small grid search over p in [0..3], d in [0..1], q in [0..3]; best AIC selected.

Lag strategy (documented):
  - 3 price lags (t-1, t-2, t-3) are added as exogenous columns during training.
  - During forecasting, lags are built iteratively:
      day 1 : lags come from the last 3 observed prices.
      day 2 : lag1 = day-1 predicted price; lag2, lag3 from observed history.
      day k : lag1 = predicted[k-1], lag2 = predicted[k-2] (or observed if k<3),
               lag3 = predicted[k-3] (or observed if k<4).
    This rolling substitution propagates uncertainty forward correctly.

Gap-filling strategy (documented):
  - price:                 linear interpolation (smooth for mid-series gaps),
                           then forward-fill / backward-fill for any remaining edges.
  - exchange_rate_to_usd:  forward-fill then backward-fill (step-carry suits FX rates).
  - normal_supply_flag:    forward-fill then backward-fill (carry last known status).
"""

# ── imports ───────────────────────────────────────────────────────────────────
import warnings
import argparse
import json
import os
import numpy as np
import pandas as pd
from itertools import product as iterproduct
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor, as_completed
from statsmodels.tsa.statespace.sarimax import SARIMAX

warnings.filterwarnings("ignore")

RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

HORIZON   = 7
N_LAGS    = 3
EXOG_COLS = ["exchange_rate_to_usd", "normal_supply_flag"]
ALPHA     = 0.05   # → 95% CI
INPUT_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "datasets", "fuel_prices.csv")
)

# ── grid search helper (runs in a thread) ─────────────────────────────────────
def _fit_one(args):
    """Fit a single ARIMAX(p,d,q) and return (aic, result) or (inf, None)."""
    p, d, q, price_train, exog_train = args
    try:
        res = SARIMAX(
            price_train,
            exog=exog_train,
            order=(p, d, q),
            seasonal_order=(0, 0, 0, 0),
            trend="n",
            enforce_stationarity=False,
            enforce_invertibility=False,
        ).fit(disp=False)
        return res.aic, res
    except Exception:
        return np.inf, None


# ── per-fuel worker (runs in a process) ───────────────────────────────────────
def _process_fuel(fuel_df_tuple):
    """
    Accepts (fuel_name, sub_df) where sub_df already has 'date' as index.
    Returns a list of result-row dicts.
    """
    warnings.filterwarnings("ignore")
    np.random.seed(RANDOM_SEED)

    fuel, sub = fuel_df_tuple

    # ── reindex to daily, fill gaps ───────────────────────────────────────────
    full_idx = pd.date_range(sub.index.min(), sub.index.max(), freq="D")
    sub = sub.reindex(full_idx)
    sub[EXOG_COLS] = sub[EXOG_COLS].ffill().bfill()
    sub["price"] = sub["price"].interpolate(method="linear").ffill().bfill()
    sub["normal_supply_flag"] = sub["normal_supply_flag"].astype(float)

    price = sub["price"].astype(float)
    exog  = sub[EXOG_COLS].astype(float).copy()

    for lag in range(1, N_LAGS + 1):
        exog[f"lag{lag}"] = price.shift(lag)

    valid_mask  = exog.notna().all(axis=1)
    price_train = price[valid_mask]
    exog_train  = exog[valid_mask]

    # ── parallel grid search over (p, d, q) using threads ────────────────────
    grid = list(iterproduct(range(4), range(2), range(4)))   # 32 combos
    tasks = [(p, d, q, price_train, exog_train) for p, d, q in grid]

    best_aic, best_result = np.inf, None
    with ThreadPoolExecutor() as tex:
        for aic, res in tex.map(_fit_one, tasks):
            if aic < best_aic:
                best_aic, best_result = aic, res

    if best_result is None:
        return []

    # ── iterative 7-day forecast with rolling predicted lags ─────────────────
    observed_tail   = price.iloc[-N_LAGS:].tolist()
    last_base_exog  = exog[EXOG_COLS].iloc[-1].tolist()

    predicted_prices, predicted_lower, predicted_upper = [], [], []
    price_buffer = observed_tail.copy()

    for step in range(HORIZON):
        lag_vals  = price_buffer[-N_LAGS:]
        step_exog = np.array([[
            last_base_exog[0],
            last_base_exog[1],
            lag_vals[-1],
            lag_vals[-2],
            lag_vals[-3],
        ]])

        fc_obj = best_result.get_forecast(steps=1, exog=step_exog)
        pt     = float(fc_obj.predicted_mean.iloc[0])
        ci     = fc_obj.conf_int(alpha=ALPHA)
        lo     = float(ci.iloc[0, 0])
        hi     = float(ci.iloc[0, 1])

        predicted_prices.append(pt)
        predicted_lower.append(lo)
        predicted_upper.append(hi)
        price_buffer.append(pt)

    # ── build forecast dates ──────────────────────────────────────────────────
    last_date    = sub.index.max()
    future_dates = pd.date_range(last_date + pd.Timedelta(days=1), periods=HORIZON, freq="D")

    return [
        {
            "date":            future_dates[i].strftime("%Y-%m-%d"),
            "fuel_type":       fuel,
            "predicted_price": round(predicted_prices[i], 4),
            "lower_95":        round(predicted_lower[i], 4),
            "upper_95":        round(predicted_upper[i], 4),
        }
        for i in range(HORIZON)
    ]


# ── main ──────────────────────────────────────────────────────────────────────
def run_arimax(horizon: int, n_lags: int):
    global HORIZON, N_LAGS

    HORIZON = int(horizon)
    N_LAGS = int(n_lags)

    df = pd.read_csv(INPUT_PATH, parse_dates=["date"])
    df = df.sort_values("date").reset_index(drop=True)

    # pre-split by fuel so each worker gets only its slice
    fuel_slices = [
        (fuel, group.set_index("date"))
        for fuel, group in df.groupby("fuel_type")
    ]

    rows = []
    # one process per fuel type — avoids GIL for statsmodels CPU work
    with ProcessPoolExecutor() as pex:
        for fuel_rows in pex.map(_process_fuel, fuel_slices):
            rows.extend(fuel_rows)

    return rows


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ARIMAX fuel price forecast")
    parser.add_argument("horizon", type=int, help="Forecast horizon in days")
    parser.add_argument("n_lags", type=int, help="Number of lag features")
    args = parser.parse_args()

    if args.horizon < 1:
        raise ValueError("horizon must be >= 1")
    if args.n_lags < 1:
        raise ValueError("n_lags must be >= 1")

    output = run_arimax(args.horizon, args.n_lags)
    print(json.dumps(output))