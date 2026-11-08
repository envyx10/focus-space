import { useT } from '@/i18n'

const STEP = 5
const MAX = 240

type Props = {
  className: string
  minutes: number
  onChange: (minutes: number) => void
}

/** Free mode's length, in steps of five minutes. */
export default function FreeMinutesStepper({ className, minutes, onChange }: Props) {
  const t = useT()
  return (
    <div className={className} role="group" aria-label={t('focus.minutes')}>
      <button aria-label={t('focus.lessMinutes')} onClick={() => onChange(Math.max(1, minutes - STEP))}>
        −
      </button>
      <span>{t('focus.min', { n: minutes })}</span>
      <button aria-label={t('focus.moreMinutes')} onClick={() => onChange(Math.min(MAX, minutes + STEP))}>
        +
      </button>
    </div>
  )
}
