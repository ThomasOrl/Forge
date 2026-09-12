import { useLanguage } from '../../contexts/LanguageContext'
import { formatVolume, formatDuration } from '../../utils/calculations'

export default function WorkoutSummary({ workout, exerciseCount, setCount, onClose }) {
  const { t } = useLanguage()
  return (
    <div className="flex flex-col items-center text-center py-4 animate-scaleIn">
      <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-3xl mb-4">✓</div>
      <h3 className="text-xl font-bold text-primary mb-1">{t('workout.workoutCompleted')}</h3>
      <p className="text-sm text-secondary mb-6">{workout.name}</p>

      <div className="grid grid-cols-2 gap-3 w-full mb-6">
        <div className="card-alt p-4">
          <p className="text-xs text-secondary mb-1">{t('workout.duration')}</p>
          <p className="text-lg font-bold text-primary">{formatDuration(workout.duration_seconds)}</p>
        </div>
        <div className="card-alt p-4">
          <p className="text-xs text-secondary mb-1">{t('common.exercises')}</p>
          <p className="text-lg font-bold text-primary">{exerciseCount}</p>
        </div>
        <div className="card-alt p-4">
          <p className="text-xs text-secondary mb-1">{t('common.sets')}</p>
          <p className="text-lg font-bold text-primary">{setCount}</p>
        </div>
        <div className="card-alt p-4">
          <p className="text-xs text-secondary mb-1">{t('dashboard.totalVolume')}</p>
          <p className="text-lg font-bold text-accent">{formatVolume(workout.total_volume)} {t('common.kg')}</p>
        </div>
      </div>

      <button onClick={onClose} className="w-full px-5 py-3 rounded-btn bg-accent text-black font-semibold hover:bg-accent-hover transition-colors">
        {t('common.close')}
      </button>
    </div>
  )
}
