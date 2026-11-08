import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { writeJSON } from '@/shared/lib/storage'
import { I18nContext, type I18n } from './context'
import { LANG_KEY, loadLang, translate, type Lang } from './translate'

/** Holds the chosen language (saved, or detected from the browser) and keeps <html lang> in step. */
export default function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadLang)
  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    writeJSON(LANG_KEY, l)
  }, [])
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  const value = useMemo<I18n>(() => ({ lang, setLang, t: (key, vars) => translate(lang, key, vars) }), [lang, setLang])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
