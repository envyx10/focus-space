import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { ACCENTS } from '@/features/prefs/accent'
import { ACCENT_NAMES, setAccent, useAccent } from '~/accent'
import { field, type SceneId } from '~/field/scenes'
import Sound from './Sound'

/** The six pieces, in the order the scroll lights them, with their short name for the step bar. */
const STEPS: SceneId[] = ['f-timer', 'f-tasks', 'f-sound', 'f-focus', 'f-personal', 'f-mobile']
const NAMES = ['Reloj', 'Tareas', 'Sonido', 'Focus', 'Color', 'Móvil']
const WALK = '(min-width: 1101px) and (min-height: 740px)'

/** Which step the walk is on (-1 before it starts), so each piece knows whether it is lit, seen or still to come. */
const Walk = createContext(-1)
function useStepClass(step: SceneId): string {
  const at = useContext(Walk)
  const i = STEPS.indexOf(step)
  return i === at ? ' is-on' : at > i ? ' is-past' : ' is-ahead'
}

/** Scrolls so a step's marker crosses the middle of the screen, which is what lights it. */
function goTo(i: number) {
  const mark = document.querySelectorAll<HTMLElement>('.features__mark')[i]
  if (!mark) return
  const y = mark.getBoundingClientRect().top + scrollY - innerHeight / 2
  scrollTo({ top: y, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}

/**
 * The guided walk through the room: a step bar in the header (click to jump) and a reticle that slides from
 * piece to piece, so nobody misses that the scroll is showing them around.
 */
function useWalk(scene: SceneId, room: RefObject<HTMLDivElement | null>) {
  const [frame, setFrame] = useState<CSSProperties | null>(null)
  const at = STEPS.indexOf(scene)
  useLayoutEffect(() => {
    const measure = () => {
      const el = room.current?.querySelector<HTMLElement>(`[data-step='${scene}']`)
      if (!el || !room.current || !matchMedia(WALK).matches) return setFrame(null)
      const r = el.getBoundingClientRect()
      const o = room.current.getBoundingClientRect()
      const pad = 18
      setFrame({ left: r.left - o.left - pad, top: r.top - o.top - pad, width: r.width + pad * 2, height: r.height + pad * 2 })
    }
    measure()
    addEventListener('resize', measure)
    return () => removeEventListener('resize', measure)
  }, [scene, room])
  return { at, frame }
}

type Mode = 'hora' | 'pomodoro' | 'libre'
const MODES: Record<Mode, string> = {
  hora: 'La hora local, legible desde el otro lado de la habitación.',
  pomodoro: '25 / 5 con un descanso largo cada 4, o 50 / 10, 90 / 20 y tus propias duraciones.',
  libre: 'Una cuenta atrás sencilla, de 1 a 240 minutos.',
}

function useNow(on: boolean) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    if (!on) return
    const id = setInterval(() => setNow(new Date()), 10_000)
    return () => clearInterval(id)
  }, [on])
  return now
}

/** The app's clock, at the centre of the room, over the sphere: three modes, switchable. */
function Clock() {
  const state = useStepClass('f-timer')
  const [mode, setMode] = useState<Mode>('pomodoro')
  const now = useNow(mode === 'hora')
  const [a, b] = mode === 'hora' ? [now.getHours(), now.getMinutes()].map((n) => String(n).padStart(2, '0')) : mode === 'pomodoro' ? ['25', '00'] : ['45', '00']
  return (
    <div className={`fz fz--timer${state}`} data-step="f-timer" data-reveal>
      <p className="lbl">{'>>> Temporizador'}</p>
      <p className="clock" aria-label={`${a}:${b}`}>
        <span>{a}</span>
        <span className="clock__colon" aria-hidden="true">
          :
        </span>
        <span className="clock__dim">{b}</span>
      </p>
      <div className="seg" role="radiogroup" aria-label="Modo del reloj">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button key={m} type="button" role="radio" aria-checked={mode === m} className="seg__btn" onClick={() => setMode(m)}>
            {m}
          </button>
        ))}
      </div>
      <p className="body clock__note" aria-live="polite">
        {MODES[mode]}
      </p>
    </div>
  )
}

const typing = (t: EventTarget | null) => t instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)

/** Press F, as in the app: everything on the page steps back and only the sphere remains. Esc brings it back. */
function FocusKey() {
  const [on, setOn] = useState(false)
  useEffect(() => {
    document.documentElement.classList.toggle('is-focus', on)
  }, [on])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || typing(e.target)) return
      if (e.key === 'Escape') setOn(false)
      else if ((e.key === 'f' || e.key === 'F') && field.scene.startsWith('f-')) setOn((x) => !x)
    }
    const onScroll = () => !field.scene.startsWith('f-') && setOn(false)
    addEventListener('keydown', onKey)
    addEventListener('scroll', onScroll, { passive: true })
    return () => {
      removeEventListener('keydown', onKey)
      removeEventListener('scroll', onScroll)
      document.documentElement.classList.remove('is-focus')
    }
  }, [])
  return (
    <button type="button" className="fkey" aria-pressed={on} onClick={() => setOn((x) => !x)}>
      <kbd>F</kbd>
      <span className="lbl">{on ? 'Esc · volver' : 'Pulsa F'}</span>
    </button>
  )
}

