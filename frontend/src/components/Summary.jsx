import { formatDateTime, formatNumber, formatSigned } from '../format'

export default function Summary({ stats, onOpenDay }) {
  const runsHigh = stats.bias > 0

  return (
    <div className="stats">
      <Stat label="Mean absolute error" note="Typical miss in any hour">
        {formatNumber(stats.mae)}
      </Stat>
      <Stat
        label="Bias"
        note={
          <span className={runsHigh ? 'short' : 'long'}>
            {runsHigh ? 'Forecast runs high' : 'Forecast runs low'}
          </span>
        }
      >
        {formatSigned(stats.bias)}
      </Stat>
      <Stat label="RMSE" note="Weights big misses more">
        {formatNumber(stats.rmse)}
      </Stat>
      <Stat label="80% of errors within" note="10th to 90th percentile" compact>
        {formatSigned(stats.p10)} <span className="to">to</span> {formatSigned(stats.p90)}
      </Stat>
      <Stat
        label="Largest miss"
        note={
          <>
            {formatDateTime(stats.worst.time)},{' '}
            <button type="button" className="link" onClick={() => onOpenDay(stats.worst.time)}>
              view that day
            </button>
          </>
        }
      >
        {formatSigned(stats.worst.error)}
      </Stat>
    </div>
  )
}

// `compact` is for the two-number range, which doesn't fit on one line at full size
function Stat({ label, note, compact = false, children }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className={compact ? 'stat-value compact' : 'stat-value'}>
        {children}
        <span className="unit">MW</span>
      </div>
      <div className="stat-note">{note}</div>
    </div>
  )
}
