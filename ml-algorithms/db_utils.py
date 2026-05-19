"""Shared MySQL helpers for the ML scripts.

The scripts read their training data from the application's database tables.
"""

from __future__ import annotations

from pathlib import Path
import os

import pandas as pd
import pymysql


def _load_env_file() -> dict[str, str]:
    """Load DB settings from the project .env file when available."""
    root_dir = Path(__file__).resolve().parent.parent
    env_path = root_dir / ".env"
    if not env_path.is_file():
        env_path = root_dir / ".env.example"

    values: dict[str, str] = {}
    if not env_path.is_file():
        return values

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        value = value.strip().strip('"').strip("'")
        values[key.strip()] = value

    return values


def _setting(name: str, default: str) -> str:
    env_values = _load_env_file()
    return os.getenv(name) or env_values.get(name) or default


def get_db_connection():
    return pymysql.connect(
        host=_setting("DB_HOST", "127.0.0.1"),
        port=int(_setting("DB_PORT", "3306")),
        user=_setting("DB_USERNAME", "root"),
        password=_setting("DB_PASSWORD", ""),
        database=_setting("DB_DATABASE", "tempus"),
        charset="utf8mb4",
        autocommit=True,
    )


def load_table_dataframe(
    table_name: str,
    columns: list[str],
    *,
    order_by: str | None = None,
    parse_dates: tuple[str, ...] = (),
) -> pd.DataFrame:
    select_columns = ", ".join(f"`{column}`" for column in columns)
    query = f"SELECT {select_columns} FROM `{table_name}`"
    if order_by:
        query = f"{query} ORDER BY {order_by}"

    connection = get_db_connection()
    try:
        return pd.read_sql_query(query, connection, parse_dates=list(parse_dates))
    finally:
        connection.close()