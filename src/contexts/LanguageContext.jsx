import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { getTranslation } from '../i18n/translations'
import { supabase } from '../lib/supabase'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem('fyb_language') || 'fr')

  const t = useCallback((path) => getTranslation(language, path), [language])

  const setLanguage = useCallback(async (lang) => {
    setLanguageState(lang)
    localStorage.setItem('fyb_language', lang)
    document.documentElement.lang = lang
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({ language: lang }).eq('id', user.id)
      }
    } catch (e) {
      // silencieux : la préférence locale reste valide même hors ligne
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage doit être utilisé dans un LanguageProvider')
  return ctx
}
