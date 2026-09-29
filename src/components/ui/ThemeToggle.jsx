import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'

export default function ThemeToggle({ compact = false }) {
  const { theme, setTheme } = useTheme()
  const { t } = useLanguage()
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex items-center gap-1.5 px-3 py-2 rounded-btn text-sm text-secondary hover:text-primary hover:bg-dark-cardAlt transition-colors"
      aria-label={t('common.changeTheme')}
    >
      <span className="text-base">{isDark ? '🌙' : '☀️'}</span>
      {!compact && <span>{isDark ? 'Nuit' : 'Jour'}</span>}
    </button>
  )
}
