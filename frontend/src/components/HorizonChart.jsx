import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { axis, colors, tooltip } from '../chartTheme'
import { formatMW, formatNumber } from '../format'

export default function HorizonChart({ buckets, highlight }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={buckets} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={colors.grid} vertical={false} />
        <XAxis
          dataKey="hours"
          type="number"
          domain={[0, 48]}
          ticks={[0, 6, 12, 18, 24, 30, 36, 42, 48]}
          tickFormatter={(h) => `${h}h`}
          tickMargin={10}
          {...axis}
        />
        <YAxis tickFormatter={formatNumber} width={52} {...axis} />
        <Tooltip
          {...tooltip}
          cursor={{ stroke: colors.cursor, strokeDasharray: '3 3' }}
          labelFormatter={(h) => `${h}–${h + 1} hours ahead`}
          formatter={formatMW}
        />
        {highlight && (
          <ReferenceArea
            x1={highlight[0]}
            x2={highlight[1]}
            fill={colors.forecast}
            fillOpacity={0.07}
            stroke={colors.forecast}
            strokeOpacity={0.35}
            strokeDasharray="4 4"
            label={{ value: 'your decision window', position: 'insideTop', fill: colors.forecast, fontSize: 11 }}
          />
        )}
        <Line
          dataKey="mae"
          name="Mean absolute error"
          stroke={colors.actual}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
        <Line
          dataKey="p90"
          name="90th percentile"
          stroke={colors.error}
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
