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
      className="card group relative overflow-hidden p-5 sm:p-6 w-full text-left hover:shadow-cardHover hover:border-accent/40 hover:-translate-y-0.5 transition-all animate-fadeIn"
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-accent/50 group-hover:bg-accent transition-colors" />
      <div className="flex items-start justify-between gap-3 mb-2 pl-2">
        <h4 className="font-bold text-primary">{workout.name}</h4>
        {workout.is_demo && (
          <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-dark-cardAlt text-secondary border border-app">
            {t('common.demoTag')}
          </span>
        )}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pl-2">
        <p className="text-sm text-secondary">{dateLabel}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-app px-2.5 py-1 text-xs text-secondary">
            {workout.exercise_count ?? '—'} {t('common.exercises')}
          </span>
          <span className="rounded-full border border-app px-2.5 py-1 text-xs text-secondary">
            {workout.set_count ?? '—'} {t('common.sets')}
          </span>
          <span className="rounded-full border border-accent/20 bg-accent/5 px-2.5 py-1 text-xs font-semibold text-accent">
            {formatVolume(workout.total_volume)} {t('common.kg')}
          </span>
        </div>
      </div>
    </button>
  )
}
