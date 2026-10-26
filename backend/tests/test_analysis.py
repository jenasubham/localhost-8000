from datetime import date, datetime, time, timezone

import pytest

from app import analysis


def jan(day, hour, minute=0):
    return datetime(2026, 1, day, hour, minute, tzinfo=timezone.utc)


def test_half_hours_follow_uk_clock_changes():
    assert len(analysis.half_hours(date(2026, 1, 16))) == 48
    assert len(analysis.half_hours(date(2026, 3, 29))) == 46
    assert len(analysis.half_hours(date(2026, 10, 25))) == 50


def test_decision_is_made_the_day_before_in_uk_time():
    assert analysis.decision_time(date(2026, 1, 16), time(9, 20)) == jan(15, 9, 20)
    # BST in summer, so 09:20 in London is 08:20 UTC
    assert analysis.decision_time(date(2026, 7, 16), time(9, 20)) == datetime(
        2026, 7, 15, 8, 20, tzinfo=timezone.utc
    )


def test_latest_run_ignores_runs_published_after_the_decision():
    runs = {jan(15, 4, 30): {}, jan(15, 7, 30): {}, jan(15, 9, 30): {}}
    assert analysis.latest_run(runs, jan(15, 9, 20)) == jan(15, 7, 30)
    assert analysis.latest_run(runs, jan(15, 9, 30)) == jan(15, 9, 30)
    assert analysis.latest_run(runs, jan(15, 3, 0)) is None


def test_day_ahead_uses_the_forecast_available_at_cutoff():
    runs = {
        jan(15, 7, 30): {jan(16, 0): 5000, jan(16, 1): 5200},
        jan(15, 9, 30): {jan(16, 0): 9999, jan(16, 1): 9999},  # too late for a 09:20 decision
    }
    actuals = {jan(16, 0): 4800, jan(16, 0, 30): 4900, jan(16, 1): 5300}

    result = analysis.day_ahead(actuals, runs, date(2026, 1, 16), time(9, 20))

    assert result["decisionTime"] == jan(15, 9, 20)
    assert result["forecastPublished"] == jan(15, 7, 30)
    assert result["points"][:3] == [
        {"time": jan(16, 0), "actual": 4800, "forecast": 5000},
        {"time": jan(16, 0, 30), "actual": 4900, "forecast": None},
        {"time": jan(16, 1), "actual": 5300, "forecast": 5200},
    ]
    assert analysis.forecast_errors(result["points"]) == [(jan(16, 0), 200), (jan(16, 1), -100)]


def test_day_ahead_without_any_earlier_run_has_no_forecast():
    runs = {jan(16, 7, 30): {jan(16, 12): 5000}}
    result = analysis.day_ahead({}, runs, date(2026, 1, 16), time(9, 20))
    assert result["forecastPublished"] is None
    assert all(p["forecast"] is None for p in result["points"])


def test_summarise():
    stats = analysis.summarise(
        [(jan(16, 0), -100), (jan(16, 1), 0), (jan(16, 2), 100), (jan(16, 3), 200)]
    )
    assert stats["mae"] == 100
    assert stats["bias"] == 50
    assert stats["rmse"] == pytest.approx(122.47, abs=0.01)
    assert stats["p10"] == pytest.approx(-70)
    assert stats["p90"] == pytest.approx(170)
    assert stats["worst"] == {"time": jan(16, 3), "error": 200}
    assert analysis.summarise([]) is None


def test_error_by_horizon_groups_by_whole_hours_ahead():
    published = jan(15, 22, 30)
    runs = {published: {jan(15, 21): 100, jan(15, 23): 500, jan(16, 0): 700, jan(16, 1): 900}}
    actuals = {jan(15, 21): 0, jan(15, 23): 400, jan(16, 0): 550, jan(16, 1): 1000}

    result = analysis.error_by_horizon(actuals, runs)

    # 21:00 is before the publish time so it's dropped, the rest are 0.5h, 1.5h and 2.5h ahead
    assert [(r["hours"], r["mae"]) for r in result] == [(0, 100), (1, 150), (2, 100)]
