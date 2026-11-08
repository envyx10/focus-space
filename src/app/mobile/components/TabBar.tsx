import { MOBILE_TABS, TAB_ICON, TAB_LABEL, type MobileTab } from '@/app/mobile/tabs'
import { useT } from '@/i18n'
import Icon from '@/shared/ui/Icon'

type Props = {
  tab: MobileTab
  onTab: (tab: MobileTab) => void
  /** Pending tasks, shown as a badge on the Tasks tab. */
  pending: number
  /** Something is playing: a live dot on the Sound tab. */
  soundOn: boolean
  /** The timer runs: a live dot on the Focus tab while another tab is open. */
  timerRunning: boolean
}

/** The bottom tab bar, with a badge for pending tasks and live dots for sound and a running timer. */
export default function TabBar({ tab, onTab, pending, soundOn, timerRunning }: Props) {
  const t = useT()
  return (
    <nav className="m-tabbar" aria-label={t('tabs.label')}>
      {MOBILE_TABS.map((id) => (
        <button key={id} className="m-tab" aria-current={tab === id ? 'page' : undefined} onClick={() => onTab(id)}>
          <span className="m-tab-icon">
            <Icon name={TAB_ICON[id]} />
            {id === 'tasks' && pending > 0 && <span className="m-badge">{pending > 99 ? '99+' : pending}</span>}
            {id === 'sound' && soundOn && <span className="m-live-dot" aria-label={t('m.soundOn')} />}
            {id === 'focus' && timerRunning && tab !== 'focus' && <span className="m-live-dot" aria-label={t('status.running')} />}
          </span>
          <span className="m-tab-label">{t(TAB_LABEL[id])}</span>
        </button>
      ))}
    </nav>
  )
}
