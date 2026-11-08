/** Two digits: 7 → "07". */
export const pad2 = (n: number): string => String(n).padStart(2, '0')

/** A countdown as minutes and seconds, rounded up so it never shows 00:00 while time is left: 61 000 ms → "01:01". */
export function formatCountdown(ms: number): string {
  const s = Math.ceil(ms / 1000)
  return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`
}

/** Local time as "hh:mm". */
export const formatTime = (d: Date): string => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`

/** The local calendar day as "yyyy-mm-dd". */
export const formatDateKey = (d: Date): string => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

const weekdayFormat: Record<string, Intl.DateTimeFormat> = {}

/** Short weekday and day.month in the app's language: "Lun 05.01" / "Mon 05.01". */
export function formatDay(d: Date, lang: 'es' | 'en' = 'es'): string {
  const fmt = (weekdayFormat[lang] ??= new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-GB', { weekday: 'short' }))
  const wd = fmt.format(d).replace('.', '')
  return `${wd[0].toUpperCase()}${wd.slice(1)} ${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}`
}
