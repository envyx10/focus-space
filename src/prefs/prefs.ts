import { channel, CHANNEL_IDS, type ChannelId } from '../audio/channels'
import { isRecord, readJSON, writeJSON } from '../lib/storage'

export const PREFS_KEY = 'focus-space:prefs'

export type Prefs = {
  v: 1
  volumes: Record<ChannelId, number>
  variants: Record<ChannelId, string>
  lofiVolume: number
}

export const DEFAULT_PREFS: Prefs = {
  v: 1,
  volumes: { rain: 0.65, fire: 0, cafe: 0, wind: 0 },
  variants: { rain: 'suave', fire: 'hoguera', cafe: 'cafeteria', wind: 'suave' },
  lofiVolume: 0.6,
}

const isVolume = (x: unknown): x is number => typeof x === 'number' && x >= 0 && x <= 1

export function loadPrefs(): Prefs {
  const raw = readJSON(PREFS_KEY)
  const r = isRecord(raw) ? raw : {}
  const vols = isRecord(r.volumes) ? r.volumes : {}
  const vars = isRecord(r.variants) ? r.variants : {}
  const volumes = { ...DEFAULT_PREFS.volumes }
  const variants = { ...DEFAULT_PREFS.variants }
  for (const id of CHANNEL_IDS) {
    if (isVolume(vols[id])) volumes[id] = vols[id]
    const want = vars[id]
    if (channel(id).variants.some((x) => x.id === want)) variants[id] = want as string
  }
  return { v: 1, volumes, variants, lofiVolume: isVolume(r.lofiVolume) ? r.lofiVolume : DEFAULT_PREFS.lofiVolume }
}

export function savePrefs(p: Prefs): void {
  writeJSON(PREFS_KEY, p)
}
