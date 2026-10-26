import { Area, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatMW, formatNumber, formatTime } from '../format'

export default function DayChart({ points, p10, p90 }) {
  const data = points.map((p) => ({
    time: formatTime(p.time),
    actual: p.actual,
    forecast: p.forecast,
    // error = forecast - actual, so 80% of the time actual sat between forecast - p90 and forecast - p10
    range: p.forecast == null ? null : [Math.max(p.forecast - p90, 0), p.forecast - p10],
  }))

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="#e5e7eb" vertical={false} />
        <XAxis dataKey="time" interval={5} tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={formatNumber} tick={{ fontSize: 12 }} width={56} />
        <Tooltip formatter={(value) => (Array.isArray(value) ? value.map(formatMW).join(' to ') : formatMW(value))} />
        <Legend formatter={(name) => <span className="legend-label">{name}</span>} />
        <Area
          dataKey="range"
          name="Likely range (80%)"
          legendType="square"
          stroke="none"
          fill="#bfdbfe"
          fillOpacity={0.7}
          connectNulls
        />
        <Line
          dataKey="forecast"
          name="Forecast"
          legendType="plainline"
          stroke="#2563eb"
          strokeWidth={2}
          dot={false}
          connectNulls
        />
        <Line dataKey="actual" name="Actual" legendType="plainline" stroke="#111827" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
