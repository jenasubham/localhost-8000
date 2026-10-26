import { colors } from '../chartTheme'
import { formatDateTime, formatDay, formatMW, formatSignedMW, formatTime } from '../format'
import ChartLegend from './ChartLegend'
import DayChart from './DayChart'

export default function DayPanel({ day, p10, p90, leadHours }) {
  const stats = day.summary

  return (
    <section className="card">
      <div className="card-head">
        <div>
          <h2>
            Forecast vs actual <span className="dim">for {formatDay(day.date)}</span>
          </h2>
          <p className="meta">
            Decided <strong>{formatDateTime(day.decisionTime)}</strong>
            {day.forecastPublished ? (
              <>
                {' '}
                using the forecast published <strong>{formatDateTime(day.forecastPublished)}</strong>, made{' '}
                {leadHours[0]} to {leadHours[1] + 1} hours ahead of delivery.
              </>
            ) : (
              ', before any forecast for this day was published.'
            )}
          </p>
        </div>
        <ChartLegend
          items={[
            { label: 'Actual', color: colors.actual },
            { label: 'Forecast', color: colors.forecast },
            { label: '80% range', color: colors.actual, kind: 'band' },
          ]}
        />
      </div>

      <DayChart points={day.points} p10={p10} p90={p90} worstTime={stats?.worst.time} />

      <div className="day-foot">
        {stats && (
          <dl className="day-stats">
            <div>
              <dt>Mean absolute error</dt>
              <dd>{formatMW(stats.mae)}</dd>
            </div>
            <div>
              <dt>Bias</dt>
              <dd>{formatSignedMW(stats.bias)}</dd>
            </div>
            <div>
              <dt>Largest miss</dt>
              <dd>
                {formatSignedMW(stats.worst.error)} <span className="dim">at {formatTime(stats.worst.time)}</span>
              </dd>
            </div>
          </dl>
        )}
        <p className="footnote">
          The 80% range is where actual wind landed in 80% of January hours, relative to the forecast.
        </p>
      </div>
    </section>
  )
}
