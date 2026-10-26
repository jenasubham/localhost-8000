async function getJson(url) {
  const response = await fetch(url)
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const detail = typeof body?.detail === 'string' ? body.detail : null
    throw new Error(detail ?? `Request failed with status ${response.status}`)
  }
  return response.json()
}

export const fetchDayAhead = (cutoff) => getJson(`/api/day-ahead?${new URLSearchParams({ cutoff })}`)

export const fetchErrorByHorizon = () => getJson('/api/error-by-horizon')
