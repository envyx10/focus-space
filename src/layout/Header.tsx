import type { ReactNode } from 'react'
import { useI18n } from '../i18n'
import type { TimerStatus } from '../timer/useTimer'
import Weather from './Weather'
import './header.css'

type Props = { sessionNumber: number; now: Date; status?: TimerStatus; muteSlot?: ReactNode; settingsSlot?: ReactNode; accountSlot: ReactNode }

const weekdayFormat: Record<string, Intl.DateTimeFormat> = {}

export function formatDay(d: Date, lang: 'es' | 'en' = 'es'): string {
  const fmt = (weekdayFormat[lang] ??= new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-GB', { weekday: 'short' }))
  const wd = fmt.format(d).replace('.', '')
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${wd[0].toUpperCase()}${wd.slice(1)} ${dd}.${mm}`
}

export default function Header({ sessionNumber, now, status = 'idle', muteSlot, settingsSlot, accountSlot }: Props) {
  const { t, lang } = useI18n()
  return (
    <div className="hd">
      <span className="hd-brand">Focus/Space</span>
      <span className="hd-session">
        {t('header.session', { n: String(sessionNumber).padStart(2, '0') })} — <span className={status === 'running' ? 'acc' : 'hd-idle'}>{t(`status.${status}`)}</span>
      </span>
      <span className="hd-date">
        {formatDay(now, lang)} <Weather />
      </span>
      <span className="hd-account">
        {muteSlot}
        {settingsSlot}
        {accountSlot}
      </span>
    </div>
  )
}
