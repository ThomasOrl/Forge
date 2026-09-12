import { useLanguage } from '../contexts/LanguageContext'
import { localeFromLang } from '../utils/calculations'

export default function ProfileCard({ profile }) {
  const { t, language } = useLanguage()
  const initials = (profile?.first_name?.[0] || profile?.username?.[0] || '?').toUpperCase()

  return (
    <div className="card p-6 flex items-center gap-4 animate-fadeIn">
      <div className="w-16 h-16 rounded-full bg-accent/10 border border-app flex items-center justify-center text-xl font-bold text-accent overflow-hidden shrink-0">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : initials}
      </div>
      <div className="min-w-0">
        <h3 className="font-bold text-primary truncate">{profile?.first_name || profile?.username}</h3>
        <p className="text-sm text-secondary truncate">{profile?.email}</p>
        <p className="text-xs text-secondary mt-1">
          {t('profile.memberSince')} {profile?.created_at && new Date(profile.created_at).toLocaleDateString(localeFromLang(language), { month: 'long', year: 'numeric' })}
        </p>
      </div>
    </div>
  )
}
