import { useMemo } from 'react'
import { motion } from 'motion/react'
import { CATEGORY_ICONS } from '../lib/constants'
import { budgetByCategory } from '../lib/analytics'
import { formatCurrency, monthLabel } from '../lib/format'

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function Row({ row, index }) {
  const over = row.remaining < 0
  const pctShown = Math.round(row.pct * 100)
  const barPct = Math.min(row.pct, 1) * 100
  const barColor = over ? 'bg-rose-500' : row.pct >= 0.85 ? 'bg-amber-500' : 'bg-emerald-500'

  return (
    <motion.li
      initial={{ opacity: 0, y: 22, rotateX: -12 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: Math.min(index * 0.06, 0.45), type: 'spring', stiffness: 150, damping: 18 }}
      style={{ transformPerspective: 800 }}
      className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3.5 transition hover:border-slate-300 hover:bg-slate-50"
    >
      <div className="flex items-center gap-2.5">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
          style={{ backgroundColor: `${row.color}1a`, color: row.color }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5">
            <path strokeLinecap="round" strokeLinejoin="round" d={CATEGORY_ICONS[row.icon] || CATEGORY_ICONS[row.id] || CATEGORY_ICONS.lainnya} />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">{row.label}</p>
          <p className="text-xs text-slate-500">
            Anggaran <span className="font-semibold text-slate-600">{formatCurrency(row.budget)}</span>
            {' · '}Terpakai <span className="font-semibold text-slate-600">{formatCurrency(row.spent)}</span>
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            over ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {over ? 'Minus' : 'Surplus'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${barPct}%` }}
          />
        </div>
        <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-500">{pctShown}%</span>
      </div>

      <p className={`text-xs font-medium ${over ? 'text-rose-600' : 'text-emerald-600'}`}>
        {over ? 'Melebihi' : 'Sisa'}: {formatCurrency(Math.abs(row.remaining))}
      </p>
    </motion.li>
  )
}

export default function BudgetPanel({ categories, transactions, onManage }) {
  const month = useMemo(currentMonth, [])
  const rows = useMemo(
    () => budgetByCategory(transactions, categories, month),
    [transactions, categories, month]
  )

  const totalBudget = rows.reduce((acc, r) => acc + r.budget, 0)
  const totalSpent = rows.reduce((acc, r) => acc + r.spent, 0)
  const totalOver = totalBudget - totalSpent < 0

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-brand-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
            </svg>
          </span>
          <h2 className="font-bold text-slate-800">Anggaran Kategori</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
            {monthLabel(month)}
          </span>
        </div>
        <button
          type="button"
          onClick={onManage}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
          </svg>
          Kelola Kategori
        </button>
      </div>

      {rows.length ? (
        <>
          <div
            className={`mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-sm ring-1 ${
              totalOver
                ? 'bg-rose-50 text-rose-700 ring-rose-200'
                : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
            }`}
          >
            <span className="font-semibold">
              Total {totalOver ? 'Minus' : 'Surplus'} bulan ini
            </span>
            <span className="font-bold tabular-nums">
              {formatCurrency(Math.abs(totalBudget - totalSpent))}
            </span>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((r, i) => (
              <Row key={r.id} row={r} index={i} />
            ))}
          </ul>
        </>
      ) : (
        <div className="grid place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-10 text-center">
          <div className="flex flex-col items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-slate-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
            </svg>
            <p className="text-sm text-slate-500">Belum ada anggaran kategori.</p>
            <p className="text-xs text-slate-500">
              Atur rencana alokasi tiap kategori lewat "Kelola Kategori" agar bisa memantau surplus/minus.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
