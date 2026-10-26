import { formatDay } from '../format'

export default function Header({ cutoff, onCutoffChange, days, selectedDate, onSelectDate }) {
  const index = days.findIndex((d) => d.date === selectedDate)
  const step = (offset) => onSelectDate(days[index + offset].date)

  return (
    <header className="header">
      <div className="brand">
        <h1>Wind Forecast Monitor</h1>
        <p>GB national wind, day-ahead purchase decisions for January 2026</p>
      </div>

      <div className="controls">
        <label className="field">
          <span className="field-label">Decision cutoff (UK)</span>
          <input type="time" value={cutoff} onChange={(e) => e.target.value && onCutoffChange(e.target.value)} />
        </label>

        <div className="field">
          <span className="field-label" id="delivery-day">
            Delivery day
          </span>
          <div className="day-picker">
            <button type="button" aria-label="Previous day" disabled={index <= 0} onClick={() => step(-1)}>
              <Chevron points="10 3.5 5.5 8 10 12.5" />
            </button>
            <select aria-labelledby="delivery-day" value={selectedDate} onChange={(e) => onSelectDate(e.target.value)}>
              {days.map((d) => (
                <option key={d.date} value={d.date}>
                  {formatDay(d.date)}
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-label="Next day"
              disabled={index === days.length - 1}
              onClick={() => step(1)}
            >
              <Chevron points="6 3.5 10.5 8 6 12.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

function Chevron({ points }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <polyline points={points} />
    </svg>
  )
}
