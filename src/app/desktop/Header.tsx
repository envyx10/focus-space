import type { ReactNode } from 'react'
import { useI18n } from '@/i18n'
import type { TimerStatus } from '@/features/timer/useTimer'
import Weather from '@/features/weather/Weather'
import type { Now } from '@/features/weather/api'
import './header.css'
import { formatDay, pad2 } from '@/shared/lib/format'

type Props = { sessionNumber: number; now: Date; weather?: Now | null; status?: TimerStatus; muteSlot?: ReactNode; settingsSlot?: ReactNode; accountSlot: ReactNode }

export default function Header({ sessionNumber, now, weather = null, status = 'idle', muteSlot, settingsSlot, accountSlot }: Props) {
  const { t, lang } = useI18n()
  return (
    <div className="hd">
      <span className="hd-brand">Focus/Space</span>
      <span className="hd-session">
        {t('header.session', { n: pad2(sessionNumber) })} — <span className={status === 'running' ? 'acc' : 'hd-idle'}>{t(`status.${status}`)}</span>
      </span>
      <span className="hd-date">
        {formatDay(now, lang)} <Weather now={weather} />
      </span>
      <span className="hd-account">
        {muteSlot}
        {settingsSlot}
        {accountSlot}
      </span>
    </div>
  )
}
