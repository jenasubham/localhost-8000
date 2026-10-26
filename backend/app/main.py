from datetime import date, datetime, time, timedelta, timezone
from functools import cache
from pathlib import Path

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles

from app import analysis, elexon

# Purchases for day D are decided on D-1, so decisions made in January 2026
# cover deliveries from 2 Jan to 1 Feb.
DELIVERY_DAYS = [date(2026, 1, 2) + timedelta(days=i) for i in range(31)]
DEFAULT_CUTOFF = time(9, 20)  # EPEX GB day-ahead auction gate closure, UK time
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

app = FastAPI(title="Wind forecast monitor")
app.add_middleware(GZipMiddleware)


@cache
def load_data() -> tuple[analysis.Actuals, analysis.Runs]:
    actuals = elexon.fetch_actuals(DELIVERY_DAYS[0], DELIVERY_DAYS[-1])
    # Runs from 31 Dec give the first delivery days their longer-horizon forecasts too.
    runs = elexon.fetch_forecasts(
        datetime(2025, 12, 31, tzinfo=timezone.utc),
        datetime(2026, 2, 1, tzinfo=timezone.utc),
    )
    return actuals, runs


def get_data() -> tuple[analysis.Actuals, analysis.Runs]:
    try:
        return load_data()
    except httpx.HTTPError as exc:
        raise HTTPException(502, "Couldn't load data from Elexon, please try again in a minute.") from exc


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/day-ahead")
def day_ahead(cutoff: time = DEFAULT_CUTOFF):
    actuals, runs = get_data()
    days, all_errors = [], []
    for day in DELIVERY_DAYS:
        result = analysis.day_ahead(actuals, runs, day, cutoff)
        errors = analysis.forecast_errors(result["points"])
        result["summary"] = analysis.summarise(errors)
        days.append(result)
        all_errors += errors

    return {"cutoff": cutoff, "summary": analysis.summarise(all_errors), "days": days}


@app.get("/api/error-by-horizon")
def error_by_horizon():
    actuals, runs = get_data()
    return analysis.error_by_horizon(actuals, runs)


# Serve the built React app when it's there (the Docker image puts it in backend/static).
# In development Vite serves the frontend instead and proxies /api here.
if STATIC_DIR.is_dir():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
