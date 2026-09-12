import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 animate-fadeIn" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} card p-6 animate-slideUp sm:animate-scaleIn max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-card`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-primary">{title}</h3>
          <button onClick={onClose} className="text-secondary hover:text-primary text-xl leading-none px-2">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}
