import { lazy, Suspense, type CSSProperties } from 'react'
import type { AppState } from '@/app/hooks/useAppState'
import MixerBar from '@/features/audio/MixerBar'
import AccountMenu from '@/features/auth/AccountMenu'
import BreakCorner from '@/features/break/BreakCorner'
import LofiBlock from '@/features/lofi/LofiBlock'
import SettingsMenu from '@/features/settings/SettingsMenu'
import FocusTasks from '@/features/tasks/components/FocusTasks'
import TasksPanel from '@/features/tasks/components/TasksPanel'
import FocusPanel from '@/features/timer/FocusPanel'
import Grain from '@/features/visual/Grain'
import { TYPEFACES } from '@/features/visual/typefaces'
import Weather from '@/features/weather/Weather'
import { useI18n } from '@/i18n'
import { formatCountdown, formatDay } from '@/shared/lib/format'
import Cycler from '@/shared/ui/Cycler'
import Icon from '@/shared/ui/Icon'
import Header from './Header'

// three.js is ~150 kB gzip: load it after the first paint so the clock and tasks appear instantly.
const Scene3D = lazy(() => import('@/features/visual/Scene3D'))

const ZOOM = { m: 1, l: 1.15, xl: 1.3 }

type Props = {
  app: AppState
  settingsOpen: boolean
  onSettingsOpen: (open: boolean) => void
}

/** The desktop grid: header, tasks, the clock panel, the mixer and the lofi player. */
export default function DesktopApp({ app, settingsOpen, onSettingsOpen }: Props) {
  const { t, lang } = useI18n()
  const { ambient, prefs, timer, tasks, now, immersive, lofi } = app
  const activeTask = tasks.tasks.find((k) => k.active)

  return (
    <div
      className="app"
      style={{ ...app.themeStyle, '--zoom': ZOOM[prefs.textScale] } as CSSProperties}
      data-immersive={immersive.immersive || undefined}
      data-muted={prefs.muted || undefined}
    >
      <header className="region-header" data-region="header">
        <Header
          sessionNumber={timer.sessionNumber}
          now={now}
          weather={app.weather}
          status={timer.status}
          muteSlot={
            // The label flips with the state, so no aria-pressed; aria-label keeps a name where the label is hidden.
            <button className="hd-mute" aria-label={prefs.muted ? t('mute.on') : t('mute.off')} title={t('mute.hint')} onClick={() => ambient.setMuted(!prefs.muted)}>
              <span className="hd-mute-label">{prefs.muted ? t('mute.on') : t('mute.off')}</span>
              <Icon name={prefs.muted ? 'muted' : 'sound'} />
            </button>
          }
          settingsSlot={
            <SettingsMenu
              prefs={prefs}
              config={timer.config}
              stats={app.stats}
              today={app.today}
              open={settingsOpen}
              onOpenChange={onSettingsOpen}
              onConfig={timer.setConfig}
              onChime={ambient.setChimeVolume}
              onChimeSound={ambient.setChimeSound}
              onNotify={ambient.setNotify}
              onCalm={ambient.setCalm}
              onBreakGame={ambient.setBreakGame}
              onMuted={ambient.setMuted}
              onTextScale={ambient.setTextScale}
              onAccent={ambient.setAccent}
              onSaveScene={ambient.saveScene}
              onApplyScene={ambient.applyScene}
              onDeleteScene={ambient.deleteScene}
              onImmersive={immersive.enter}
              onSlots={ambient.setSlots}
            />
          }
          accountSlot={<AccountMenu session={app.session} />}
        />
      </header>

      <section className="region-tasks" data-region="tasks">
        <TasksPanel
          tasks={tasks.tasks}
          synced={app.synced}
          saveError={tasks.error}
          localError={tasks.localError}
          add={tasks.add}
          toggle={tasks.toggle}
          edit={tasks.edit}
          describe={tasks.describe}
          remove={tasks.remove}
          setActive={tasks.setActive}
          move={tasks.move}
          restore={tasks.restore}
          clearDone={tasks.clearDone}
          addMany={tasks.addMany}
          prioritize={tasks.prioritize}
          sortByPriority={tasks.sortByPriority}
        />
      </section>

      <main className="region-focus" data-region="focus">
        <FocusPanel
          remainingMs={timer.remainingMs}
          running={timer.running}
          status={timer.status}
          mode={timer.state.mode}
          phase={timer.state.phase}
          freeMinutes={timer.freeMinutes}
          activeTaskText={activeTask?.text ?? null}
          taskSlot={
            // undefined, not false, when off: the panel falls back to the task line only on null/undefined
            prefs.breakGame ? (
              <BreakCorner
                inBreak={timer.inBreak}
                breakId={`${timer.sessionNumber}-${timer.state.phase}`}
                remaining={formatCountdown(timer.remainingMs)}
                fallback={activeTask?.text ?? <span className="focus-dim">{t('focus.noTask')}</span>}
              />
            ) : undefined
          }
          onStart={timer.start}
          onPause={timer.pause}
          onReset={timer.reset}
          onSkip={timer.skip}
          onExtend={timer.extend}
          onModeChange={timer.setMode}
          onFreeMinutes={timer.setFreeMinutes}
          now={now}
          toggleSignal={app.toggleSignal}
          dateSlot={
            <>
              {formatDay(now, lang)} <Weather now={app.weather} />
            </>
          }
          sceneControl={
            <Cycler
              label={t('type.label')}
              options={TYPEFACES.map((f) => ({ id: f.id, label: f.id === 'suiza' ? t('typeface.suiza') : f.label }))}
              value={prefs.font}
              onChange={ambient.setFont}
            />
          }
        >
          {!prefs.calm && (
            <Suspense fallback={null}>
              <Scene3D getLevels={app.getLevels} accent={prefs.accent} />
            </Suspense>
          )}
        </FocusPanel>
        {immersive.immersive && <FocusTasks tasks={tasks.tasks} />}
        {immersive.immersive && (
          <button className="exit-immersive" onClick={immersive.exit}>
            {t('immersive.exit')}
          </button>
        )}
      </main>

      <section className="region-mixer" data-region="mixer">
        <MixerBar prefs={prefs} onVolume={ambient.setVolume} onVariant={ambient.setVariant} onSlots={ambient.setSlots} />
      </section>

      <section className="region-lofi" data-region="lofi">
        <LofiBlock
          status={lofi.status}
          playing={lofi.playing}
          volume={prefs.lofiVolume}
          onToggle={lofi.toggle}
          onVolume={ambient.setLofiVolume}
          station={lofi.station}
          onStation={app.selectStation}
        />
      </section>

      {!prefs.calm && <Grain />}
    </div>
  )
}
