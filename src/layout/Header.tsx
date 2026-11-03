import type { ReactNode } from 'react'
import type { TimerStatus } from '../timer/useTimer'
import './header.css'

type Props = { sessionNumber: number; now: Date; status?: TimerStatus; settingsSlot?: ReactNode; accountSlot: ReactNode }

const weekday = new Intl.DateTimeFormat('es-ES', { weekday: 'short' })

export function formatDay(d: Date): string {
  const wd = weekday.format(d).replace('.', '')
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${wd[0].toUpperCase()}${wd.slice(1)} ${dd}.${mm}`
}

const STATUS: Record<TimerStatus, string> = { running: 'En curso', paused: 'En pausa', waiting: 'Listo para seguir', idle: 'Parado' }

export default function Header({ sessionNumber, now, status = 'idle', settingsSlot, accountSlot }: Props) {
  return (
    <div className="hd">
      <span className="hd-brand">Focus/Space</span>
      <span className="hd-session">
        Sesión {String(sessionNumber).padStart(2, '0')} — <span className={status === 'running' ? 'acc' : 'hd-idle'}>{STATUS[status]}</span>
      </span>
      <span className="hd-date">{formatDay(now)}</span>
      <span className="hd-account">
        {settingsSlot}
        {accountSlot}
      </span>
    </div>
  )
}