function Accents() {
  const accent = useAccent()
  return (
    <div className="dots" role="radiogroup" aria-label="Color de resalte">
      {ACCENTS.map((hex, i) => (
        <button key={hex} type="button" role="radio" aria-checked={accent === hex} aria-label={ACCENT_NAMES[i]} className="dot" style={{ background: hex }} onClick={() => setAccent(hex)} />
      ))}
    </div>
  )
}

function Piece({ step, label, title, children }: { step: SceneId; label: string; title: ReactNode; children: ReactNode }) {
  const state = useStepClass(step)
  return (
    <div className={`fz fz--${step.slice(2)}${state}`} data-step={step} data-reveal>
      <p className="lbl">{`>>> ${label}`}</p>
      <h3 className="h-s">{title}</h3>
      {children}
    </div>
  )
}

/**
 * Chapter 04 is the app's one screen, laid out the way the app lays it out: tasks on the left, the clock over
 * the sphere in the middle, the mixer along the bottom, the rest on the right. It holds still while you
 * scroll, and the scroll lights one piece at a time (invisible markers behind it set the scene).
 */
export default function Features({ scene }: { scene: SceneId }) {
  const room = useRef<HTMLDivElement>(null)
  const { at, frame } = useWalk(scene, room)
  return (
    <section id="features" className="features" aria-labelledby="features-title">
      <Walk.Provider value={at}>
      {STEPS.map((s, i) => (
        <span key={s} className="features__mark" data-scene={s} style={{ top: `calc(50vh + ${i} * var(--step))` }} aria-hidden="true" />
      ))}
      <div className="room" ref={room}>
        <header className="room__head">
          <div className="stack">
            <p className="lbl">[ 02 ] Todo en su sitio</p>
            <h2 id="features-title" className="h-l">
              Una sola <em>pantalla.</em>
            </h2>
          </div>
          <nav className="walk" aria-label="Recorrido por la pantalla">
            <p className="lbl walk__now" aria-live="polite">
              {at >= 0 ? (
                <>
                  Paso <b>{String(at + 1).padStart(2, '0')}</b> / 06 · {NAMES[at]} <span className="walk__hint">· desplaza ↓</span>
                </>
              ) : (
                <>Desplaza ↓ para recorrer la pantalla</>
              )}
            </p>
            <ol className="walk__steps">
              {NAMES.map((n, i) => (
                <li key={n}>
                  <button type="button" className={i === at ? 'is-on' : i < at ? 'is-past' : undefined} aria-current={i === at ? 'step' : undefined} onClick={() => goTo(i)}>
                    <span className="lbl">{String(i + 1).padStart(2, '0')}</span>
                    <span className="lbl">{n}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </header>
        {frame && (
          <div className="reticle" style={frame} aria-hidden="true">
            <span className="lbl">{`[ ${String(at + 1).padStart(2, '0')} / 06 ]`}</span>
          </div>
        )}

        <Piece step="f-tasks" label="Tareas" title={<>Una lista corta, <em>siempre a la vista.</em></>}>
          <ol className="tasklist">
            <li className="is-active">
              <span>Revisar pull requests</span>
              <span className="accent">→</span>
            </li>
            <li>Bocetar el onboarding</li>
            <li>Planificar la semana</li>
            <li className="is-done">Escribir el brief</li>
          </ol>
          <p className="body">
            La tarea <b>activa</b> te acompaña bajo el reloj. <kbd>Ctrl</kbd> <kbd>Z</kbd> deshace un borrado.
          </p>
        </Piece>

        <Clock />

        <div className="room__side">
          <Piece step="f-focus" label="Modo focus" title={<>Todo lo demás <em>desaparece.</em></>}>
            <FocusKey />
          </Piece>
          <Piece step="f-personal" label="Personalización" title={<>Haz tuya <em>la sala.</em></>}>
            <Accents />
            <p className="body">Siete colores, cinco tipografías para el reloj, tres tamaños de texto.</p>
          </Piece>
          <Piece step="f-mobile" label="Móvil" title={<>También <em>en el bolsillo.</em></>}>
            <p className="body">Una sola columna por debajo de 1024 px. Añádela a tu pantalla de inicio.</p>
          </Piece>
        </div>

        <SoundPiece />
      </div>
      </Walk.Provider>
    </section>
  )
}

function SoundPiece() {
  return <Sound state={useStepClass('f-sound')} />
}
