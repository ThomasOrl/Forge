export function calculateSetVolume(weight, repetitions) {
  return (Number(weight) || 0) * (Number(repetitions) || 0)
}

export function calculateExerciseVolume(sets) {
  return sets.reduce((sum, s) => sum + calculateSetVolume(s.weight, s.repetitions), 0)
}

export function calculateWorkoutVolume(exercises) {
  return exercises.reduce((sum, ex) => sum + calculateExerciseVolume(ex.sets || []), 0)
}

export function formatVolume(volume) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(volume || 0))
}

export function formatDuration(seconds) {
  if (!seconds) return '0 min'
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h} h ${m} min` : `${h} h`
}

export function findBestSet(sets) {
  if (!sets || sets.length === 0) return null
  return sets.reduce((best, s) => (Number(s.weight) > Number(best.weight) ? s : best), sets[0])
}

export function isNewPersonalRecord(previousBest, weight) {
  if (!previousBest) return true
  return Number(weight) > Number(previousBest)
}

export function localeFromLang(lang) {
  return { fr: 'fr-FR', en: 'en-US', es: 'es-ES', it: 'it-IT' }[lang] || 'fr-FR'
}
