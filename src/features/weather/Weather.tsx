import { useT } from '@/i18n'
import { sky, type Now } from './api'

/** "18° · Clear", or nothing until the weather is known. */
export default function Weather({ now }: { now: Now | null }) {
  const t = useT()
  if (!now) return null
  const label = t(`weather.${sky(now.code)}`)
  return (
    <span className="hd-weather" title={label}>
      {now.temp}° · {label}
    </span>
  )
}
