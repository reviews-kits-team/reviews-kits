/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react'
import { en } from './locales/en'
import { fr } from './locales/fr'

export type Locale = 'en' | 'fr'

type Translations = Record<keyof typeof en, string>

const locales: Record<Locale, Translations> = { en, fr }

function translate(locale: Locale, key: keyof Translations, params?: Record<string, string | number>): string {
  let text: string = locales[locale][key] ?? locales['en'][key] ?? key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v))
    }
  }
  return text
}

interface LocaleContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: keyof Translations, params?: Record<string, string | number>) => string
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  setLocale: () => { },
  t: (key) => key as string,
})

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('rk-locale')
    return (saved === 'fr' || saved === 'en') ? saved : 'en'
  })

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('rk-locale', l)
  }

  const t = (key: keyof Translations, params?: Record<string, string | number>) =>
    translate(locale, key, params)

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
