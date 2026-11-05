import { channel, CHANNEL_IDS, CHANNELS, type ChannelId } from '../audio/channels'
import { DEFAULT_ACCENT, isHex } from './accent'
import { isRecord, readJSON, writeJSON } from '../lib/storage'
import { TYPEFACES } from '../visual/typefaces'
import { CHIMES, type Chime } from '../timer/alerts'

export const PREFS_KEY = 'focus-space:prefs'

export const THEMES = ['dark', 'light', 'system'] as const
export type Theme = (typeof THEMES)[number]

export const TEXT_SCALES = ['m', 'l', 'xl'] as const
export type TextScale = (typeof TEXT_SCALES)[number]

/** A named ambient mix the user can come back to. */
export type Scene = { name: string; volumes: Record<ChannelId, number>; variants: Record<ChannelId, string> }
export const MAX_SCENES = 8

/** The mixer shows a fixed number of squares; the user picks which channel sits in each. */
export const SLOT_COUNT = 8
export const DEFAULT_SLOTS: ChannelId[] = ['rain', 'fire', 'cafe', 'wind', 'keys', 'water', 'night', 'noise']

/** Puts `id` in slot `i`; if it already sat in another slot, the two swap so no channel shows twice. */
export function replaceSlot(slots: ChannelId[], i: number, id: ChannelId): ChannelId[] {
  const out = [...slots]
  const j = out.indexOf(id)
  if (j !== -1) out[j] = out[i]
  out[i] = id
  return out
}

/** Moves slot `from` to position `to`, shifting the ones in between. */
export function moveSlot(slots: ChannelId[], from: number, to: number): ChannelId[] {
  if (to < 0 || to >= slots.length || from === to) return slots
  const out = [...slots]
  out.splice(to, 0, ...out.splice(from, 1))
  return out
}

export type Prefs = {
  v: 1
  volumes: Record<ChannelId, number>
  variants: Record<ChannelId, string>
  lofiVolume: number
  font: string
  /** Volume of the end-of-phase chime; 0 turns it off. */
  chimeVolume: number
  chimeSound: Chime
  /** Browser notification when a phase ends (asks permission only when switched on). */
  notify: boolean
  /** Offers the breathing game during Pomodoro breaks. */
  breakGame: boolean
  /** Hides the particle sphere and the grain for a quieter screen. */
  calm: boolean
  /** Mutes every sound without touching the saved mix. */
  muted: boolean
  textScale: TextScale
  /** 'system' follows prefers-color-scheme. */
  theme: Theme
  /** Highlight colour, #rrggbb. */
  accent: string
  lofiStation: number
  scenes: Scene[]
  /** Channels shown in the mixer, in order. */
  slots: ChannelId[]
}

export const DEFAULT_PREFS: Prefs = {
  v: 1,
  volumes: Object.fromEntries(CHANNEL_IDS.map((id) => [id, 0])) as Record<ChannelId, number>,
  variants: { ...(Object.fromEntries(CHANNELS.map((c) => [c.id, c.variants[0].id])) as Record<ChannelId, string>), keys: 'marron' },
  lofiVolume: 0.6,
  font: 'mono',
  chimeVolume: 0.4,
  chimeSound: 'campana',
  notify: false,
  breakGame: true,
  calm: false,
  muted: false,
  textScale: 'm',
  theme: 'system',
  accent: DEFAULT_ACCENT,
  lofiStation: 0,
  scenes: [],
  slots: DEFAULT_SLOTS,
}

const isVolume = (x: unknown): x is number => typeof x === 'number' && x >= 0 && x <= 1

function parseMix(vols: unknown, vars: unknown) {
  const v = isRecord(vols) ? vols : {}
  const w = isRecord(vars) ? vars : {}
  const volumes = { ...DEFAULT_PREFS.volumes }
  const variants = { ...DEFAULT_PREFS.variants }
  for (const id of CHANNEL_IDS) {
    if (isVolume(v[id])) volumes[id] = v[id]
    if (channel(id).variants.some((x) => x.id === w[id])) variants[id] = w[id] as string
  }
  return { volumes, variants }
}

function parseSlots(raw: unknown): ChannelId[] {
  if (!Array.isArray(raw)) return DEFAULT_SLOTS
  const ids = [...new Set(raw.filter((x): x is ChannelId => CHANNEL_IDS.includes(x as ChannelId)))]
  // Top up with defaults so a short or stale list still fills every square.
  for (const d of [...DEFAULT_SLOTS, ...CHANNEL_IDS]) if (ids.length < SLOT_COUNT && !ids.includes(d)) ids.push(d)
  return ids.slice(0, SLOT_COUNT)
}

function parseScenes(raw: unknown): Scene[] {
  if (!Array.isArray(raw)) return []
  const out: Scene[] = []
  for (const s of raw) {
    if (!isRecord(s) || typeof s.name !== 'string' || !s.name.trim()) continue
    out.push({ name: s.name.trim().slice(0, 24), ...parseMix(s.volumes, s.variants) })
    if (out.length >= MAX_SCENES) break
  }
  return out
}

export function loadPrefs(): Prefs {
  const raw = readJSON(PREFS_KEY)
  const r = isRecord(raw) ? raw : {}
  return {
    v: 1,
    ...parseMix(r.volumes, r.variants),
    lofiVolume: isVolume(r.lofiVolume) ? r.lofiVolume : DEFAULT_PREFS.lofiVolume,
    font: TYPEFACES.some((t) => t.id === r.font) ? (r.font as string) : DEFAULT_PREFS.font,
    chimeVolume: isVolume(r.chimeVolume) ? r.chimeVolume : DEFAULT_PREFS.chimeVolume,
    chimeSound: CHIMES.includes(r.chimeSound as Chime) ? (r.chimeSound as Chime) : DEFAULT_PREFS.chimeSound,
    notify: r.notify === true,
    breakGame: r.breakGame !== false,
    calm: r.calm === true,
    muted: r.muted === true,
    textScale: TEXT_SCALES.includes(r.textScale as TextScale) ? (r.textScale as TextScale) : DEFAULT_PREFS.textScale,
    theme: THEMES.includes(r.theme as Theme) ? (r.theme as Theme) : DEFAULT_PREFS.theme,
    accent: isHex(r.accent) ? r.accent.toLowerCase() : DEFAULT_ACCENT,
    lofiStation: Number.isInteger(r.lofiStation) && (r.lofiStation as number) >= 0 ? (r.lofiStation as number) : 0,
    scenes: parseScenes(r.scenes),
    slots: parseSlots(r.slots),
  }
}

export function savePrefs(p: Prefs): void {
  writeJSON(PREFS_KEY, p)
}
