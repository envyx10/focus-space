import { lazy, Suspense, useState } from 'react'
import { useTabTitle } from '@/features/timer/alerts'
import { phaseLabel } from '@/features/timer/labels'
import { useI18n } from '@/i18n'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { useShortcuts } from '@/shared/hooks/useShortcuts'
import DesktopApp from './desktop/DesktopApp'
import { useAppState } from './hooks/useAppState'
import { MOBILE_QUERY, MOBILE_TABS, type MobileTab } from './mobile/tabs'

// The phone shell is its own chunk: desktop never downloads it, phones fetch it right after the first paint.
const MobileApp = lazy(() => import('./mobile/MobileApp'))

// A home-screen shortcut (manifest.webmanifest) opens straight on a tab: /?tab=tasks
const initialTab = (): MobileTab => {
  const tab = new URLSearchParams(location.search).get('tab')
  return MOBILE_TABS.find((x) => x === tab) ?? 'focus'
}

/** Picks the layout (the phone shell below 1024 px, the desktop grid above) and wires the keyboard shortcuts. */
export default function App() {
  const { t } = useI18n()
  const app = useAppState()
  const { ambient, prefs, timer, immersive } = app
  const mobile = useMediaQuery(MOBILE_QUERY)
  const [mobileTab, setMobileTab] = useState<MobileTab>(initialTab)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useTabTitle(timer.running, timer.remainingMs, phaseLabel(t, timer.state.mode, timer.state.phase), timer.status === 'waiting')

  // On the phone shell, single-key shortcuts wait while a sheet (a modal) is open: Space must not start the timer behind it.
  const free = (fn: () => void) => () => (mobile && document.querySelector('.m-sheet-root') ? undefined : fn())
  useShortcuts({
    toggleTimer: free(app.toggleTimer),
    newTask: free(() => document.querySelector<HTMLInputElement>('[data-new-task]')?.focus()),
    mute: free(() => ambient.setMuted(!prefs.muted)),
    calm: free(() => ambient.setCalm(!prefs.calm)),
    immersive: free(() => (immersive.immersive ? immersive.exit() : immersive.enter())),
    settings: () => (mobile ? setMobileTab((tab) => (tab === 'settings' ? 'focus' : 'settings')) : setSettingsOpen((open) => !open)),
    escape: () => (immersive.immersive ? immersive.exit() : setSettingsOpen(false)),
  })

  if (mobile) {
    return (
      <Suspense fallback={null}>
        <MobileApp app={app} tab={mobileTab} onTab={setMobileTab} />
      </Suspense>
    )
  }
  return <DesktopApp app={app} settingsOpen={settingsOpen} onSettingsOpen={setSettingsOpen} />
}
