// Recharts takes colours and text styles as props rather than CSS, so they live here.
export const colors = {
  actual: '#5cc8ff',
  forecast: '#f5b544',
  error: '#ff8a7a',
  bar: 'rgba(92, 200, 255, 0.28)',
  grid: 'rgba(148, 163, 184, 0.1)',
  cursor: 'rgba(148, 163, 184, 0.35)',
  cursorFill: 'rgba(148, 163, 184, 0.06)',
}

export const axis = {
  axisLine: false,
  tickLine: false,
  tick: { fill: '#74829a', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" },
}

export const tooltip = {
  itemSorter: 'dataKey',
  contentStyle: {
    background: '#0c111b',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: 8,
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
    fontSize: 12,
    padding: '8px 12px',
  },
  labelStyle: { color: '#e6ebf2', fontWeight: 500, marginBottom: 4 },
  itemStyle: { padding: '1px 0' },
}
