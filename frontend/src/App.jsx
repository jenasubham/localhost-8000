import { useEffect, useState } from 'react'
import { fetchDayAhead, fetchErrorByHorizon } from './api'
import { colors } from './chartTheme'
import ChartLegend from './components/ChartLegend'
import DailyErrorChart from './components/DailyErrorChart'
import DayPanel from './components/DayPanel'
import Header from './components/Header'
import HorizonChart from './components/HorizonChart'
import Summary from './components/Summary'
import { ukDate } from './format'

export default function App() {
  const [cutoff, setCutoff] = useState('09:20')
  const [dayAhead, setDayAhead] = useState(null)
  const [horizon, setHorizon] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchErrorByHorizon()
      .then(setHorizon)
      .catch((err) => setError(err.message))
  }, [])

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

  if (error) {
    return (
      <div className="status">
        <p className="status-error">{error}</p>
      </div>
    )
  }
  if (!dayAhead) {
    return (
      <div className="status">
        <span className="spinner" />
        Loading January data from Elexon…
      </div>
    )
  }

  const day = dayAhead.days.find((d) => d.date === selectedDate)
  const leadHours = hoursAhead(day)

  const openDayOf = (time) => {
    setSelectedDate(ukDate(time))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="page">
      <Header
        cutoff={cutoff}
        onCutoffChange={setCutoff}
        days={dayAhead.days}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <main>
        <DayPanel day={day} p10={dayAhead.summary.p10} p90={dayAhead.summary.p90} leadHours={leadHours} />

        <section className="accuracy">
          <div className="section-head">
            <h2>January accuracy</h2>
            <p>
              All 31 day-ahead decisions at the {cutoff} cutoff. Error is forecast minus actual, so a positive number
              means less wind turned up than forecast and the gap had to be bought.
            </p>
          </div>
          <Summary stats={dayAhead.summary} onOpenDay={openDayOf} />
        </section>

        <div className="columns">
          <section className="card">
            <div className="card-head">
              <div>
                <h2>Error by delivery day</h2>
                <p>Mean absolute error of each day's forecast, in MW. Click a bar to open that day.</p>
              </div>
            </div>
            <DailyErrorChart days={dayAhead.days} selectedDate={selectedDate} onSelect={setSelectedDate} />
          </section>

          <section className="card">
            <div className="card-head">
              <div>
                <h2>Error by forecast horizon</h2>
                <p>All January forecasts by how far ahead they were made, in MW.</p>
              </div>
              <ChartLegend
                items={[
                  { label: 'Mean absolute error', color: colors.actual },
                  { label: '90th percentile', color: colors.error, kind: 'dashed' },
                ]}
              />
            </div>
            <HorizonChart buckets={horizon} highlight={leadHours} />
          </section>
        </div>
      </main>

      <footer>All times are UK time</footer>
    </div>
  )
}

// Whole hours between the forecast's publish time and the first/last hour it covers on this day.
function hoursAhead(day) {
  if (!day.forecastPublished) return null
  const published = new Date(day.forecastPublished)
  const hours = day.points
    .filter((p) => p.forecast != null)
    .map((p) => Math.floor((new Date(p.time) - published) / 3_600_000))
  return [Math.min(...hours), Math.max(...hours)]
}
