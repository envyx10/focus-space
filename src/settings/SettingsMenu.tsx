import { useEffect, useRef, useState } from 'react'
import { askNotificationPermission, chime, notificationsSupported } from '../timer/alerts'
import { DEFAULT_CONFIG, type TimerConfig } from '../timer/timer'
import { LIMITS } from '../timer/timerStore'
import { formatDuration, rangeMs, streak, type Stats } from '../stats/stats'
import { TEXT_SCALES, type Prefs, type TextScale } from '../prefs/prefs'
import './settings.css'

const MIN = 60_000

export const PRESETS: { label: string; cfg: Pick<TimerConfig, 'work' | 'short' | 'long'> }[] = [
  { label: '25 / 5', cfg: { work: 25 * MIN, short: 5 * MIN, long: 15 * MIN } },
  { label: '50 / 10', cfg: { work: 50 * MIN, short: 10 * MIN, long: 20 * MIN } },
  { label: '90 / 20', cfg: { work: 90 * MIN, short: 20 * MIN, long: 30 * MIN } },
]

export const SHORTCUTS: [string, string][] = [
  ['Espacio', 'Iniciar / pausar el temporizador'],
  ['N', 'Nueva tarea'],
  ['M', 'Silenciar todo'],
  ['C', 'Modo calma'],
  ['I', 'Modo inmersión (Esc para salir)'],
  ['?', 'Abrir / cerrar ajustes'],
]

const SCALE_LABEL: Record<TextScale, string> = { m: 'A', l: 'A+', xl: 'A++' }

type Props = {
  prefs: Prefs
  config: TimerConfig
  stats: Stats
  today: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfig: (c: TimerConfig) => void
  onChime: (v: number) => void
  onNotify: (on: boolean) => void
  onCalm: (on: boolean) => void
  onMuted: (on: boolean) => void
  onTextScale: (s: TextScale) => void
  onSaveScene: (name: string) => void
  onApplyScene: (name: string) => void
  onDeleteScene: (name: string) => void
  onImmersive: () => void
}

function Minutes({ label, value, limits, onCommit }: { label: string; value: number; limits: readonly [number, number]; onCommit: (v: number) => void }) {
  return (
    <label className="set-num">
      <span>{label}</span>
      <input
        key={value}
        type="number"
        min={limits[0]}
        max={limits[1]}
        defaultValue={value}
        onBlur={(e) => {
          const n = Math.round(Number(e.target.value))
          if (!Number.isFinite(n)) return
          const clamped = Math.min(limits[1], Math.max(limits[0], n))
          if (clamped !== value) onCommit(clamped)
          else e.target.value = String(value)
        }}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      />
    </label>
  )
}

