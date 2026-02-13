'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { translations, type Locale, type TranslationKey } from './translations'

interface LangContextType {
  lang: Locale
  setLang: (lang: Locale) => void
  t: (key: TranslationKey) => string
}

const LangContext = createContext<LangContextType>({
  lang: 'pl',
  setLang: () => {},
  t: (key) => key,
})

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Locale>('pl')

  useEffect(() => {
    const saved = localStorage.getItem('gymrats-lang') as Locale | null
    if (saved && (saved === 'pl' || saved === 'en')) {
      setLangState(saved)
    }
  }, [])

  const setLang = useCallback((newLang: Locale) => {
    setLangState(newLang)
    localStorage.setItem('gymrats-lang', newLang)
  }, [])

  const t = useCallback(
    (key: TranslationKey): string => {
      const entry = translations[key]
      return entry?.[lang] ?? key
    },
    [lang]
  )

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
