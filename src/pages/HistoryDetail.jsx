import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { fetchWorkoutDetail } from '../hooks/useWorkouts'
import { calculateExerciseVolume, formatVolume, localeFromLang } from '../utils/calculations'
import PageTitle from '../components/ui/PageTitle'

export default function HistoryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const [workout, setWorkout] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetchWorkoutDetail(id).then(({ data, error }) => {
      if (mounted && !error) setWorkout(data)
      setLoading(false)
    })
    return () => { mounted = false }
  }, [id])

  if (loading) return <p className="text-secondary text-sm">{t('common.loading')}</p>
  if (!workout) return <p className="text-secondary text-sm">—</p>

  const dateLabel = new Date(workout.date).toLocaleDateString(localeFromLang(language), {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="animate-fadeIn max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-sm text-secondary hover:text-primary mb-4">← {t('nav.history')}</button>

      <PageTitle icon="/ForgeIcons/Historique.png" className="mb-1">
        {workout.name}
      </PageTitle>
      <p className="text-sm text-secondary mb-6">{dateLabel}</p>

      <div className="flex flex-col gap-4 mb-6">
        {workout.workout_exercises?.map(we => {
          const volume = calculateExerciseVolume(we.sets || [])
          return (
            <div key={we.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-primary">{we.exercises?.name}</h4>
                <span className="text-xs text-secondary">{formatVolume(volume)} {t('common.kg')}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {(we.sets || []).sort((a,b) => a.set_number - b.set_number).map(s => (
                  <p key={s.id} className="text-sm text-secondary">
                    <span className="text-primary font-medium">{t('workout.set')} {s.set_number}</span> — {s.weight} {t('common.kg')} × {s.repetitions}
                  </p>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="card p-5 flex items-center justify-between">
        <span className="text-secondary font-medium">{t('history.totalVolume')}</span>
        <span className="text-xl font-bold text-accent">{formatVolume(workout.total_volume)} {t('common.kg')}</span>
      </div>
    </div>
  )
}
