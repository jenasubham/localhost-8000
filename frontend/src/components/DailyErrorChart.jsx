import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { axis, colors, tooltip } from '../chartTheme'
import { formatDay, formatMW, formatNumber, formatShortDay } from '../format'

export default function DailyErrorChart({ days, selectedDate, onSelect }) {
  const data = days.map((d) => ({ date: d.date, mae: d.summary?.mae }))

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={colors.grid} vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatShortDay} tickMargin={10} minTickGap={16} {...axis} />
        <YAxis tickFormatter={formatNumber} width={52} {...axis} />
        <Tooltip
          {...tooltip}
          itemStyle={{ ...tooltip.itemStyle, color: colors.actual }}
          cursor={{ fill: colors.cursorFill }}
          labelFormatter={formatDay}
          formatter={(value) => [formatMW(value), 'Mean absolute error']}
        />
        <Bar
          dataKey="mae"
          radius={[3, 3, 0, 0]}
          maxBarSize={22}
          cursor="pointer"
          onClick={(bar) => onSelect(bar.payload.date)}
        >
          {data.map((d) => (
            <Cell key={d.date} fill={d.date === selectedDate ? colors.actual : colors.bar} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
