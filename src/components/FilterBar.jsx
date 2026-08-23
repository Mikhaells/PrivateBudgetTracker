import { useMemo } from 'react'
import { PRESET_RANGES, TYPES, TYPE_LABELS } from '../lib/constants'
import { daysAgoISO, startOfMonthISO } from '../lib/format'
import { INPUT_CLS } from '../lib/ui'

export default function FilterBar({ filters, onChange, categories }) {
  const set = (key, value) => onChange({ ...filters, [key]: value })

  const activePreset = useMemo(() => {
    const { from, to, preset } = filters
    if (preset === '7d' && from === daysAgoISO(6)) return '7d'
    if (preset === '30d' && from === daysAgoISO(29)) return '30d'
    if (preset === 'bulan' && from === startOfMonthISO()) return 'bulan'
    return preset === 'all' && !from && !to ? 'all' : ''
  }, [filters])

  const applyPreset = (preset) => {
    if (preset === '7d') return onChange({ ...filters, preset, from: daysAgoISO(6), to: '' })
    if (preset === '30d') return onChange({ ...filters, preset, from: daysAgoISO(29), to: '' })
    if (preset === 'bulan') return onChange({ ...filters, preset, from: startOfMonthISO(), to: '' })
    return onChange({ ...filters, preset: 'all', from: '', to: '' })
  }

  const hasFilter =
    filters.type !== 'all' ||
    filters.category !== 'all' ||
    filters.from ||
    filters.to ||
    filters.search.trim()

  const clearAll = () =>
    onChange({ type: 'all', category: 'all', from: '', to: '', search: '', preset: 'all' })

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-brand-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M7 12h10m-7 6h4" />
            </svg>
            Filter
          </span>
          {PRESET_RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => applyPreset(r.id)}
              aria-pressed={activePreset === r.id}
              className={`cursor-pointer rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                activePreset === r.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        {hasFilter && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            Bersihkan filter
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div>
          <label htmlFor="filter-type" className="mb-1 block text-xs font-medium text-slate-500">Tipe</label>
          <select
            id="filter-type"
            value={filters.type}
            onChange={(e) => set('type', e.target.value)}
            className={`${INPUT_CLS} cursor-pointer`}
          >
            <option value="all">Semua</option>
            <option value={TYPES.INCOME}>{TYPE_LABELS[TYPES.INCOME]}</option>
            <option value={TYPES.EXPENSE}>{TYPE_LABELS[TYPES.EXPENSE]}</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-category" className="mb-1 block text-xs font-medium text-slate-500">Kategori</label>
          <select
            id="filter-category"
            value={filters.category}
            onChange={(e) => set('category', e.target.value)}
            className={`${INPUT_CLS} cursor-pointer`}
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-from" className="mb-1 block text-xs font-medium text-slate-500">Dari tanggal</label>
          <input id="filter-from" type="date" value={filters.from} onChange={(e) => set('from', e.target.value)} className={INPUT_CLS} />
        </div>

        <div>
          <label htmlFor="filter-to" className="mb-1 block text-xs font-medium text-slate-500">Sampai tanggal</label>
          <input id="filter-to" type="date" value={filters.to} onChange={(e) => set('to', e.target.value)} className={INPUT_CLS} />
        </div>
      </div>

      <div className="mt-3">
        <label htmlFor="filter-search" className="mb-1 block text-xs font-medium text-slate-500">Cari catatan / tag</label>
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.3-4.3M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
          </svg>
          <input
            id="filter-search"
            type="search"
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
            placeholder="Ketik kata kunci…"
            className={`${INPUT_CLS} pl-9`}
          />
        </div>
      </div>
    </div>
  )
}
