# Wind Forecast Monitor

A small web app for a team buying power on the GB day-ahead market. For each delivery day it shows the
national wind forecast that was available when the purchase decision had to be made, next to what the
wind actually generated, and it measures how far off those forecasts were.

Scope: GB national wind only, purchase decisions made in January 2026 (so deliveries from 2 Jan to 1 Feb),
data from Elexon BMRS.

- Live app: [Wind Forecast Monitor](https://localhost-8000-alpha.vercel.app/)
- Demo video: https://youtu.be/8vdA3jd2j0I

## Architecture
<img width="1833" height="2797" alt="architecture" src="https://github.com/user-attachments/assets/c9f246aa-3074-41a3-886d-2a80c5774626" />

## What it shows

- **Forecast vs actual for a delivery day.** You pick the day and the decision cutoff (UK time, default
  09:20, when the EPEX GB day-ahead auction closes). The forecast shown is the newest one published before
  the cutoff on the day before delivery. The shaded band is where actual wind landed 80% of the time in
  January for a given forecast, and a marker shows the day's largest miss. The arrows step through days.
- **Accuracy across all January decisions.** Mean absolute error, RMSE, bias, the 10th–90th percentile error
  range and the largest single miss, which links straight to that day.
- **Error by delivery day.** Click a bar to open that day in the main chart.
- **Error by forecast horizon.** How error grows the further ahead a forecast is made, with the horizons
  your decision actually depends on shaded.

## How the numbers are worked out

- Actuals come from `FUELHH` (fuelType `WIND`), one value per 30-minute settlement period.
- Forecasts come from `WINDFOR`. A new forecast run is published about every 3 hours (8 a day) and each run
  covers roughly the next 3 days at hourly resolution, so the same hour gets forecast many times.
- For delivery day D the decision is made at the cutoff on D-1, and the forecast used is the latest run with
  `publishTime` at or before that moment.
- Forecasts are hourly, so errors are only measured on the on-the-hour settlement periods.
- `error = forecast - actual`. Positive means less wind turned up than forecast, so the desk would be short
  and have to buy the gap.

## Running it

### With Docker

```
docker compose up --build
```

Then open http://localhost:8000. The first load takes a few seconds while the data is fetched from Elexon.

### Without Docker

Backend (Python 3.13+):

```
cd backend
python -m venv .venv
.venv\Scripts\activate        # on macOS/Linux: source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload
```

Frontend (Node 20+), in a second terminal:

```
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173. Vite forwards `/api` requests to the backend on port 8000.

### Tests and lint

```
cd backend && pytest
cd frontend && npm run lint
```

## Deployment

The live app runs on Vercel. `vercel.json` builds the frontend into static files and sends every `/api/*`
request to `api/index.py`, a Python serverless function that loads the same FastAPI app from `backend/`.
The Dockerfile is for running the whole thing locally as one container.

## Project layout

```
backend/
  app/elexon.py        calls to the Elexon API
  app/analysis.py      picks the forecast used for each decision, error statistics
  app/main.py          FastAPI app: /api/day-ahead, /api/error-by-horizon, serves the built frontend
  tests/               pytest tests for analysis.py
  requirements.txt
frontend/
  src/App.jsx          page layout and data loading
  src/components/      header and controls, the day panel, charts and summary cards
  src/chartTheme.js    shared chart colours and tooltip/axis styling
  src/api.js           fetch helpers
  src/format.js        number and UK-time formatting
api/index.py           Vercel entry point, exposes the FastAPI app as a serverless function
vercel.json            Vercel build and routing config
Dockerfile             builds the frontend, then serves everything from one Python container
docker-compose.yml
```

## API

- `GET /api/day-ahead?cutoff=09:20` – every January delivery day with its points (actual and forecast), the
  forecast publish time used, and per-day plus overall error stats.
- `GET /api/error-by-horizon` – mean and 90th percentile absolute error for each hour of forecast horizon
  (0–48 h).
- Interactive docs at `/docs`.

## Use of AI tools

I used Claude Code while building this, for scaffolding, writing parts of
the code, checking the Elexon data and drafting this README. I reviewed and tested everything, and the
design decisions and analysis approach are mine to explain.
