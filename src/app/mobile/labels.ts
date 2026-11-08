import type { Phase, TimerMode } from '@/features/timer/timer'
import type { T } from '@/i18n'

/** The phase's name on the phone: the work phase is "Foco", like the tab (desktop keeps its own wording). */
export function phaseName(t: T, mode: TimerMode, phase: Phase): string {
  if (mode === 'free') return t('phase.free')
  return phase === 'work' ? t('m.phase.work') : t(`phase.${phase}`)
}
