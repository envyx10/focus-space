import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CHANNELS } from '../audio/channels'
import { CHIMES } from '../timer/alerts'
import FocusPanel from '../timer/FocusPanel'
import SettingsMenu from '../settings/SettingsMenu'
import { DEFAULT_PREFS } from '../prefs/prefs'
import { DEFAULT_CONFIG } from '../timer/timer'
import { en } from './en'
import { es } from './es'
import { detectLang, I18nProvider, LANG_KEY, loadLang, translate, type Key } from './index'

const sources = import.meta.glob(['../**/*.ts', '../**/*.tsx', '!../**/*.test.*', '!./es.ts', '!./en.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.lang = ''
})

describe('dictionaries', () => {
  it('English has every Spanish key, filled in, with the same placeholders', () => {
    for (const key of Object.keys(es) as Key[]) {
      expect(en[key], key).toBeTruthy()
      expect(placeholders(en[key]), key).toEqual(placeholders(es[key]))
    }
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort())
  })

  it('every key the code asks for exists (typos would silently show the key)', () => {
    const used = new Set<string>()
    for (const src of Object.values(sources)) for (const m of src.matchAll(/\bt\(\s*'([\w.]+)'/g)) used.add(m[1])
    expect(used.size).toBeGreaterThan(80)
    for (const key of used) expect(es, key).toHaveProperty([key])
  })

  it('keys built at run time exist for every channel, variant, phase and status', () => {
    for (const ch of CHANNELS) {
      expect(es, `channel.${ch.id}`).toHaveProperty([`channel.${ch.id}`])
      for (const v of ch.variants) expect(es, `variant.${ch.id}.${v.id}`).toHaveProperty([`variant.${ch.id}.${v.id}`])
    }
    for (const s of CHIMES) expect(es, `chime.${s}`).toHaveProperty([`chime.${s}`])
    for (const k of ['phase.work', 'phase.short', 'phase.long', 'phase.free', 'status.running', 'status.paused', 'status.waiting', 'status.idle']) expect(es).toHaveProperty([k])
  })
})

describe('translate and detection', () => {
  it('fills placeholders and leaves unknown ones alone', () => {
    expect(translate('en', 'tasks.pending', { n: 3 })).toBe('Pending / 3')
    expect(translate('es', 'tasks.pending')).toBe('Pendientes / {n}')
  })

  it('falls back to the key itself rather than showing nothing', () => {
    expect(translate('en', 'no.such.key')).toBe('no.such.key')
  })

  it('Spanish browsers get Spanish, everything else English, first preference wins', () => {
    expect(detectLang(['es-ES', 'en'])).toBe('es')
    expect(detectLang(['es'])).toBe('es')
    expect(detectLang(['en-GB', 'es'])).toBe('en')
    expect(detectLang(['fr-FR'])).toBe('en')
    expect(detectLang([])).toBe('es')
  })

  it('a saved choice beats the browser language', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US'])
    expect(loadLang()).toBe('en')
    localStorage.setItem(LANG_KEY, JSON.stringify('es'))
    expect(loadLang()).toBe('es')
    localStorage.setItem(LANG_KEY, '"klingon"')
    expect(loadLang()).toBe('en')
  })
})

describe('the app in English', () => {
  const focus = {
    running: false,
    status: 'idle' as const,
    mode: 'pomodoro' as const,
    phase: 'work' as const,
    freeMinutes: 25,
    onStart: () => {},
    onPause: () => {},
    onReset: () => {},
    onSkip: () => {},
    onExtend: () => {},
    onModeChange: () => {},
    onFreeMinutes: () => {},
    now: new Date(2026, 9, 30, 9, 5, 7),
    remainingMs: 60_000,
    activeTaskText: null,
  }

  it('the timer panel follows the language', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US'])
    render(
      <I18nProvider>
        <FocusPanel {...focus} />
      </I18nProvider>,
    )
    expect(screen.getByRole('timer', { name: 'It is 09:05' })).toBeInTheDocument()
    expect(screen.getByText('No active task')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clock' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')
  })

  it('choosing a language in Settings switches the whole UI, sets <html lang> and is remembered', async () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US'])
    const noop = () => {}
    render(
      <I18nProvider>
        <SettingsMenu
          prefs={DEFAULT_PREFS}
          config={DEFAULT_CONFIG}
          stats={{}}
          today="2026-10-30"
          open
          onOpenChange={noop}
          onConfig={noop}
          onChime={noop}
          onChimeSound={noop}
          onNotify={noop}
          onCalm={noop}
          onMuted={noop}
          onTextScale={noop}
          onAccent={noop}
          onSaveScene={noop}
          onApplyScene={noop}
          onDeleteScene={noop}
          onImmersive={noop}
          onSlots={noop}
          onBreakGame={noop}
        />
      </I18nProvider>,
    )
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.getByLabelText('Mute everything (ambient and radio)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(screen.getByRole('button', { name: 'ES' }))
    expect(screen.getByRole('dialog', { name: 'Ajustes' })).toBeInTheDocument()
    expect(screen.getByLabelText('Silenciar todo (ambiente y radio)')).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('es')
    expect(JSON.parse(localStorage.getItem(LANG_KEY)!)).toBe('es')
  })
})
