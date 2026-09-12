import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const { t } = useLanguage()

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <p className="text-secondary text-sm">{t('common.loading')}</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return children
}
