// The API sends UTC timestamps; the desk thinks in UK time.
const uk = { timeZone: 'Europe/London' }

const time = new Intl.DateTimeFormat('en-GB', { ...uk, hour: '2-digit', minute: '2-digit' })
const day = new Intl.DateTimeFormat('en-GB', { ...uk, weekday: 'short', day: 'numeric', month: 'short' })
const shortDay = new Intl.DateTimeFormat('en-GB', { ...uk, day: 'numeric', month: 'short' })
const number = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 })
const signed = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0, signDisplay: 'exceptZero' })

export const formatTime = (iso) => time.format(new Date(iso))
export const formatDay = (iso) => day.format(new Date(iso))
export const formatShortDay = (iso) => shortDay.format(new Date(iso))
export const formatDateTime = (iso) => `${formatShortDay(iso)} ${formatTime(iso)}`

export const formatNumber = (value) => number.format(value)
export const formatSigned = (value) => signed.format(value)
export const formatMW = (value) => `${number.format(value)} MW`
export const formatSignedMW = (value) => `${signed.format(value)} MW`
