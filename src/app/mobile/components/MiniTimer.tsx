import { phaseName } from '@/app/mobile/labels'
import { haptic } from '@/app/mobile/platform'
import type { Timer } from '@/features/timer/useTimer'
import { useT } from '@/i18n'
import { formatCountdown } from '@/shared/lib/format'
import Icon from '@/shared/ui/Icon'

type Props = {
  timer: Timer
  /** Back to the Focus tab. */
  onOpen: () => void
}

/** The running (or paused) timer kept in sight above the tab bar while another tab is open. */
export default function MiniTimer({ timer, onOpen }: Props) {
  const t = useT()
  const countdown = formatCountdown(timer.remainingMs)
  const phase = phaseName(t, timer.state.mode, timer.state.phase)

  const toggle = () => {
    haptic(8)
    if (timer.running) timer.pause()
    else timer.start()
  }

  return (
    <div className={`m-mini${timer.running ? ' is-running' : ''}`}>
      <button className="m-mini-main" onClick={onOpen} aria-label={t('m.backToTimer', { phase, time: countdown })}>
        <span className="m-mini-dot" aria-hidden />
        <span className="m-mini-phase">{phase}</span>
        <span className="m-mini-time">{countdown}</span>
      </button>
      <button className="m-mini-btn" onClick={toggle} aria-label={timer.running ? t('focus.pause') : t('focus.resume')}>
        <Icon name={timer.running ? 'pause' : 'play'} />
      </button>
    </div>
  )
}
