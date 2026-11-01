import { useEffect, useRef, useState } from 'react'
import {
  CATEGORY_COLOR_CHOICES,
  CATEGORY_ICON_CHOICES,
  CATEGORY_ICONS,
  TYPES,
  TYPE_LABELS,
} from '../lib/constants'
import { formatAmountInput, onlyDigits, slugify } from '../lib/format'
import { INPUT_CLS } from '../lib/ui'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function CategoryItem({ cat, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 transition hover:border-primary/30 hover:bg-cream/60">
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
        style={{ backgroundColor: `${cat.color}1a`, color: cat.color }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5">
          <path strokeLinecap="round" strokeLinejoin="round" d={CATEGORY_ICONS[cat.icon] || CATEGORY_ICONS[cat.id] || CATEGORY_ICONS.lainnya} />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{cat.label}</p>
        <p className="truncate text-xs text-muted">
          {cat.id}
          {cat.type === TYPES.EXPENSE && Number(cat.budget) > 0 && (
            <span className="text-muted"> · Anggaran {formatAmountInput(String(cat.budget))}</span>
          )}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(cat)}
          aria-label={`Edit ${cat.label}`}
          className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-muted transition hover:bg-primary/10 hover:text-primary"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7m-1.4-9.4a2 2 0 1 1 2.8 2.8L11 17l-4 1 1-4 9.6-9.4z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onDelete(cat)}
          aria-label={`Hapus ${cat.label}`}
          className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-muted transition hover:bg-expense/10 hover:text-expense"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function CategoryManager({ categories, onSave, onDelete, onClose }) {
  const [type, setType] = useState(TYPES.EXPENSE)
  const [editing, setEditing] = useState(null)
  const [label, setLabel] = useState('')
  const [icon, setIcon] = useState('lainnya')
  const [color, setColor] = useState(CATEGORY_COLOR_CHOICES[0])
  const [budget, setBudget] = useState('')
  const formRef = useRef(null)
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !dialog) return
      const list = Array.from(dialog.querySelectorAll(FOCUSABLE))
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

    dialog?.querySelector('input, button')?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  const resetForm = () => {
    setEditing(null)
    setLabel('')
    setIcon('lainnya')
    setColor(CATEGORY_COLOR_CHOICES[0])
    setBudget('')
  }

  const switchType = (t) => {
    if (editing) resetForm()
    setType(t)
  }

  const startEdit = (cat) => {
    setType(cat.type)
    setEditing(cat)
    setLabel(cat.label)
    setIcon(cat.icon || cat.id || 'lainnya')
    setColor(cat.color || CATEGORY_COLOR_CHOICES[0])
    setBudget(cat.budget ? formatAmountInput(String(cat.budget)) : '')
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const cleanLabel = label.trim()
    if (!cleanLabel) return

    let id = editing ? editing.id : slugify(cleanLabel)
    if (!editing) {
      const ids = new Set(categories[type].map((c) => c.id))
      const base = id
      let n = 2
      while (ids.has(id)) id = `${base}-${n++}`
    }

    const data = {
      id,
      type,
      label: cleanLabel,
      icon,
      color,
      ...(type === TYPES.EXPENSE ? { budget: budget ? Number(onlyDigits(budget)) : 0 } : {}),
    }
    onSave(data, !editing)
    resetForm()
  }

  const handleDelete = (cat) => {
    onDelete(cat)
    if (editing?.id === cat.id && editing.type === cat.type) resetForm()
  }

  const list = categories[type] || []

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="kategori-manager-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl shadow-black/20 ring-1 ring-line"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line/70 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/10 text-accent-strong">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10M4 18h6" />
              </svg>
            </span>
            <h2 id="kategori-manager-title" className="text-lg font-bold text-ink">Kelola Kategori</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {/* Tipe */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-2 p-1 ring-1 ring-line/60">
            {[TYPES.EXPENSE, TYPES.INCOME].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchType(t)}
                className={`cursor-pointer rounded-lg py-2 text-sm font-semibold transition ${
                  type === t
                    ? t === TYPES.EXPENSE
                      ? 'bg-expense text-white shadow'
                      : 'bg-income text-white shadow'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          {/* Daftar kategori */}
          <div className="mt-4 space-y-2">
            {list.length ? (
              list.map((c) => (
                <CategoryItem key={c.id} cat={c} onEdit={startEdit} onDelete={handleDelete} />
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-line bg-cream/50 px-4 py-6 text-center text-sm text-muted">
                Belum ada kategori {TYPE_LABELS[type]?.toLowerCase() || ''}. Tambahkan di bawah.
              </p>
            )}
          </div>

          {/* Form tambah/edit */}
          <form ref={formRef} onSubmit={handleSubmit} className="mt-5 scroll-mt-4 rounded-xl bg-cream/50 p-4 ring-1 ring-line/70">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink">
                {editing ? `Edit "${editing.label}"` : 'Tambah Kategori Baru'}
              </h3>
              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="cursor-pointer text-xs font-medium text-muted transition hover:text-ink"
                >
                  Batal
                </button>
              )}
            </div>

            <div className="mt-3">
              <label htmlFor="kategori-nama" className="mb-1.5 block text-xs font-medium text-muted">Nama kategori</label>
              <input
                id="kategori-nama"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Contoh: Makanan & Minuman"
                className={INPUT_CLS}
              />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Ikon</label>
                <div className="grid grid-cols-6 gap-1.5">
                  {CATEGORY_ICON_CHOICES.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setIcon(id)}
                      aria-label={`Ikon ${id}`}
                      className={`grid h-9 w-full cursor-pointer place-items-center rounded-lg transition ${
                        icon === id
                          ? 'bg-primary text-white shadow'
                          : 'bg-surface text-muted ring-1 ring-line hover:bg-cream'
                      }`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d={CATEGORY_ICONS[id]} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Warna</label>
                <div className="grid grid-cols-6 gap-1.5">
                  {CATEGORY_COLOR_CHOICES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      aria-label={`Warna ${c}`}
                      className={`h-9 w-full cursor-pointer rounded-lg transition ${
                        color === c ? 'scale-110 ring-2 ring-offset-2 ring-primary/70 ring-offset-surface' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                {type === TYPES.EXPENSE && (
                  <div className="mt-3">
                    <label htmlFor="kategori-anggaran" className="mb-1.5 block text-xs font-medium text-muted">
                      Anggaran per bulan (opsional)
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted">
                        Rp
                      </span>
                      <input
                        id="kategori-anggaran"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        value={budget}
                        onChange={(e) => setBudget(formatAmountInput(e.target.value))}
                        placeholder="1.000.000"
                        className={`${INPUT_CLS} pl-9`}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-muted">
                      Kosongkan jika tidak ingin memantau anggaran kategori ini.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 w-full cursor-pointer rounded-xl bg-gradient-to-r from-primary to-primary-strong py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:brightness-110"
            >
              {editing ? 'Simpan Perubahan' : 'Tambah Kategori'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
