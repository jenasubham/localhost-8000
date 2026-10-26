import { formatDateTime, formatMW, formatSigned, formatSignedMW } from '../format'

export default function Summary({ stats }) {
  return (
    <div className="stats">
      <Stat label="Mean absolute error" value={formatMW(stats.mae)} note="typical miss in any hour" />
      <Stat
        label="Bias"
        value={formatSignedMW(stats.bias)}
        note={stats.bias > 0 ? 'forecast runs high on average' : 'forecast runs low on average'}
      />
      <Stat label="RMSE" value={formatMW(stats.rmse)} note="weights big misses more" />
      <Stat
        label="Middle 80% of errors"
        value={`${formatSigned(stats.p10)} to ${formatSignedMW(stats.p90)}`}
        note="10th to 90th percentile"
      />
      <Stat label="Largest miss" value={formatSignedMW(stats.worst.error)} note={formatDateTime(stats.worst.time)} />
    </div>
  )
}

function Stat({ label, value, note }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-note">{note}</div>
    </div>
  )
}
