import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { axis, colors, tooltip } from '../chartTheme'
import { formatMW, formatNumber, formatTime } from '../format'

export default function DayChart({ points, p10, p90, worstTime }) {
  const data = points.map((p) => ({
    time: formatTime(p.time),
    actual: p.actual,
    forecast: p.forecast,
    // error = forecast - actual, so 80% of the time actual sat between forecast - p90 and forecast - p10
    range: p.forecast == null ? null : [Math.max(p.forecast - p90, 0), p.forecast - p10],
  }))
  // a label every 3 hours, or every 6 on phones so they don't run into each other
  const tickInterval = window.innerWidth < 600 ? 11 : 5

  return (
    <ResponsiveContainer width="100%" height={340}>
      <ComposedChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="range-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.actual} stopOpacity={0.2} />
            <stop offset="100%" stopColor={colors.actual} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={colors.grid} vertical={false} />
        <XAxis dataKey="time" interval={tickInterval} tickMargin={10} {...axis} />
        {/* round the top up to a multiple of 4,000 so the five ticks land on whole thousands */}
        <YAxis domain={[0, (max) => Math.ceil(max / 4000) * 4000]} tickFormatter={formatNumber} width={52} {...axis} />
        <Tooltip
          {...tooltip}
          cursor={{ stroke: colors.cursor, strokeDasharray: '3 3' }}
          formatter={(value) =>
            Array.isArray(value) ? `${formatNumber(value[0])} – ${formatMW(value[1])}` : formatMW(value)
          }
        />
        {worstTime && (
          <ReferenceLine
            x={formatTime(worstTime)}
            stroke={colors.error}
            strokeDasharray="3 4"
            label={{ value: 'largest miss', position: 'insideTopLeft', fill: colors.error, fontSize: 11 }}
          />
        )}
        <Area dataKey="range" name="80% range" stroke="none" fill="url(#range-fill)" activeDot={false} connectNulls />
        <Line
          dataKey="forecast"
          name="Forecast"
          stroke={colors.forecast}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
          connectNulls
        />
        <Line
          dataKey="actual"
          name="Actual"
          stroke={colors.actual}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
