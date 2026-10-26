import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatDay, formatMW, formatNumber, formatShortDay } from '../format'

export default function DailyErrorChart({ days, selectedDate, onSelect }) {
  const data = days.map((d) => ({ date: d.date, mae: d.summary?.mae }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="#e5e7eb" vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatShortDay} tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={formatNumber} tick={{ fontSize: 12 }} width={56} />
        <Tooltip
          labelFormatter={formatDay}
          formatter={(value) => [formatMW(value), 'Mean absolute error']}
          cursor={{ fill: '#f1f5f9' }}
        />
        <Bar dataKey="mae" cursor="pointer" onClick={(bar) => onSelect(bar.payload.date)}>
          {data.map((d) => (
            <Cell key={d.date} fill={d.date === selectedDate ? '#2563eb' : '#93c5fd'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
