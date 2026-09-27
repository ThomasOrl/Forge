import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import PageTitle from '../components/ui/PageTitle'

export default function Settings() {
  const { signOut, user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto">
      <div className="mb-7">
        <PageTitle icon="/ForgeIcons/Parametres.png">
          {t('settings.title')}
        </PageTitle>
      </div>

      <section className="card relative isolate overflow-hidden p-5 sm:p-6 mb-6 border-accent/15 bg-gradient-to-br from-accent/5 to-transparent">
        <div className="absolute -right-12 -top-20 -z-10 w-52 h-52 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex items-center gap-4 min-w-0">
            <span className="flex w-12 h-12 shrink-0 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 20c.7-3.2 3.2-5 7-5s6.3 1.8 7 5" />
              </svg>
            </span>
            <div className="min-w-0">
              <h2 className="font-bold text-primary mb-1">{t('settings.account')}</h2>
              <p className="text-sm text-secondary truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={handleLogout}
            className="self-start sm:self-auto"
            icon={<LogoutIcon />}
          >
            {t('nav.logout')}
          </Button>
        </div>
      </section>

      <section className="card p-5 sm:p-6 border-red-500/20 bg-red-500/[0.025]">
        <div className="flex items-start gap-3 mb-4">
          <span className="flex w-10 h-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 text-red-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
              <path d="M12 3.5 21 20H3l9-16.5Z" />
              <path d="M12 9v4m0 3.5h.01" />
            </svg>
          </span>
          <div>
            <h2 className="font-bold text-red-400 mb-1">{t('settings.dangerZone')}</h2>
            <p className="text-sm text-secondary">
              {t('settings.deleteAccount')}
            </p>
          </div>
        </div>
        <Button variant="danger" disabled>
          {t('settings.deleteAccount')}
        </Button>
      </section>
    </div>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <path d="M10 17l5-5-5-5m5 5H3" />
      <path d="M13 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" />
    </svg>
  )
}
