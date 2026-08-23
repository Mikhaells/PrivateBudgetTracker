import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Ya, lanjutkan',
  cancelLabel = 'Batal',
  danger = true,
  onConfirm,
  onCancel,
}) {
  const backdropRef = useRef(null)
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const dialog = dialogRef.current
    const focusables = () => Array.from(dialog.querySelectorAll(FOCUSABLE))
    focusables()[0]?.focus()

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCancel()
        return
      }
      if (e.key !== 'Tab') return
      const list = focusables()
      if (!list.length) return
      const first = list[0]
      const last = list[list.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      ref={backdropRef}
      role="presentation"
      onClick={(e) => {
        if (e.target === backdropRef.current) onCancel()
      }}
      className="fixed inset-0 z-[60] grid place-items-center bg-navy-900/60 p-4 backdrop-blur-sm"
    >
      <motion.div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        initial={{ opacity: 0, y: 24, rotateX: -12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, rotateX: 10, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        style={{ transformPerspective: 700 }}
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200"
      >
        <div className="flex items-start gap-3">
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
              danger ? 'bg-rose-100 text-rose-600' : 'bg-brand-50 text-brand-600'
            }`}
          >
            {danger ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8 13 3.5 3.5L20 8" />
              </svg>
            )}
          </span>
          <div className="min-w-0">
            <h2 id="confirm-title" className="text-base font-bold text-slate-800">
              {title}
            </h2>
            <p id="confirm-message" className="mt-1.5 text-sm leading-relaxed text-slate-500">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition ${
              danger
                ? 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-rose-500/25 hover:from-rose-600 hover:to-rose-700'
                : 'bg-gradient-to-r from-brand-500 to-brand-600 shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
