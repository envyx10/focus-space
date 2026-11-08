import type { Timer } from '@/features/timer/useTimer'
import { useT } from '@/i18n'

const MIN = 60_000

/** The rhythm in one line, figures first: "25 min focus · 5 break · long every 4". */
export default function RhythmHint({ timer, showTime }: { timer: Timer; showTime: boolean }) {
  const t = useT()
  const { config } = timer
  const n = (v: number) => <b>{v}</b>

  if (showTime) return <span>{t('m.hint.clock')}</span>
  if (timer.state.mode === 'free') {
    return (
      <>
        <span>
          {n(timer.freeMinutes)} {t('m.rhythm.min')}
        </span>
        <span>{t('m.rhythm.noBreaks')}</span>
      </>
    )
  }
  return (
    <>
      <span>
        {n(config.work / MIN)} {t('m.rhythm.focus')}
      </span>
      <span>
        {n(config.short / MIN)} {t('m.rhythm.break')}
      </span>
      <span>
        {t('m.rhythm.long')} {n(config.longEvery)}
      </span>
    </>
  )
}
