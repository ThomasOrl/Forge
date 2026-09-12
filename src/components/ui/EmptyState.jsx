export default function EmptyState({ title, text, actionLabel, onAction, icon }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 animate-fadeIn">
      {icon && <div className="mb-4 text-secondary">{icon}</div>}
      <h3 className="text-lg font-bold text-primary mb-2">{title}</h3>
      <p className="text-sm text-secondary max-w-sm mb-6">{text}</p>
      {actionLabel && (
        <button onClick={onAction} className="px-5 py-3 rounded-btn bg-accent text-black font-semibold text-sm hover:bg-accent-hover transition-colors">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
