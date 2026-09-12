import { useState, useMemo } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useExercises } from '../hooks/useExercises'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'

const MUSCLE_GROUPS = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'abs', 'glutes', 'cardio', 'other']

export default function Exercises() {
  const { t } = useLanguage()
  const { exercises, loading, addExercise, updateExercise, deleteExercise } = useExercises()

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', muscle_group: 'chest', description: '' })
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    if (!search) return exercises
    const q = search.toLowerCase()
    return exercises.filter(e => e.name.toLowerCase().includes(q))
  }, [exercises, search])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', muscle_group: 'chest', description: '' })
    setModalOpen(true)
  }

  const openEdit = (ex) => {
    setEditing(ex)
    setForm({ name: ex.name, muscle_group: ex.muscle_group, description: ex.description || '' })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    if (editing) {
      await updateExercise(editing.id, form)
    } else {
      await addExercise(form)
    }
    setSaving(false)
    setModalOpen(false)
  }

  const handleDelete = async (id) => {
    await deleteExercise(id)
    setModalOpen(false)
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">{t('exercises.title')}</h1>
        <Button onClick={openCreate}>{t('exercises.addExercise')}</Button>
      </div>

      <Input
        placeholder={t('exercises.searchPlaceholder')}
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-6"
      />

      {loading ? (
        <p className="text-secondary text-sm">{t('common.loading')}</p>
      ) : filtered.length === 0 && !search ? (
        <EmptyState
          title={t('exercises.emptyTitle')}
          text={t('exercises.emptyText')}
          actionLabel={t('exercises.addExercise')}
          onAction={openCreate}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map(ex => (
            <button
              key={ex.id}
              onClick={() => openEdit(ex)}
              className="card p-4 text-left hover:border-accent/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-primary">{ex.name}</h4>
                {ex.is_demo && <span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-cardAlt text-secondary border border-app">{t('common.demoTag')}</span>}
              </div>
              <p className="text-xs text-secondary mt-1">{t(`exercises.muscleGroups.${ex.muscle_group}`)}</p>
            </button>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('exercises.editExercise') : t('exercises.addExercise')}>
        <div className="flex flex-col gap-4">
          <Input label={t('exercises.name')} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">{t('exercises.muscleGroup')}</label>
            <select
              value={form.muscle_group}
              onChange={e => setForm(f => ({ ...f, muscle_group: e.target.value }))}
              className="w-full px-4 py-3 rounded-btn bg-transparent border border-app text-primary focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {MUSCLE_GROUPS.map(g => (
                <option key={g} value={g} className="bg-dark-card">{t(`exercises.muscleGroups.${g}`)}</option>
              ))}
            </select>
          </div>
          <Input label={t('exercises.description')} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

          <div className="flex gap-2 mt-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? t('common.loading') : t('common.save')}
            </Button>
            {editing && (
              <Button variant="danger" onClick={() => handleDelete(editing.id)}>
                {t('common.delete')}
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
