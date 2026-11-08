import type { TextScale } from '@/features/prefs/prefs'
import { DEFAULT_CONFIG, type TimerConfig } from '@/features/timer/timer'
import type { Key } from '@/i18n'

export const MIN = 60_000

export const PRESETS: { label: string; cfg: Pick<TimerConfig, 'work' | 'short' | 'long'> }[] = [
  { label: '25 / 5', cfg: { work: 25 * MIN, short: 5 * MIN, long: 15 * MIN } },
  { label: '50 / 10', cfg: { work: 50 * MIN, short: 10 * MIN, long: 20 * MIN } },
  { label: '90 / 20', cfg: { work: 90 * MIN, short: 20 * MIN, long: 30 * MIN } },
]

/** The preset the rhythm matches, or -1 for a custom one. */
export const presetIndex = (cfg: TimerConfig): number =>
  PRESETS.findIndex((x) => x.cfg.work === cfg.work && x.cfg.short === cfg.short && x.cfg.long === cfg.long)

/** Anything changed from the default rhythm: "Restore defaults" shows. */
export const isCustomized = (cfg: TimerConfig): boolean => JSON.stringify(cfg) !== JSON.stringify(DEFAULT_CONFIG)

/** The key is shown as is, except the space bar, which has a name in each language. */
export const SHORTCUTS: [string, Key][] = [
  ['key.space', 'key.space.desc'],
  ['N', 'key.n.desc'],
  ['M', 'key.m.desc'],
  ['C', 'key.c.desc'],
  ['F', 'key.f.desc'],
  ['?', 'key.help.desc'],
]

export const SCALE_LABEL: Record<TextScale, string> = { m: 'A', l: 'A+', xl: 'A++' }