export default function SettingsMenu(p: Props) {
  const { open, onOpenChange, config: cfg, prefs } = p
  const [sceneName, setSceneName] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !root.current?.contains(e.target as Node)) onOpenChange(false)
    }
    addEventListener('pointerdown', close)
    addEventListener('keydown', close)
    return () => {
      removeEventListener('pointerdown', close)
      removeEventListener('keydown', close)
    }
  }, [open, onOpenChange])

  const setMin = (key: 'work' | 'short' | 'long', min: number) => p.onConfig({ ...cfg, [key]: min * MIN })
  const preset = PRESETS.findIndex((x) => x.cfg.work === cfg.work && x.cfg.short === cfg.short && x.cfg.long === cfg.long)
  const week = rangeMs(p.stats, p.today, 7)
  const today = p.stats[p.today]
  const days = streak(p.stats, p.today)

  const toggleNotify = async (on: boolean) => {
    if (!on) return p.onNotify(false)
    const ok = await askNotificationPermission()
    setMsg(ok ? null : 'El navegador no permite notificaciones aquí. Puedes activarlas en los permisos del sitio.')
    p.onNotify(ok)
  }

  return (
    <div className="set" ref={root}>
      <button className="set-btn" aria-expanded={open} aria-haspopup="dialog" title="Ajustes (?)" onClick={() => onOpenChange(!open)}>
        Ajustes ⚙
      </button>
      {open && (
        <div className="set-panel" role="dialog" aria-label="Ajustes">
          <div className="num">04</div>
          <div className="lbl">Ajustes</div>

          <section>
            <h3>Pomodoro</h3>
            <div className="set-presets" role="group" aria-label="Duraciones predefinidas">
              {PRESETS.map((x, i) => (
                <button key={x.label} aria-pressed={preset === i} onClick={() => p.onConfig({ ...cfg, ...x.cfg })}>
                  {x.label}
                </button>
              ))}
            </div>
            <div className="set-nums">
              <Minutes label="Focus (min)" value={cfg.work / MIN} limits={LIMITS.work} onCommit={(v) => setMin('work', v)} />
              <Minutes label="Descanso (min)" value={cfg.short / MIN} limits={LIMITS.short} onCommit={(v) => setMin('short', v)} />
              <Minutes label="Largo (min)" value={cfg.long / MIN} limits={LIMITS.long} onCommit={(v) => setMin('long', v)} />
              <Minutes label="Largo cada" value={cfg.longEvery} limits={LIMITS.longEvery} onCommit={(v) => p.onConfig({ ...cfg, longEvery: v })} />
            </div>
            <label className="set-check">
              <input type="checkbox" checked={cfg.autoNext} onChange={(e) => p.onConfig({ ...cfg, autoNext: e.target.checked })} />
              Empezar la siguiente fase automáticamente
            </label>
            {JSON.stringify(cfg) !== JSON.stringify(DEFAULT_CONFIG) && (
              <button className="set-link" onClick={() => p.onConfig(DEFAULT_CONFIG)}>
                Restablecer
              </button>
            )}
          </section>

          <section>
            <h3>Avisos</h3>
            <label className="set-range">
              <span>Sonido al terminar · {prefs.chimeVolume === 0 ? 'apagado' : `${Math.round(prefs.chimeVolume * 100)} %`}</span>
              <input type="range" min={0} max={100} step={5} value={Math.round(prefs.chimeVolume * 100)} aria-label="Volumen del aviso" onChange={(e) => p.onChime(Number(e.target.value) / 100)} />
            </label>
            <button className="set-link" disabled={prefs.chimeVolume === 0} onClick={() => chime(prefs.chimeVolume)}>
              Probar sonido
            </button>
            <label className="set-check">
              <input type="checkbox" checked={prefs.notify} disabled={!notificationsSupported()} onChange={(e) => toggleNotify(e.target.checked)} />
              Notificación del navegador {!notificationsSupported() && '(no disponible)'}
            </label>
            <p className="set-dim">Mientras corre, la cuenta atrás aparece en el título de la pestaña.</p>
            {msg && <p className="set-msg">{msg}</p>}
          </section>

          <section>
            <h3>Pantalla</h3>
            <label className="set-check">
              <input type="checkbox" checked={prefs.calm} onChange={(e) => p.onCalm(e.target.checked)} />
              Modo calma: sin esfera ni grano
            </label>
            <div className="set-row">
              <span>Tamaño del texto</span>
              <span className="set-presets" role="group" aria-label="Tamaño del texto">
                {TEXT_SCALES.map((s) => (
                  <button key={s} aria-pressed={prefs.textScale === s} onClick={() => p.onTextScale(s)}>
                    {SCALE_LABEL[s]}
                  </button>
                ))}
              </span>
            </div>
            <button
              className="set-link"
              onClick={() => {
                onOpenChange(false)
                p.onImmersive()
              }}
            >
              Modo inmersión →
            </button>
          </section>

          <section>
            <h3>Sonido</h3>
            <label className="set-check">
              <input type="checkbox" checked={prefs.muted} onChange={(e) => p.onMuted(e.target.checked)} />
              Silenciar todo (ambiente y radio)
            </label>
            <form
              className="set-scene"
              onSubmit={(e) => {
                e.preventDefault()
                p.onSaveScene(sceneName)
                setSceneName('')
              }}
            >
              <input value={sceneName} maxLength={24} placeholder="Nombre de la mezcla actual" aria-label="Nombre de la mezcla" onChange={(e) => setSceneName(e.target.value)} />
              <button type="submit" disabled={!sceneName.trim()}>
                Guardar
              </button>
            </form>
            {prefs.scenes.length > 0 && (
              <ul className="set-scenes">
                {prefs.scenes.map((s) => (
                  <li key={s.name}>
                    <button onClick={() => p.onApplyScene(s.name)} title="Aplicar esta mezcla">
                      {s.name}
                    </button>
                    <button aria-label={`Borrar mezcla ${s.name}`} onClick={() => p.onDeleteScene(s.name)}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3>Estadísticas</h3>
            <dl className="set-stats">
              <div>
                <dt>Hoy</dt>
                <dd>
                  {formatDuration(today?.focusMs ?? 0)} · {today?.sessions ?? 0} sesiones
                </dd>
              </div>
              <div>
                <dt>7 días</dt>
                <dd>{formatDuration(week)}</dd>
              </div>
              <div>
                <dt>Racha</dt>
                <dd>{days} {days === 1 ? 'día' : 'días'}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h3>Atajos</h3>
            <dl className="set-keys">
              {SHORTCUTS.map(([k, d]) => (
                <div key={k}>
                  <dt>
                    <kbd>{k}</kbd>
                  </dt>
                  <dd>{d}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      )}
    </div>
  )
}
