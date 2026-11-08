import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { beatPulse, mergeLevels } from '@/features/audio/pulse'
import { useAmbient } from '@/features/audio/useAmbient'
import { supabase } from '@/features/auth/supabase'
import { useSession } from '@/features/auth/useSession'
import { STATIONS, useYouTubeLofi } from '@/features/lofi/useYouTubeLofi'
import { onAccent } from '@/features/prefs/accent'
import { addFocus, loadStats, saveStats } from '@/features/stats/stats'
import { useTaskRepo } from '@/features/tasks/hooks/useTaskRepo'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import { todayKey } from '@/features/timer/timerStore'
import { useTimer } from '@/features/timer/useTimer'
import { useTypeface } from '@/features/visual/useTypeface'
import { useWeather } from '@/features/weather/useWeather'
import { useImmersive } from './useImmersive'
import { useNow } from './useNow'

/**
 * Everything both layouts share: preferences and sound, the timer, tasks, the account and the clock. The desktop grid
 * and the phone shell are two views over this one state.
 */
export function useAppState() {
  const ambient = useAmbient()
  const { prefs } = ambient
  const weather = useWeather()
  const now = useNow()
  const [stats, setStats] = useState(loadStats)
  useEffect(() => saveStats(stats), [stats])

  const timer = useTimer({
    // "Mute all" covers the end-of-phase chime too.
    chimeVolume: prefs.muted ? 0 : prefs.chimeVolume,
    chimeSound: prefs.chimeSound,
    notify: prefs.notify,
    onFocus: (ms, sessions) => setStats((s) => addFocus(s, todayKey(), ms, sessions)),
  })
  const lofi = useYouTubeLofi(prefs.lofiVolume, prefs.lofiStation, prefs.muted)
  const session = useSession(supabase)
  const { repo, synced } = useTaskRepo(supabase, session.user)
  const tasks = useTasks(repo)
  const immersive = useImmersive()
  const displayFont = useTypeface(prefs.font)
  // Bumped by the Space shortcut: the clock panel does what its main button does.
  const [toggleSignal, setToggleSignal] = useState(0)
  const toggleTimer = useCallback(() => setToggleSignal((n) => n + 1), [])

  // Closing or reloading the tab while a task's text is being edited: blur commits it before the page goes.
  useEffect(() => {
    const onHide = () => (document.activeElement as HTMLElement | null)?.blur?.()
    addEventListener('pagehide', onHide)
    return () => removeEventListener('pagehide', onHide)
  }, [])

  // What the 3D follows: the ambient channels, plus a synthetic lofi groove while the stream plays
  // (YouTube's iframe audio can't be analysed).
  const { getLevels: ambientLevels } = ambient
  const lofiPlaying = lofi.playing
  const getLevels = useCallback(
    () => mergeLevels(ambientLevels(), null, lofiPlaying ? beatPulse(performance.now() / 1000) : null),
    [ambientLevels, lofiPlaying],
  )

  const selectStation = (i: number) => {
    lofi.select(i)
    ambient.setLofiStation(((i % STATIONS.length) + STATIONS.length) % STATIONS.length)
  }

  // Accent, display font and their contrast colour: the same variables in both layouts.
  const themeStyle = { ...displayFont, '--accent': prefs.accent, '--on-accent': onAccent(prefs.accent) } as CSSProperties

  return {
    ambient,
    prefs,
    weather,
    now,
    today: todayKey(now),
    stats,
    timer,
    lofi,
    selectStation,
    session,
    tasks,
    synced,
    immersive,
    getLevels,
    toggleSignal,
    toggleTimer,
    themeStyle,
  }
}

export type AppState = ReturnType<typeof useAppState>
