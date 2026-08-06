import { useEffect, useState } from 'react'
import { CATEGORIES, CATEGORY_ICONS, TYPES, TYPE_LABELS } from '../lib/constants'
import { todayISO } from '../lib/format'
import TagInput from './TagInput'

const emptyForm = {
  type: TYPES.EXPENSE,
  amount: '',
  category: CATEGORIES.expense[0].id,
  date: todayISO(),
  note: '',
  tags: [],
}

const inputCls =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200'

const onlyDigits = (s) => s.replace(/\D/g, '')

const formatAmount = (s) => {
  const digits = onlyDigits(s).replace(/^0+(?=\d)/, '')
  return digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''
}

const toForm = (initial) =>
  initial
    ? { ...emptyForm, ...initial, amount: formatAmount(String(initial.amount ?? '')) }
    : emptyForm

export default function TransactionForm({ initial, onSubmit, onCancel, suggestedTags }) {
  const [form, setForm] = useState(() => toForm(initial))

  useEffect(() => {
    setForm(toForm(initial))
  }, [initial])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleAmountChange = (e) => {
    const raw = e.target.value
    const formatted = formatAmount(raw)
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

  const switchType = (type) => {
    const fallback = CATEGORIES[type][0].id
    setForm((f) => ({
      ...f,
      type,
      category: CATEGORIES[type].some((c) => c.id === f.category) ? f.category : fallback,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const amount = Number(onlyDigits(form.amount))
    if (!form.date || !amount || amount <= 0) return
    onSubmit({ ...form, amount, tags: form.tags })
    if (!isEdit) {
      setForm((f) => ({
        ...emptyForm,
        type: f.type,
        date: f.date,
        category: CATEGORIES[f.type][0].id,
      }))
    }
  }

  const isEdit = Boolean(initial)
  const isExpense = form.type === TYPES.EXPENSE

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl bg-white p-5 transition-all duration-300 ${
        isEdit
          ? 'shadow-lg shadow-brand-500/10 ring-2 ring-brand-400'
          : 'shadow-sm ring-1 ring-slate-200'
      }`}
    >
      {isEdit && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2.5 text-sm font-medium text-brand-700 ring-1 ring-brand-200">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7m-1.4-9.4a2 2 0 1 1 2.8 2.8L11 17l-4 1 1-4 9.6-9.4z" />
          </svg>
          Kamu sedang mengedit transaksi — ubah datanya, lalu tekan "Simpan Perubahan".
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </span>
          <h2 className="text-lg font-bold text-slate-800">
            {isEdit ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h2>
        </div>
        {isEdit && (
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer text-sm font-medium text-slate-500 transition hover:text-slate-700"
          >
            Batal edit
          </button>
        )}
      </div>

      {/* Toggle tipe */}
      <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
        {[TYPES.EXPENSE, TYPES.INCOME].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => switchType(t)}
            className={`cursor-pointer rounded-lg py-2.5 text-sm font-semibold transition ${
              form.type === t
                ? t === TYPES.EXPENSE
                  ? 'bg-rose-500 text-white shadow'
                  : 'bg-emerald-500 text-white shadow'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Jumlah + Tanggal */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">Jumlah</label>
          <div className="relative">
            <span
              className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold ${
                isExpense ? 'text-rose-500' : 'text-emerald-500'
              }`}
            >
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={form.amount}
              onChange={handleAmountChange}
              placeholder="100.000"
              className={`${inputCls} pl-11`}
              required
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">Tanggal</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            className={inputCls}
            required
          />
        </div>
      </div>

      {/* Kategori */}
      <div className="mt-5">
        <p className="mb-2 text-sm font-medium text-slate-600">Kategori</p>
        <div className="grid grid-cols-1 gap-2">
          {CATEGORIES[form.type].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => set('category', c.id)}
              className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition ${
                form.category === c.id
                  ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-300'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="2" className="h-5 w-5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d={CATEGORY_ICONS[c.id]} />
              </svg>
              <span className="min-w-0 flex-1 leading-snug">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Catatan */}
      <div className="mt-5">
        <label className="mb-1.5 block text-sm font-medium text-slate-600">Catatan</label>
        <input
          type="text"
          value={form.note}
          onChange={(e) => set('note', e.target.value)}
          placeholder="Contoh: Belanja mingguan di pasar"
          className={inputCls}
        />
      </div>

      {/* Tags */}
      <div className="mt-5">
        <label className="mb-1.5 block text-sm font-medium text-slate-600">Tag</label>
        <TagInput value={form.tags} onChange={(tags) => set('tags', tags)} suggestions={suggestedTags} />
      </div>

      <button
        type="submit"
        className={`mt-6 w-full cursor-pointer rounded-xl py-3 text-sm font-bold text-white shadow-lg transition ${
          isExpense
            ? 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-rose-500/25 hover:from-rose-600 hover:to-rose-700'
            : 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-500/25 hover:from-emerald-600 hover:to-emerald-700'
        }`}
      >
        {isEdit ? 'Simpan Perubahan' : 'Simpan Transaksi'}
      </button>
    </form>
  )
}
