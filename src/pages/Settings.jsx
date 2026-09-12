import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function Settings() {
  const { signOut, user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="animate-fadeIn max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-6">{t('settings.title')}</h1>

      <div className="card p-6 mb-6">
        <h3 className="font-bold text-primary mb-2">{t('settings.account')}</h3>
        <p className="text-sm text-secondary mb-4">{user?.email}</p>
        <Button variant="secondary" onClick={handleLogout}>{t('nav.logout')}</Button>
      </div>

      <div className="card p-6 border-red-950">
        <h3 className="font-bold text-red-400 mb-2">{t('settings.dangerZone')}</h3>
        <p className="text-sm text-secondary mb-4">
          {t('settings.deleteAccount')}
        </p>
        <Button variant="danger" disabled>{t('settings.deleteAccount')}</Button>
      </div>
    </div>
  )
}
