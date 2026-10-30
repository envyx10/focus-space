import type { ReactNode } from 'react'
import './header.css'

type Props = { sessionNumber: number; now: Date; accountSlot: ReactNode }

const weekday = new Intl.DateTimeFormat('es-ES', { weekday: 'short' })

export function formatDay(d: Date): string {
  const wd = weekday.format(d).replace('.', '')
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${wd[0].toUpperCase()}${wd.slice(1)} ${dd}.${mm}`
}

export default function Header({ sessionNumber, now, accountSlot }: Props) {
  return (
    <div className="hd">
      <span className="hd-brand">Focus/Space</span>
      <span className="hd-session">
        Sesión {String(sessionNumber).padStart(2, '0')} — <span className="acc">En curso</span>
      </span>
      <span className="hd-date">{formatDay(now)}</span>
      <span className="hd-account">{accountSlot}</span>
    </div>
  )
}
