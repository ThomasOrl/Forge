import { useEffect, useId, useRef } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }) {
  const { t } = useLanguage()
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const titleId = useId()
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return

    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

    const getFocusableElements = () =>
      [...(dialogRef.current?.querySelectorAll(focusableSelector) ?? [])]

    const onKey = (event) => {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (!focusableElements.length) {
        event.preventDefault()
        dialogRef.current?.focus()
        return
      }

      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    getFocusableElements()[0]?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      if (previousFocus instanceof HTMLElement) previousFocus.focus()
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-black/60 animate-fadeIn" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative w-full ${maxWidth} card p-6 animate-slideUp sm:animate-scaleIn max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-card`}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 id={titleId} className="text-lg font-bold text-primary">{title}</h3>
          <button type="button" onClick={onClose} aria-label={t('common.close')} className="text-secondary hover:text-primary text-xl leading-none px-2">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}
