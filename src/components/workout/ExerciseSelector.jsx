import { useState, useMemo } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'

export default function ExerciseSelector({ open, onClose, exercises, onSelect, onCreateNew }) {
  const { t } = useLanguage()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return exercises
    const q = search.toLowerCase()
    return exercises.filter(e => e.name.toLowerCase().includes(q) || e.muscle_group.toLowerCase().includes(q))
  }, [exercises, search])

  return (
    <Modal open={open} onClose={onClose} title={t('workout.chooseExercise')}>
      <Input
        placeholder={t('exercises.searchPlaceholder')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />
      <div className="max-h-72 overflow-y-auto flex flex-col gap-1 mb-4">
        {filtered.map(ex => (
          <button
            key={ex.id}
            onClick={() => onSelect(ex)}
            className="flex items-center justify-between px-4 py-3 rounded-btn hover:bg-dark-cardAlt text-left transition-colors"
          >
            <span className="font-medium text-primary">{ex.name}</span>
            <span className="text-xs text-secondary">{ex.muscle_group}</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-secondary text-center py-6">—</p>
        )}
      </div>
      <Button variant="secondary" className="w-full" onClick={onCreateNew}>
        {t('workout.createNewExercise')}
      </Button>
    </Modal>
  )
}
