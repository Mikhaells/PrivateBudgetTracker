import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import './lib/chartSetup'
import { DEFAULT_CATEGORIES, SEEDED_KEY, TYPES } from './lib/constants'
import {
  clearAll,
  createSeedTransactions,
  loadCategories,
  loadTags,
  loadTransactions,
  saveCategories,
  saveTags,
  saveTransactions,
  uid,
} from './lib/store'
import { summarize, expenseByCategory, monthlyComparison, allTags } from './lib/analytics'
import { exportCSV, exportPDF } from './lib/export'
import SummaryCards from './components/SummaryCards'
import TransactionForm from './components/TransactionForm'
import FilterBar from './components/FilterBar'
import TransactionList from './components/TransactionList'
import ExportDropdown from './components/ExportDropdown'
import BudgetPanel from './components/BudgetPanel'
import CategoryManager from './components/CategoryManager'
import ConfirmDialog from './components/ConfirmDialog'
import { ChartEmpty, ExpenseBar, ExpenseDoughnut, MonthlyBar } from './components/Charts'

const DEFAULT_FILTERS = {
  type: 'all',
  category: 'all',
  from: '',
  to: '',
  search: '',
  preset: 'all',
}

// Pastikan setiap kategori punya field `type` (data lama mungkin belum memilikinya).
function normalizeCategories(cats) {
  return {
    expense: (cats.expense || []).map((c) => ({ ...c, type: TYPES.EXPENSE })),
    income: (cats.income || []).map((c) => ({ ...c, type: TYPES.INCOME })),
  }
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
  const [categories, setCategories] = useState(() => {
    const stored = loadCategories()
    if (stored) return normalizeCategories(stored)
    const seed = normalizeCategories(JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)))
    saveCategories(seed)
    return seed
  })
  const [showCategories, setShowCategories] = useState(false)
  const [tags, setTags] = useState(() => loadTags())
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [editing, setEditing] = useState(null)
  const [toast, setToast] = useState(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const toastTimer = useRef(null)
  const toastId = useRef(0)
  const formRef = useRef(null)

  useEffect(() => {
    if (editing) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [editing])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const showToast = (message, type = 'success', action = null) => {
    clearTimeout(toastTimer.current)
    toastId.current += 1
    setToast({ id: toastId.current, message, type, action })
    toastTimer.current = setTimeout(() => setToast(null), action ? 6000 : 2600)
  }

  const catLabel = (type, id) => categories[type]?.find((c) => c.id === id)?.label || id || '-'

  useEffect(() => {
    saveCategories(categories)
  }, [categories])

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
  const doughnutData = useMemo(() => expenseByCategory(filtered, categories), [filtered, categories])
  const monthly = useMemo(() => monthlyComparison(filtered), [filtered])
  const expenseBarData = useMemo(() => expenseByCategory(filtered, categories), [filtered, categories])
  const filterCategories = useMemo(() => {
    const map = new Map()
    for (const c of [...categories.expense, ...categories.income]) map.set(c.id, c)
    return [...map.values()]
  }, [categories])

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
    setTransactions((prev) => prev.filter((x) => x.id !== t.id))
    showToast(`Transaksi "${t.note || catLabel(t.type, t.category)}" dihapus`, 'danger', {
      label: 'Urungkan',
      onClick: () => {
        clearTimeout(toastTimer.current)
        setTransactions((prev) => [t, ...prev.filter((x) => x.id !== t.id)])
        setToast(null)
        showToast('Transaksi dikembalikan')
      },
    })
  }

  const handleSaveCategory = (category, isNew) => {
    setCategories((prev) => {
      const list = [...prev[category.type]]
      const idx = list.findIndex((c) => c.id === category.id)
      if (idx >= 0) list[idx] = category
      else list.push(category)
      return { ...prev, [category.type]: list.sort((a, b) => a.label.localeCompare(b.label)) }
    })
    showToast(
      isNew ? `Kategori "${category.label}" berhasil ditambahkan` : `Kategori "${category.label}" diperbarui`
    )
  }

  const handleDeleteCategory = (category) => {
    if (
      !window.confirm(
        `Hapus kategori "${category.label}"? Transaksi lama dengan kategori ini tetap tersimpan dan ditampilkan sebagai "${category.id}".`
      )
    ) {
      return
    }
    setCategories((prev) => ({
      ...prev,
      [category.type]: prev[category.type].filter((c) => c.id !== category.id),
    }))
    showToast(`Kategori "${category.label}" dihapus`, 'danger')
  }

  const handleReset = () => {
    clearAll()
    setTransactions([])
    setTags([])
    setEditing(null)
    setFilters(DEFAULT_FILTERS)
    setConfirmReset(false)
    showToast('Semua data telah dihapus', 'danger')
  }

  const handleExportCsv = () => exportCSV(filtered, categories)
  const handleExportPdf = () => exportPDF(filtered, summary, categories)

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-900/90 shadow-lg shadow-navy-900/10 backdrop-blur">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand-500 via-emerald-400 to-brand-500" />
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <motion.div
              animate={{ rotateY: [-14, 14, -14], rotateX: [8, -8, 8] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ rotateY: 360, rotateX: 0, transition: { duration: 0.9, ease: 'easeInOut' } }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m4-4H8m-4 4a8 8 0 1 1 16 0 8 8 0 0 1-16 0z" />
              </svg>
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-navy-900" />
            </motion.div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight text-white">Budget Tracker</h1>
              <p className="hidden truncate text-xs text-slate-400 sm:block">
                Dashboard keuangan pribadi — data tersimpan di browser
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCategories(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-brand-400/40 hover:bg-brand-500/10 hover:text-brand-200 sm:px-3"
              title="Kelola kategori & anggaran"
              aria-label="Kelola kategori & anggaran"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10M4 18h6" />
              </svg>
              <span className="hidden sm:inline">Kategori</span>
            </button>
            <ExportDropdown
              onExportCsv={handleExportCsv}
              onExportPdf={handleExportPdf}
              disabled={filtered.length === 0}
            />
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
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
              categories={categories}
            />
          </div>

          {/* Grafik */}
          <div className="space-y-6 lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 28, rotateX: -10 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 100, damping: 16 }}
              style={{ transformPerspective: 1200 }}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
            >
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
            </motion.div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 28, rotateY: -12 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ delay: 0.38, type: 'spring', stiffness: 100, damping: 16 }}
                style={{ transformPerspective: 1200 }}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
              >
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
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 28, rotateY: 12 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ delay: 0.46, type: 'spring', stiffness: 100, damping: 16 }}
                style={{ transformPerspective: 1200 }}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
              >
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
              </motion.div>
            </div>
          </div>
        </div>

        {/* Anggaran bulan ini */}
        <BudgetPanel
          categories={categories}
          transactions={transactions}
          onManage={() => setShowCategories(true)}
        />

        {/* Filter + Daftar */}
        <div className="space-y-4">
          <FilterBar filters={filters} onChange={setFilters} categories={filterCategories} />
          <TransactionList
            transactions={filtered}
            onEdit={setEditing}
            onDelete={handleDelete}
            categories={categories}
          />
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/80 py-6 text-center text-xs text-slate-500 backdrop-blur">
        <p>
          Budget Tracker — dibangun dengan React, Tailwind CSS, Chart.js &amp; Motion.
        </p>
        <p className="mt-1">Data disimpan lokal di browser (LocalStorage) &amp; tidak pernah dikirim ke server.</p>
      </footer>

      {/* Toast notifikasi */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:justify-end sm:pr-6"
      >
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 32, rotateX: -45, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, rotateX: 30, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              style={{ transformPerspective: 600, transformOrigin: 'bottom center' }}
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
              <p className="min-w-0 flex-1 text-sm font-medium">{toast.message}</p>
              {toast.action && (
                <button
                  type="button"
                  onClick={toast.action.onClick}
                  className="shrink-0 cursor-pointer rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-emerald-300 ring-1 ring-white/15 transition hover:bg-white/20"
                >
                  {toast.action.label}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showCategories && (
        <CategoryManager
          categories={categories}
          onSave={handleSaveCategory}
          onDelete={handleDeleteCategory}
          onClose={() => setShowCategories(false)}
        />
      )}

      <AnimatePresence>
        {confirmReset && (
          <ConfirmDialog
            open
            title="Hapus semua data?"
            message="Semua transaksi, kategori tambahan, dan anggaran akan dihapus permanen dari browser ini. Tindakan ini tidak bisa dibatalkan."
            confirmLabel="Ya, hapus semua"
            cancelLabel="Batal"
            onConfirm={handleReset}
            onCancel={() => setConfirmReset(false)}
          />
        )}
      </AnimatePresence>
    </div>
    </MotionConfig>
  )
}
