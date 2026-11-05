import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
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
  const [open, setOpen] = useState(false)
  const anchor = useRef<HTMLElement>(null)

  // Break over while playing: say so, then close on its own.
  useEffect(() => {
    if (inBreak || !open) return
    const id = setTimeout(() => setOpen(false), ENDED_MS)
    return () => clearTimeout(id)
  }, [inBreak, open])

  if (open) {
    const game = (
      <Suspense fallback={null}>
        <BreathGame remaining={remaining} ended={!inBreak} onClose={() => setOpen(false)} />
      </Suspense>
    )
    // Drawn on the whole clock panel: the task line it lives in is too small to hold it.
    const panel = anchor.current?.closest('.focus')
    return <span ref={anchor as React.RefObject<HTMLSpanElement>}>{panel ? createPortal(game, panel) : game}</span>
  }

  if (!inBreak || dismissed === breakId) return <span ref={anchor as React.RefObject<HTMLSpanElement>}>{fallback}</span>
  return (
    <div className="br-invite" role="status" ref={anchor as React.RefObject<HTMLDivElement>}>
      <button className="br-invite-go" onClick={() => setOpen(true)}>
        <span className="br-dot" aria-hidden />
        {t('break.invite')}
      </button>
      <button className="br-invite-x" aria-label={t('break.dismiss')} onClick={() => setDismissed(breakId)}>
        <Icon name="close" />
      </button>
    </div>
  )
}
