import { useEffect, useMemo, useRef, useState } from 'react'
import './lib/chartSetup'
import { CATEGORIES, SEEDED_KEY } from './lib/constants'
import {
  clearAll,
  createSeedTransactions,
  loadTags,
  loadTransactions,
  saveTags,
  saveTransactions,
  uid,
} from './lib/store'
import { summarize, expenseByCategory, monthlyComparison, allTags } from './lib/analytics'
import { exportCSV, exportPDF } from './lib/export'
import { formatCurrency } from './lib/format'
import SummaryCards from './components/SummaryCards'
import TransactionForm from './components/TransactionForm'
import FilterBar from './components/FilterBar'
import TransactionList from './components/TransactionList'
import ExportDropdown from './components/ExportDropdown'
import { ChartEmpty, ExpenseBar, ExpenseDoughnut, MonthlyBar } from './components/Charts'

const DEFAULT_FILTERS = {
  type: 'all',
  category: 'all',
  from: '',
  to: '',
  search: '',
  preset: 'all',
}

export default function App() {
  const [transactions, setTransactions] = useState(() => {
    const existing = loadTransactions()
    if (existing.length) return existing
    if (!localStorage.getItem(SEEDED_KEY)) {
      const seed = createSeedTransactions()
      saveTransactions(seed)
      localStorage.setItem(SEEDED_KEY, '1')
      return seed
    }
    return []
  })
  const [tags, setTags] = useState(() => loadTags())
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [editing, setEditing] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const formRef = useRef(null)

  useEffect(() => {
    if (editing) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [editing])

  const showToast = (message, type = 'success') => {
    clearTimeout(toastTimer.current)
    setToast({ message, type })
    toastTimer.current = setTimeout(() => setToast(null), 2600)
  }

  const catLabel = (type, id) => CATEGORIES[type]?.find((c) => c.id === id)?.label || id || '-'

  useEffect(() => {
    saveTransactions(transactions)
    const known = allTags(transactions)
    setTags((prev) => [...new Set([...prev, ...known])])
  }, [transactions])

  useEffect(() => {
    saveTags(tags)
  }, [tags])

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    return transactions.filter((t) => {
      if (filters.type !== 'all' && t.type !== filters.type) return false
      if (filters.category !== 'all' && t.category !== filters.category) return false
      if (filters.from && t.date < filters.from) return false
      if (filters.to && t.date > filters.to) return false
      if (q) {
        const hay = `${t.note || ''} ${(t.tags || []).join(' ')}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [transactions, filters])

  const summary = useMemo(() => summarize(filtered), [filtered])
  const doughnutData = useMemo(() => expenseByCategory(filtered), [filtered])
  const monthly = useMemo(() => monthlyComparison(filtered), [filtered])
  const expenseBarData = useMemo(() => expenseByCategory(filtered), [filtered])
  const filterCategories = useMemo(() => {
    const map = new Map()
    for (const c of [...CATEGORIES.expense, ...CATEGORIES.income]) map.set(c.id, c)
    return [...map.values()]
  }, [])

  const handleAdd = (data) => {
    const t = { ...data, id: uid(), createdAt: Date.now() }
    setTransactions((prev) => [t, ...prev])
    setEditing(null)
    const known = allTags([...transactions, t])
    setTags((prev) => [...new Set([...prev, ...known])])
    showToast(`Transaksi "${t.note || catLabel(t.type, t.category)}" berhasil disimpan`)
  }

  const handleUpdate = (data) => {
    setTransactions((prev) => prev.map((t) => (t.id === editing.id ? { ...t, ...data } : t)))
    setEditing(null)
    showToast('Perubahan berhasil disimpan')
  }

  const handleDelete = (t) => {
    if (!window.confirm(`Hapus transaksi "${t.note || catLabel(t.type, t.category)}" sebesar ${formatCurrency(t.amount)}?`)) return
    setTransactions((prev) => prev.filter((x) => x.id !== t.id))
    showToast('Transaksi dihapus', 'danger')
  }

  const handleReset = () => {
    if (!window.confirm('Hapus SEMUA data? Tindakan ini tidak bisa dibatalkan.')) return
    clearAll()
    setTransactions([])
    setTags([])
    setEditing(null)
    setFilters(DEFAULT_FILTERS)
  }

  const handleExportCsv = () => exportCSV(filtered)
  const handleExportPdf = () => exportPDF(filtered, summary)

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-900/90 shadow-lg shadow-navy-900/10 backdrop-blur">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand-500 via-emerald-400 to-brand-500" />
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m4-4H8m-4 4a8 8 0 1 1 16 0 8 8 0 0 1-16 0z" />
              </svg>
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-navy-900" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-extrabold tracking-tight text-white">Budget Tracker</h1>
              <p className="hidden truncate text-xs text-slate-400 sm:block">
                Dashboard keuangan pribadi — data tersimpan di browser
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ExportDropdown
              onExportCsv={handleExportCsv}
              onExportPdf={handleExportPdf}
              disabled={filtered.length === 0}
            />
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-300 sm:px-3"
              title="Hapus semua data"
              aria-label="Hapus semua data"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:py-8">
        <SummaryCards
          income={summary.income}
          expense={summary.expense}
          balance={summary.income - summary.expense}
          count={filtered.length}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Form */}
          <div ref={formRef} className="scroll-mt-20 lg:col-span-1">
            <TransactionForm
              initial={editing}
              onSubmit={editing ? handleUpdate : handleAdd}
              onCancel={() => setEditing(null)}
              suggestedTags={tags}
            />
          </div>

          {/* Grafik */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-brand-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4m0 4h.01" />
                    </svg>
                  </span>
                  <h2 className="font-bold text-slate-800">Pengeluaran per Kategori</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                  Sesuai filter aktif
                </span>
              </div>
              {doughnutData.length ? <ExpenseDoughnut data={doughnutData} /> : <ChartEmpty message="Tidak ada data pengeluaran pada filter ini." />}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="mb-4 flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-brand-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 15l4-4 3 3 5-6" />
                    </svg>
                  </span>
                  <h2 className="font-bold text-slate-800">Distribusi Pengeluaran</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                  Sesuai filter aktif
                </span>
                {expenseBarData.length ? <ExpenseBar data={expenseBarData} /> : <ChartEmpty message="Tidak ada data." />}
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="mb-4 flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-brand-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 12l4-4 3 3 5-6" />
                    </svg>
                  </span>
                  <h2 className="font-bold text-slate-800">Pemasukan vs Pengeluaran</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                  Sesuai filter aktif
                </span>
                {monthly.labels.length ? <MonthlyBar labels={monthly.labels} income={monthly.income} expense={monthly.expense} /> : <ChartEmpty message="Tidak ada data." />}
              </div>
            </div>
          </div>
        </div>

        {/* Filter + Daftar */}
        <div className="space-y-4">
          <FilterBar filters={filters} onChange={setFilters} categories={filterCategories} />
          <TransactionList transactions={filtered} onEdit={setEditing} onDelete={handleDelete} />
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/60 py-6 text-center text-xs text-slate-400 backdrop-blur">
        <p>
          Budget Tracker — dibangun dengan React, Tailwind CSS &amp; Chart.js.
        </p>
        <p className="mt-1">Data disimpan lokal di browser (LocalStorage) &amp; tidak pernah dikirim ke server.</p>
      </footer>

      {/* Toast notifikasi */}
      <div
        aria-live="polite"
        className={`pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center transition-all duration-300 sm:justify-end sm:pr-6 ${
          toast ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        {toast && (
          <div
            className={`pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl px-4 py-3.5 shadow-xl ring-1 backdrop-blur ${
              toast.type === 'danger'
                ? 'bg-rose-950/95 text-white ring-rose-400/30'
                : 'bg-navy-900/95 text-white ring-white/15'
            }`}
          >
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                toast.type === 'danger' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {toast.type === 'danger' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                </svg>
              )}
            </span>
            <p className="min-w-0 text-sm font-medium">{toast.message}</p>
          </div>
        )}
      </div>
    </div>
  )
}
