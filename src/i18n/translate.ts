import { readJSON } from '@/shared/lib/storage'
import { en } from './locales/en'
import { es } from './locales/es'

export type Lang = 'es' | 'en'
export type Key = keyof typeof es
export type Vars = Record<string, string | number>

export const LANGS: Lang[] = ['es', 'en']
export const LANG_KEY = 'focus-space:lang'

const DICTS: Record<Lang, Record<Key, string>> = { es, en }

/** Browsers announce their languages in order of preference; anything that isn't Spanish gets English. */
export function detectLang(languages: readonly string[] = typeof navigator === 'undefined' ? [] : navigator.languages?.length ? navigator.languages : [navigator.language]): Lang {
  const first = languages.find(Boolean)?.toLowerCase() ?? 'es'
  return first.startsWith('es') ? 'es' : 'en'
}

export function loadLang(): Lang {
  const saved = readJSON(LANG_KEY)
  return saved === 'es' || saved === 'en' ? saved : detectLang()
}

export function translate(lang: Lang, key: Key | (string & {}), vars?: Vars): string {
  const text = DICTS[lang][key as Key] ?? es[key as Key] ?? key
  return vars ? text.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m)) : text
}

/** Dynamic keys (`phase.${phase}`) are built from closed unions, so the cast lives here once. */
export type T = (key: Key | (string & {}), vars?: Vars) => string
