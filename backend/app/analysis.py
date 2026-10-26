"""Picks the forecast the trading desk would have used and measures its error.

Conventions:
- datetimes are timezone-aware UTC, like the Elexon data
- error = forecast - actual, so a positive error means wind was over-forecast
  and the desk would have had to buy more power than planned
"""

from collections import defaultdict
from datetime import date, datetime, time, timedelta, timezone
from math import sqrt
from statistics import mean, quantiles
from zoneinfo import ZoneInfo

UK = ZoneInfo("Europe/London")

Actuals = dict[datetime, float]  # start time -> MW
Runs = dict[datetime, dict[datetime, float]]  # publish time -> {start time -> MW}


def half_hours(day: date) -> list[datetime]:
    """Settlement period start times for a UK day (46 or 50 of them on clock-change days)."""
    start = datetime.combine(day, time(), tzinfo=UK).astimezone(timezone.utc)
    end = datetime.combine(day + timedelta(days=1), time(), tzinfo=UK).astimezone(timezone.utc)
    periods = []
    while start < end:
        periods.append(start)
        start += timedelta(minutes=30)
    return periods


def decision_time(day: date, cutoff: time) -> datetime:
    """Day-ahead purchases for `day` are decided at `cutoff` (UK time) on the day before."""
    return datetime.combine(day - timedelta(days=1), cutoff, tzinfo=UK).astimezone(timezone.utc)


def latest_run(runs: Runs, at: datetime) -> datetime | None:
    """Publish time of the newest forecast run that was out by `at`."""
    return max((published for published in runs if published <= at), default=None)


def day_ahead(actuals: Actuals, runs: Runs, day: date, cutoff: time) -> dict:
    """Actual generation for `day` next to the forecast available at the decision cutoff."""
    decided_at = decision_time(day, cutoff)
    published = latest_run(runs, decided_at)
    forecast = runs[published] if published else {}
    return {
        "date": day,
        "decisionTime": decided_at,
        "forecastPublished": published,
        "points": [
            {"time": t, "actual": actuals.get(t), "forecast": forecast.get(t)}
            for t in half_hours(day)
        ],
    }


def forecast_errors(points: list[dict]) -> list[tuple[datetime, float]]:
    # Forecasts are hourly, so only the on-the-hour settlement periods get compared.
    return [
        (p["time"], p["forecast"] - p["actual"])
        for p in points
        if p["forecast"] is not None and p["actual"] is not None
    ]


def summarise(errors: list[tuple[datetime, float]]) -> dict | None:
    if not errors:
        return None
    values = [error for _, error in errors]
    worst_time, worst = max(errors, key=lambda item: abs(item[1]))
    deciles = quantiles(values, n=10, method="inclusive")
    return {
        "count": len(values),
        "mae": mean(abs(v) for v in values),
        "rmse": sqrt(mean(v * v for v in values)),
        "bias": mean(values),
        "p10": deciles[0],
        "p90": deciles[-1],
        "worst": {"time": worst_time, "error": worst},
    }


def error_by_horizon(actuals: Actuals, runs: Runs, max_hours: int = 48) -> list[dict]:
    """Absolute error grouped by how many whole hours ahead the forecast was made."""
    by_hour = defaultdict(list)
    for published, forecast in runs.items():
        for start, value in forecast.items():
            hours_ahead = (start - published) / timedelta(hours=1)
            # Runs also restate a few past hours, those aren't forecasts so skip them.
            if 0 <= hours_ahead < max_hours and start in actuals:
                by_hour[int(hours_ahead)].append(abs(value - actuals[start]))

    return [
        {
            "hours": hours,
            "mae": mean(errors),
            "p90": quantiles(errors, n=10, method="inclusive")[-1],
            "count": len(errors),
        }
        for hours, errors in sorted(by_hour.items())
    ]
