import { useEffect, useState } from 'react'
import { fetchDayAhead } from './api'
import Summary from './components/Summary'

export default function App() {
  const [cutoff, setCutoff] = useState('09:20')
  const [dayAhead, setDayAhead] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false // drop responses for a cutoff the user has already moved away from
    fetchDayAhead(cutoff)
      .then((data) => {
        if (!ignore) setDayAhead(data)
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
        </div>
      </header>

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
