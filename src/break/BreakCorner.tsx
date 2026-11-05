import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
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
  /** What the task line shows when there is no invite: the active task or its placeholder. */
  fallback?: ReactNode
}

/** During a break: a quiet invite to the breathing game, and the game itself. */
export default function BreakCorner({ inBreak, breakId, remaining, fallback = null }: Props) {
  const t = useT()
  const [dismissed, setDismissed] = useState<string | null>(null)
  // The open game, drawn on the whole clock panel (the task line it lives in is too small to hold it).
  const [panel, setPanel] = useState<Element | 'inline' | null>(null)
  const open = panel !== null
  const close = () => setPanel(null)

  // Break over while playing: say so, then close on its own.
  useEffect(() => {
    if (inBreak || !open) return
    const id = setTimeout(close, ENDED_MS)
    return () => clearTimeout(id)
  }, [inBreak, open])

  if (open) {
    const game = (
      <Suspense fallback={null}>
        <BreathGame remaining={remaining} ended={!inBreak} onClose={close} />
      </Suspense>
    )
    return panel === 'inline' ? game : createPortal(game, panel)
  }

  if (!inBreak || dismissed === breakId) return fallback
  return (
    <div className="br-invite" role="status">
      <button className="br-invite-go" onClick={(e) => setPanel(e.currentTarget.closest('.focus') ?? 'inline')}>
        <span className="br-dot" aria-hidden />
        {t('break.invite')}
      </button>
      <button className="br-invite-x" aria-label={t('break.dismiss')} onClick={() => setDismissed(breakId)}>
        <Icon name="close" />
      </button>
    </div>
  )
}
