import { useEffect, useState } from 'react'
import { CATEGORY_ICONS, DEFAULT_CATEGORIES, TYPES, TYPE_LABELS } from '../lib/constants'
import { formatAmountInput, onlyDigits, todayISO } from '../lib/format'
import { CARD_CLS, INPUT_CLS } from '../lib/ui'
import TagInput from './TagInput'
import Calculator from './Calculator'

const toForm = (initial, categories) => {
  const catDefs = categories[initial?.type || TYPES.EXPENSE] || DEFAULT_CATEGORIES[initial?.type] || []
  const base = {
    type: TYPES.EXPENSE,
    amount: '',
    category: catDefs[0]?.id || DEFAULT_CATEGORIES.expense[0].id,
    date: todayISO(),
    note: '',
    tags: [],
  }
  return initial
    ? { ...base, ...initial, amount: formatAmountInput(String(initial.amount ?? '')) }
    : base
}

export default function TransactionForm({ initial, onSubmit, onCancel, suggestedTags, categories }) {
  const [form, setForm] = useState(() => toForm(initial, categories))
  const [calcOpen, setCalcOpen] = useState(false)

  useEffect(() => {
    setForm(toForm(initial, categories))
  }, [initial, categories])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleAmountChange = (e) => {
    const raw = e.target.value
    const formatted = formatAmountInput(raw)
    const caret = e.target.selectionStart ?? raw.length
    const digitsBefore = onlyDigits(raw.slice(0, caret)).length

    let pos = 0
    let count = 0
    for (let i = 0; i < formatted.length; i++) {
      if (formatted[i] >= '0' && formatted[i] <= '9') {
        count += 1
        if (count === digitsBefore) {
          pos = i + 1
          break
        }
      }
    }

    set('amount', formatted)
    requestAnimationFrame(() => {
      if (document.activeElement === e.target) e.target.setSelectionRange(pos, pos)
    })
  }

  useEffect(() => {
    if (initial) return
    setForm((f) => {
      const list = categories[f.type] || DEFAULT_CATEGORIES[f.type] || []
      if (list.some((c) => c.id === f.category)) return f
      return { ...f, category: list[0]?.id || DEFAULT_CATEGORIES.expense[0].id }
    })
  }, [categories, initial])

  const switchType = (type) => {
    const list = categories[type] || DEFAULT_CATEGORIES[type] || []
    const fallback = list[0]?.id || DEFAULT_CATEGORIES.expense[0].id
    setForm((f) => ({
      ...f,
      type,
      category: list.some((c) => c.id === f.category) ? f.category : fallback,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const amount = Number(onlyDigits(form.amount))
    if (!form.date || !amount || amount <= 0) return
    onSubmit({ ...form, amount, tags: form.tags })
    if (!isEdit) {
      setForm((f) => {
        const list = categories[f.type] || DEFAULT_CATEGORIES[f.type] || []
        return {
          type: f.type,
          amount: '',
          category: list[0]?.id || DEFAULT_CATEGORIES.expense[0].id,
          date: f.date,
          note: '',
          tags: [],
        }
      })
    }
  }

  const isEdit = Boolean(initial)
  const isExpense = form.type === TYPES.EXPENSE

  return (
    <form
      onSubmit={handleSubmit}
      className={`${CARD_CLS} p-5 transition-all duration-300 ${
        isEdit ? 'shadow-primary/10 ring-2 ring-primary/40' : ''
      }`}
    >
      {isEdit && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-accent/10 px-3 py-2.5 text-sm font-medium text-accent-strong ring-1 ring-accent/25">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7m-1.4-9.4a2 2 0 1 1 2.8 2.8L11 17l-4 1 1-4 9.6-9.4z" />
          </svg>
          Kamu sedang mengedit transaksi — ubah datanya, lalu tekan "Simpan Perubahan".
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </span>
          <h2 className="text-lg font-bold text-ink">
            {isEdit ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h2>
        </div>
        {isEdit && (
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer text-sm font-medium text-muted transition hover:text-ink"
          >
            Batal edit
          </button>
        )}
      </div>

      {/* Toggle tipe */}
      <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-surface-2 p-1 ring-1 ring-line/60">
        {[TYPES.EXPENSE, TYPES.INCOME].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => switchType(t)}
            className={`cursor-pointer rounded-lg py-2.5 text-sm font-semibold transition ${
              form.type === t
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

      {/* Jumlah + Tanggal */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="form-amount" className="mb-1.5 block text-sm font-medium text-ink/70">Jumlah</label>
          <div className="relative">
            <span
              className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold ${
                isExpense ? 'text-expense' : 'text-income'
              }`}
            >
              Rp
            </span>
            <input
              id="form-amount"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={form.amount}
              onChange={handleAmountChange}
              placeholder="100.000"
              className={`${INPUT_CLS} pl-11 pr-12`}
              required
            />
            <button
              type="button"
              onClick={() => setCalcOpen((o) => !o)}
              aria-label={calcOpen ? 'Tutup kalkulator' : 'Buka kalkulator'}
              title="Kalkulator"
              className={`absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg transition ${
                calcOpen
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:bg-primary/10 hover:text-primary'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <path strokeLinecap="round" d="M8 6h8" />
                <path
                  strokeLinecap="round"
                  d="M8 11h.01M12 11h.01M16 11h.01M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01M16 17h.01"
                />
              </svg>
            </button>
          </div>
          {calcOpen && (
            <div className="mt-2">
              <Calculator
                onApply={(value) => {
                  set('amount', formatAmountInput(String(value)))
                  setCalcOpen(false)
                }}
                onClose={() => setCalcOpen(false)}
              />
            </div>
          )}
        </div>
        <div>
          <label htmlFor="form-date" className="mb-1.5 block text-sm font-medium text-ink/70">Tanggal</label>
          <input
            id="form-date"
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            className={INPUT_CLS}
            required
          />
        </div>
      </div>

      {/* Kategori */}
      <div className="mt-5">
        <p id="form-category-label" className="mb-2 text-sm font-medium text-ink/70">Kategori</p>
        <div role="radiogroup" aria-labelledby="form-category-label" className="grid grid-cols-2 gap-2">
          {(categories[form.type] || DEFAULT_CATEGORIES[form.type] || []).map((c) => (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={form.category === c.id}
              onClick={() => set('category', c.id)}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition ${
                form.category === c.id
                  ? 'border-primary bg-primary/10 text-primary-soft ring-1 ring-primary/30'
                  : 'border-line text-ink/70 hover:border-primary/30 hover:bg-cream/60'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="2" className="h-5 w-5 shrink-0">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={CATEGORY_ICONS[c.icon] || CATEGORY_ICONS[c.id] || CATEGORY_ICONS.lainnya}
                />
              </svg>
              <span className="min-w-0 flex-1 truncate leading-snug">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Catatan */}
      <div className="mt-5">
        <label htmlFor="form-note" className="mb-1.5 block text-sm font-medium text-ink/70">Catatan</label>
        <input
          id="form-note"
          type="text"
          value={form.note}
          onChange={(e) => set('note', e.target.value)}
          placeholder="Contoh: Belanja mingguan di pasar"
          className={INPUT_CLS}
        />
      </div>

      {/* Tags */}
      <div className="mt-5">
        <label htmlFor="form-tags" className="mb-1.5 block text-sm font-medium text-ink/70">Tag</label>
        <TagInput id="form-tags" value={form.tags} onChange={(tags) => set('tags', tags)} suggestions={suggestedTags} />
      </div>

      <button
        type="submit"
        className={`mt-6 w-full cursor-pointer rounded-xl py-3 text-sm font-bold shadow-lg transition hover:brightness-110 ${
          isExpense
            ? 'bg-gradient-to-r from-expense to-expense-strong text-white shadow-expense/20'
            : 'bg-gradient-to-r from-income to-income-strong text-white shadow-income/20'
        }`}
      >
        {isEdit ? 'Simpan Perubahan' : 'Simpan Transaksi'}
      </button>
    </form>
  )
}
