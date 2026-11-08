import { useT } from '@/i18n'
import { formatCountdown, formatTime, pad2 } from '@/shared/lib/format'

type Props = {
  className: string
  /** Show the local time instead of the countdown. */
  showTime: boolean
  remainingMs: number
  now: Date
}

/** The big digits: minutes and seconds left, or hours and minutes of the local time with its seconds raised. */
export default function ClockDigits({ className, showTime, remainingMs, now }: Props) {
  const t = useT()
  const [big, small] = showTime ? [pad2(now.getHours()), pad2(now.getMinutes())] : formatCountdown(remainingMs).split(':')
  const label = showTime ? t('focus.nowIs', { time: formatTime(now) }) : t('focus.clockLabel', { min: big, sec: small })
  return (
    <div className={className} role="timer" aria-label={label}>
      <span data-part="min">{big}</span>
      <span className="colon" aria-hidden>
        <i />
        <i />
      </span>
      <span data-part="sec" className="sec">
        {small}
      </span>
      <sup>{showTime ? pad2(now.getSeconds()) : t('focus.unitMin')}</sup>
    </div>
  )
}
