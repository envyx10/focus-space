import { channel, CHANNEL_IDS, CHANNELS, type ChannelId } from '../audio/channels'
import { DEFAULT_ACCENT, isHex } from './accent'
import { isRecord, readJSON, writeJSON } from '../lib/storage'
import { TYPEFACES } from '../visual/typefaces'
import { CHIMES, type Chime } from '../timer/alerts'

export const PREFS_KEY = 'focus-space:prefs'

export const TEXT_SCALES = ['m', 'l', 'xl'] as const
export type TextScale = (typeof TEXT_SCALES)[number]

/** A named ambient mix the user can come back to. */
export type Scene = { name: string; volumes: Record<ChannelId, number>; variants: Record<ChannelId, string> }
export const MAX_SCENES = 8

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
  /** Hides the particle sphere and the grain for a quieter screen. */
  calm: boolean
  /** Mutes every sound without touching the saved mix. */
  muted: boolean
  textScale: TextScale
  /** Highlight colour, #rrggbb. */
  accent: string
  lofiStation: number
  scenes: Scene[]
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
  calm: false,
  muted: false,
  textScale: 'm',
  accent: DEFAULT_ACCENT,
  lofiStation: 0,
  scenes: [],
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
    calm: r.calm === true,
    muted: r.muted === true,
    textScale: TEXT_SCALES.includes(r.textScale as TextScale) ? (r.textScale as TextScale) : DEFAULT_PREFS.textScale,
    accent: isHex(r.accent) ? r.accent.toLowerCase() : DEFAULT_ACCENT,
    lofiStation: Number.isInteger(r.lofiStation) && (r.lofiStation as number) >= 0 ? (r.lofiStation as number) : 0,
    scenes: parseScenes(r.scenes),
  }
}

export function savePrefs(p: Prefs): void {
  writeJSON(PREFS_KEY, p)
}
