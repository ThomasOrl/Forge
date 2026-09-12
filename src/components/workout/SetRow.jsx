import { useLanguage } from '../../contexts/LanguageContext'

export default function SetRow({ set, onUpdate, onDelete }) {
  const { t } = useLanguage()

  return (
    <div className="flex items-center gap-2 py-2 animate-fadeIn">
      <span className="w-8 text-sm font-semibold text-secondary text-center">{set.set_number}</span>
      <div className="flex-1 flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          value={set.weight}
          onChange={(e) => onUpdate({ ...set, weight: e.target.value })}
          className="w-full px-3 py-2.5 rounded-btn bg-dark-cardAlt border border-app text-center text-primary font-semibold focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <span className="text-xs text-secondary w-6">{t('common.kg')}</span>
      </div>
      <span className="text-secondary">×</span>
      <div className="flex-1 flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          value={set.repetitions}
          onChange={(e) => onUpdate({ ...set, repetitions: e.target.value })}
          className="w-full px-3 py-2.5 rounded-btn bg-dark-cardAlt border border-app text-center text-primary font-semibold focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
      <button onClick={() => onDelete(set)} className="text-secondary hover:text-red-400 px-2 text-lg leading-none">×</button>
    </div>
  )
}
