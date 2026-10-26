export default function ChartLegend({ items }) {
  return (
    <ul className="legend">
      {items.map((item) => (
        <li key={item.label}>
          <span className={`swatch ${item.kind ?? 'line'}`} style={{ '--color': item.color }} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}
