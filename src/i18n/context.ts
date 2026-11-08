import { createContext, useContext } from 'react'
import { translate, type Lang, type T } from './translate'

export type I18n = { lang: Lang; setLang: (l: Lang) => void; t: T }

// Without a provider (isolated component tests) the UI stays in Spanish, its source language.
const fallback: I18n = { lang: 'es', setLang: () => {}, t: (key, vars) => translate('es', key, vars) }
export const I18nContext = createContext<I18n>(fallback)

export const useI18n = () => useContext(I18nContext)
export const useT = () => useContext(I18nContext).t
