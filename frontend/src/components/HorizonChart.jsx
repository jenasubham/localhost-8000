import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatMW, formatNumber } from '../format'

export default function HorizonChart({ buckets, highlight }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={buckets} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="#e5e7eb" vertical={false} />
        <XAxis
          dataKey="hours"
          type="number"
          domain={[0, 48]}
          ticks={[0, 6, 12, 18, 24, 30, 36, 42, 48]}
          tickFormatter={(h) => `${h}h`}
          tick={{ fontSize: 12 }}
        />
        <YAxis tickFormatter={formatNumber} tick={{ fontSize: 12 }} width={56} />
        <Tooltip labelFormatter={(h) => `${h} to ${h + 1} hours ahead`} formatter={formatMW} />
        <Legend itemSorter="dataKey" formatter={(name) => <span className="legend-label">{name}</span>} />
        {highlight && <ReferenceArea x1={highlight[0]} x2={highlight[1]} fill="#fde68a" fillOpacity={0.35} />}
        <Line dataKey="mae" name="Mean absolute error" legendType="plainline" stroke="#2563eb" strokeWidth={2} dot={false} />
        <Line dataKey="p90" name="90th percentile" legendType="plainline" stroke="#d97706" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
