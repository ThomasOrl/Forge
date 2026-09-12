import { useLanguage } from '../../contexts/LanguageContext'
import SetRow from './SetRow'
import { calculateExerciseVolume, formatVolume } from '../../utils/calculations'

export default function ExerciseCard({ workoutExercise, onAddSet, onUpdateSet, onDeleteSet, onRemove }) {
  const { t } = useLanguage()
  const exercise = workoutExercise.exercises
  const sets = workoutExercise.sets || []
  const volume = calculateExerciseVolume(sets)

  return (
    <div className="card p-5 animate-slideUp">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h4 className="font-bold text-primary">{exercise?.name}</h4>
          <p className="text-xs text-secondary">{exercise?.muscle_group}</p>
        </div>
        <button onClick={() => onRemove(workoutExercise)} className="text-secondary hover:text-red-400 text-sm px-2">
          {t('common.delete')}
        </button>
      </div>

      {sets.length > 0 && (
        <div className="mt-3 mb-1">
          {sets.map(s => (
            <SetRow key={s.id} set={s} onUpdate={onUpdateSet} onDelete={onDeleteSet} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-app">
        <button
          onClick={() => onAddSet(workoutExercise)}
          className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors"
        >
          {t('workout.addSet')}
        </button>
        {sets.length > 0 && (
          <span className="text-xs text-secondary">
            Volume: <span className="font-semibold text-primary">{formatVolume(volume)} {t('common.kg')}</span>
          </span>
        )}
      </div>
    </div>
  )
}
