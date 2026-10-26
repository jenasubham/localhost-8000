import { useEffect, useState } from 'react'
import { fetchDayAhead } from './api'
import DayChart from './components/DayChart'
import Summary from './components/Summary'
import { formatDateTime, formatDay, formatMW, formatSignedMW, formatTime } from './format'

export default function App() {
  const [cutoff, setCutoff] = useState('09:20')
  const [dayAhead, setDayAhead] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false // drop responses for a cutoff the user has already moved away from
    fetchDayAhead(cutoff)
      .then((data) => {
        if (ignore) return
        setDayAhead(data)
        setSelectedDate((current) => current ?? data.days.at(-1).date)
      })
      .catch((err) => {
        if (!ignore) setError(err.message)
      })
    return () => {
      ignore = true
    }
  }, [cutoff])

  if (error) return <p className="message error">{error}</p>
  if (!dayAhead) return <p className="message">Loading January data from Elexon…</p>

  const day = dayAhead.days.find((d) => d.date === selectedDate)

  return (
    <div className="page">
      <header>
        <div>
          <h1>Wind Forecast Monitor</h1>
          <p>GB national wind generation · day-ahead purchase decisions made in January 2026</p>
        </div>
        <div className="controls">
          <label>
            Decision cutoff (UK time)
            <input type="time" value={cutoff} onChange={(e) => e.target.value && setCutoff(e.target.value)} />
          </label>
          <label>
            Delivery day
            <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
              {dayAhead.days.map((d) => (
                <option key={d.date} value={d.date}>
                  {formatDay(d.date)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <section className="card">
        <h2>Wind forecast vs actual, {formatDay(day.date)}</h2>
        <p className="caption">
          Decision at {formatDateTime(day.decisionTime)},{' '}
          {day.forecastPublished
            ? `using the latest forecast out by then (published ${formatDateTime(day.forecastPublished)}).`
            : 'before any forecast for this day was published.'}{' '}
          The band shows where actual wind landed 80% of the time in January for a given forecast. Values in MW.
        </p>
        <DayChart points={day.points} p10={dayAhead.summary.p10} p90={dayAhead.summary.p90} />
        {day.summary && (
          <p className="day-stats">
            This day: mean absolute error {formatMW(day.summary.mae)}, bias {formatSignedMW(day.summary.bias)},
            largest miss {formatSignedMW(day.summary.worst.error)} at {formatTime(day.summary.worst.time)}.
          </p>
        )}
      </section>

      <section className="card">
        <h2>How accurate is the day-ahead forecast?</h2>
        <p className="caption">
          Across all 31 decisions made at {cutoff}. Error is forecast minus actual, so a positive error means less
          wind turned up than forecast and the shortfall had to be bought elsewhere.
        </p>
        <Summary stats={dayAhead.summary} />
      </section>

      <footer>Data: Elexon BMRS, FUELHH (wind outturn) and WINDFOR (wind forecast).</footer>
    </div>
  )
}
