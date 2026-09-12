import { NavLink } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'

const items = [
  { to: '/', key: 'home', icon: '🏠', labelKey: 'nav.home' },
  { to: '/workout', key: 'workout', icon: '💪', labelKey: 'nav.workout' },
  { to: '/history', key: 'history', icon: '📜', labelKey: 'nav.history' },
  { to: '/profile', key: 'profile', icon: '👤', labelKey: 'nav.profile' },
]

export default function MobileNavigation() {
  const { t } = useLanguage()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-dark-card/95 backdrop-blur border-t border-app flex items-center justify-around px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
      {items.map(item => (
        <NavLink
          key={item.key}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-3 py-1.5 rounded-btn text-[11px] font-medium min-w-[64px] transition-colors ${
              isActive ? 'text-accent' : 'text-secondary'
            }`
          }
        >
          <span className="text-lg leading-none">{item.icon}</span>
          <span>{t(item.labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  )
}
