"""Calls to the Elexon BMRS API.

FUELHH is the half-hourly generation outturn by fuel type (we only need WIND),
WINDFOR is the national wind forecast. Both are public, no API key needed.
"""

from datetime import date, datetime

import httpx

BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1/datasets"


def _get(path: str, params: dict) -> list[dict]:
    response = httpx.get(f"{BASE_URL}/{path}", params=params, timeout=30)
    response.raise_for_status()
    return response.json()


def fetch_actuals(first_day: date, last_day: date) -> dict[datetime, float]:
    """Wind outturn in MW, keyed by settlement period start time."""
    rows = _get(
        "FUELHH/stream",
        {
            "settlementDateFrom": first_day.isoformat(),
            "settlementDateTo": last_day.isoformat(),
            "fuelType": "WIND",
        },
    )
    return {datetime.fromisoformat(row["startTime"]): row["generation"] for row in rows}


def fetch_forecasts(published_from: datetime, published_to: datetime) -> dict[datetime, dict[datetime, float]]:
    """All forecast runs published in the window, as {publish time: {start time: MW}}.

    A new run comes out roughly every 3 hours and covers the next ~3 days hourly.
    """
    rows = _get(
        "WINDFOR/stream",
        {
            "publishDateTimeFrom": published_from.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "publishDateTimeTo": published_to.strftime("%Y-%m-%dT%H:%M:%SZ"),
        },
    )
    runs: dict[datetime, dict[datetime, float]] = {}
    for row in rows:
        published = datetime.fromisoformat(row["publishTime"])
        runs.setdefault(published, {})[datetime.fromisoformat(row["startTime"])] = row["generation"]
    return runs
