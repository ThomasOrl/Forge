import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { formatVolume, localeFromLang } from '../utils/calculations'

export default function WorkoutCard({ workout }) {
  const navigate = useNavigate()
  const { t, language } = useLanguage()

  const dateLabel = new Date(workout.date).toLocaleDateString(localeFromLang(language), {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <button
      onClick={() => navigate(`/history/${workout.id}`)}
      className="card p-5 w-full text-left hover:shadow-cardHover hover:border-accent/30 transition-all animate-fadeIn"
    >
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-bold text-primary">{workout.name}</h4>
        {workout.is_demo && (
          <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-dark-cardAlt text-secondary border border-app">
            {t('common.demoTag')}
          </span>
        )}
      </div>
      <p className="text-sm text-secondary mb-3">{dateLabel}</p>
      <p className="text-sm text-secondary">
        {workout.exercise_count ?? '—'} {t('common.exercises')} · {workout.set_count ?? '—'} {t('common.sets')} · {' '}
        <span className="font-semibold text-primary">{formatVolume(workout.total_volume)} {t('common.kg')}</span>
      </p>
    </button>
  )
}
