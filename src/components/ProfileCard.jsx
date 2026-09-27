import { useLanguage } from '../contexts/LanguageContext'
import { localeFromLang } from '../utils/calculations'

export default function ProfileCard({
  profile,
  onChangeAvatar,
  avatarUploading,
  avatarError,
}) {
  const { t, language } = useLanguage()
  const initials = (profile?.first_name?.[0] || profile?.username?.[0] || '?').toUpperCase()

  return (
    <div className="card relative isolate overflow-hidden p-5 sm:p-6 flex items-center gap-4 sm:gap-5 animate-fadeIn border-accent/20 bg-gradient-to-br from-accent/10 to-transparent">
      <div className="absolute -right-12 -top-20 -z-10 w-52 h-52 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-xl sm:text-2xl font-bold text-accent overflow-hidden shrink-0 shadow-cardHover">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : initials}
      </div>
      <div className="relative min-w-0 flex-1">
        <h3 className="font-bold text-primary truncate">{profile?.first_name || profile?.username}</h3>
        <p className="text-sm text-secondary truncate">{profile?.email}</p>
        <p className="text-xs text-secondary mt-1">
          {t('profile.memberSince')} {profile?.created_at && new Date(profile.created_at).toLocaleDateString(localeFromLang(language), { month: 'long', year: 'numeric' })}
        </p>
        <button
          type="button"
          onClick={onChangeAvatar}
          disabled={avatarUploading}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10 disabled:cursor-wait disabled:opacity-60"
        >
          {avatarUploading ? t('common.loading') : t('profile.changeAvatar')}
        </button>
        {avatarError && (
          <p className="mt-2 text-sm text-red-400" role="alert">
            {avatarError}
          </p>
        )}
      </div>
    </div>
  )
}
