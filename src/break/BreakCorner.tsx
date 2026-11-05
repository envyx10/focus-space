import { lazy, Suspense, useEffect, useState } from 'react'
import { useT } from '../i18n'
import Icon from '../lib/Icon'
import './break.css'

const BreathGame = lazy(() => import('./BreathGame'))

const ENDED_MS = 2500

type Props = {
  /** A Pomodoro break is on (running or paused). */
  inBreak: boolean
  /** Changes with every break, so dismissing one doesn't hide the next. */
  breakId: string
  remaining: string
}

/** During a break: a quiet invite to the breathing game, and the game itself. */
export default function BreakCorner({ inBreak, breakId, remaining }: Props) {
  const t = useT()
  const [dismissed, setDismissed] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  // Break over while playing: say so, then close on its own.
  useEffect(() => {
    if (inBreak || !open) return
    const id = setTimeout(() => setOpen(false), ENDED_MS)
    return () => clearTimeout(id)
  }, [inBreak, open])

  if (open)
    return (
      <Suspense fallback={null}>
        <BreathGame remaining={remaining} ended={!inBreak} onClose={() => setOpen(false)} />
      </Suspense>
    )

  if (!inBreak || dismissed === breakId) return null
  return (
    <div className="br-invite" role="status">
      <button className="br-invite-go" onClick={() => setOpen(true)}>
        {t('break.invite')}
      </button>
      <button className="br-invite-x" aria-label={t('break.dismiss')} onClick={() => setDismissed(breakId)}>
        <Icon name="close" />
      </button>
    </div>
  )
}
