import type { T } from '@/i18n'
import type { Phase, TimerMode } from './timer'
import type { TimerStatus } from './useTimer'

/** The phase's name: "Free" in free mode, otherwise work, short or long break. */
export const phaseLabel = (t: T, mode: TimerMode, phase: Phase): string => t(mode === 'free' ? 'phase.free' : `phase.${phase}`)

/** The main button's label when it starts (or resumes) rather than pauses. */
export function startLabel(t: T, status: TimerStatus, phaseName: string): string {
  if (status === 'running') return t('focus.timerBtn')
  if (status === 'waiting') return t('focus.startPhase', { phase: phaseName.toLowerCase() })
  if (status === 'paused') return t('focus.resume')
  return t('focus.start')
}
