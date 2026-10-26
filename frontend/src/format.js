// The API sends UTC timestamps; the desk thinks in UK time.
const uk = { timeZone: 'Europe/London' }

const time = new Intl.DateTimeFormat('en-GB', { ...uk, hour: '2-digit', minute: '2-digit' })
const day = new Intl.DateTimeFormat('en-GB', { ...uk, weekday: 'short', day: 'numeric', month: 'short' })
const shortDay = new Intl.DateTimeFormat('en-GB', { ...uk, day: 'numeric', month: 'short' })
// en-CA writes dates as YYYY-MM-DD, the same shape the API uses for delivery days
const isoDay = new Intl.DateTimeFormat('en-CA', { ...uk, year: 'numeric', month: '2-digit', day: '2-digit' })
const number = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 })
const signed = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0, signDisplay: 'exceptZero' })

// a real minus sign is the same width as the plus sign, so signed numbers line up
const minus = (text) => text.replace('-', '−')

export const formatTime = (iso) => time.format(new Date(iso))
export const formatDay = (iso) => day.format(new Date(iso))
export const formatShortDay = (iso) => shortDay.format(new Date(iso))
export const formatDateTime = (iso) => `${formatShortDay(iso)} ${formatTime(iso)}`
export const ukDate = (iso) => isoDay.format(new Date(iso))

export const formatNumber = (value) => minus(number.format(value))
export const formatSigned = (value) => minus(signed.format(value))
export const formatMW = (value) => `${formatNumber(value)} MW`
export const formatSignedMW = (value) => `${formatSigned(value)} MW`
