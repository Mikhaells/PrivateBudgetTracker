import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function formatExportedAt(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function RestoreDialog({ pending, currentCounts, onConfirm, onCancel }) {
  const [mode, setMode] = useState('replace')
  const backdropRef = useRef(null)
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    const focusables = () => Array.from(dialog?.querySelectorAll(FOCUSABLE) || [])
    focusables()[0]?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCancel()
        return
      }
      if (event.key !== 'Tab') return
      const list = focusables()
      if (!list.length) return
      const first = list[0]
      const last = list[list.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [onCancel])

  if (!pending) return null

  const counts = pending.backup.counts
  const exportedAt = formatExportedAt(pending.backup.exportedAt)
  const willReplace = mode === 'replace'

  return (
    <div
      ref={backdropRef}
      role="presentation"
      onClick={(event) => {
        if (event.target === backdropRef.current) onCancel()
      }}
      className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm"
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="restore-title"
        aria-describedby="restore-description"
        initial={{ opacity: 0, y: 24, rotateX: -10, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        style={{ transformPerspective: 700 }}
        className="w-full max-w-md rounded-2xl bg-surface p-5 shadow-2xl shadow-black/20 ring-1 ring-line"
      >
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent-strong">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V9m0 0-4 4m4-4 4 4M20 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2" />
            </svg>
          </span>
          <div className="min-w-0">
            <h2 id="restore-title" className="text-base font-bold text-ink">
              Pulihkan data dari backup?
            </h2>
            <p id="restore-description" className="mt-1 truncate text-xs text-muted" title={pending.fileName}>
              {pending.fileName}
            </p>
            {exportedAt && <p className="mt-0.5 text-xs text-muted">Dibuat {exportedAt}</p>}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-surface-2 p-3 text-center ring-1 ring-line/60">
          {[
            { label: 'Transaksi', value: counts.transactions },
            { label: 'Kategori', value: counts.categories },
            { label: 'Tag', value: counts.tags },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-lg font-bold text-ink">{item.value}</p>
              <p className="text-[11px] text-muted">{item.label}</p>
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs text-muted">
          Data saat ini: {currentCounts.transactions} transaksi, {currentCounts.categories} kategori,{' '}
          {currentCounts.tags} tag.
        </p>

        {pending.warnings?.length > 0 && (
          <div className="mt-3 rounded-xl border border-accent/30 bg-accent/5 p-3">
            <p className="text-xs font-semibold text-accent-strong">Catatan dari file</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-ink/80">
              {pending.warnings.slice(0, 4).map((warning, index) => (
                <li key={`${index}-${warning}`}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={() => setMode('replace')}
            aria-pressed={willReplace}
            className={`w-full cursor-pointer rounded-xl border p-3 text-left transition ${
              willReplace
                ? 'border-expense/50 bg-expense/5 ring-1 ring-expense/20'
                : 'border-line hover:bg-cream/60'
            }`}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-ink">Ganti semua data</span>
              <span
                className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                  willReplace ? 'border-expense bg-expense' : 'border-line'
                }`}
              >
                {willReplace && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
            </span>
            <span className="mt-0.5 block text-xs text-muted">
              Isi browser ini diganti dengan isi file. Data yang belum dibackup akan hilang.
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMode('merge')}
            aria-pressed={!willReplace}
            className={`w-full cursor-pointer rounded-xl border p-3 text-left transition ${
              !willReplace
                ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/15'
                : 'border-line hover:bg-cream/60'
            }`}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-ink">Gabungkan</span>
              <span
                className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                  !willReplace ? 'border-primary bg-primary' : 'border-line'
                }`}
              >
                {!willReplace && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
            </span>
            <span className="mt-0.5 block text-xs text-muted">
              Hanya transaksi dengan ID baru yang ditambahkan. Data yang sudah ada tidak dihapus.
            </span>
          </button>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink/80 transition hover:bg-cream"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onConfirm(mode)}
            className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110 ${
              willReplace
                ? 'bg-gradient-to-r from-expense to-expense-strong shadow-expense/20'
                : 'bg-gradient-to-r from-primary to-primary-strong shadow-primary/20'
            }`}
          >
            {willReplace ? 'Ya, ganti semua' : 'Gabungkan data'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
