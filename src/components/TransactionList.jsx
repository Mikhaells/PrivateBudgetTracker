import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { CATEGORY_ICONS, TYPES, TYPE_LABELS } from '../lib/constants'
import { formatCurrency, formatDate } from '../lib/format'
import { CARD_CLS } from '../lib/ui'

const PAGE_SIZE = 25

function rowEntrance(i) {
  return {
    initial: { opacity: 0, y: 18, rotateX: -8 },
    whileInView: { opacity: 1, y: 0, rotateX: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { delay: Math.min(i * 0.04, 0.4), type: 'spring', stiffness: 160, damping: 20 },
  }
}

function catMeta(type, id, categories) {
  const defs = categories?.[type] || []
  return defs.find((c) => c.id === id) || { id, label: id, color: '#78716c', icon: 'lainnya' }
}

function EmptyState() {
  return (
    <div className={`${CARD_CLS} px-6 py-14 text-center`}>
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-surface-2 text-muted">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4"
          />
        </svg>
      </span>
      <p className="mt-4 text-sm font-semibold text-ink/80">Belum ada transaksi yang cocok.</p>
      <p className="mt-1 text-xs text-muted">Coba ubah filter, atau tambahkan transaksi baru lewat form di atas.</p>
    </div>
  )
}

const ACTIONS = {
  edit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7m-1.4-9.4a2 2 0 1 1 2.8 2.8L11 17l-4 1 1-4 9.6-9.4z" />
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
}

function ActionButton({ label, tone, onClick, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`grid h-10 w-10 cursor-pointer place-items-center rounded-lg text-muted transition active:scale-95 ${tone}`}
    >
      {icon}
    </button>
  )
}

function MobileCard({ t, onEdit, onDelete, categories, index }) {
  const meta = catMeta(t.type, t.category, categories)
  const income = t.type === TYPES.INCOME

  return (
    <motion.li
      {...rowEntrance(index)}
      style={{ transformPerspective: 700 }}
      className="flex items-start gap-3 border-b border-line/70 px-4 py-3.5 transition-colors last:border-0 hover:bg-cream/60"
    >
      <span
        className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl"
        style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d={CATEGORY_ICONS[meta.icon] || CATEGORY_ICONS[meta.id] || CATEGORY_ICONS.lainnya} />
        </svg>
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-ink">{meta.label}</p>
          <p className={`shrink-0 text-sm font-bold tabular-nums ${income ? 'text-income' : 'text-expense'}`}>
            {income ? '+' : '−'}{formatCurrency(t.amount)}
          </p>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted">
          {t.note || <span className="text-muted">Tanpa catatan</span>}
        </p>
        {t.tags?.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {t.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[11px] font-medium text-accent-strong">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <p className="mt-1 text-xs text-muted">
          {formatDate(t.date)} · {income ? 'Pemasukan' : 'Pengeluaran'}
        </p>
      </div>

      <div className="flex shrink-0 flex-col gap-1">
        <ActionButton
          label={`Edit ${TYPE_LABELS[t.type]}`}
          tone="hover:bg-primary/10 hover:text-primary"
          onClick={() => onEdit(t)}
          icon={ACTIONS.edit}
        />
        <ActionButton
          label={`Hapus ${TYPE_LABELS[t.type]}`}
          tone="hover:bg-expense/10 hover:text-expense"
          onClick={() => onDelete(t)}
          icon={ACTIONS.trash}
        />
      </div>
    </motion.li>
  )
}

export default function TransactionList({ transactions, onEdit, onDelete, categories }) {
  const [visible, setVisible] = useState(PAGE_SIZE)

  useEffect(() => {
    setVisible(PAGE_SIZE)
  }, [transactions])

  if (!transactions.length) return <EmptyState />

  const sorted = [...transactions].sort(
    (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt)
  )
  const shown = sorted.slice(0, visible)
  const remaining = sorted.length - shown.length

  return (
    <div className={`${CARD_CLS} overflow-hidden`}>
      <div className="flex items-center justify-between border-b border-line/70 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
            </svg>
          </span>
          <h2 className="font-bold text-ink">Riwayat Transaksi</h2>
          <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted">
            {transactions.length} transaksi
          </span>
        </div>
      </div>

      {/* Mobile: kartu */}
      <ul className="divide-y divide-line/70 md:hidden">
        {shown.map((t, i) => (
          <MobileCard key={t.id} t={t} index={i} onEdit={onEdit} onDelete={onDelete} categories={categories} />
        ))}
      </ul>

      {/* Desktop: tabel */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line/70 bg-cream/60 text-xs uppercase tracking-wide text-muted">
              <th className="px-5 py-3 font-semibold">Tanggal</th>
              <th className="px-5 py-3 font-semibold">Kategori</th>
              <th className="px-5 py-3 font-semibold">Catatan &amp; Tag</th>
              <th className="px-5 py-3 text-right font-semibold">Jumlah</th>
              <th className="px-5 py-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((t, i) => {
              const meta = catMeta(t.type, t.category, categories)
              const income = t.type === TYPES.INCOME
              return (
                <motion.tr
                  key={t.id}
                  {...rowEntrance(i)}
                  style={{ transformPerspective: 700 }}
                  className="group border-b border-line/70 transition-colors last:border-0 hover:bg-cream/60"
                >
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <p className="font-medium text-ink/80">{formatDate(t.date)}</p>
                    <p className="text-xs text-muted">{income ? 'Pemasukan' : 'Pengeluaran'}</p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${
                        income ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'
                      }`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="2" className="h-3.5 w-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d={CATEGORY_ICONS[meta.icon] || CATEGORY_ICONS[meta.id] || CATEGORY_ICONS.lainnya} />
                      </svg>
                      {meta.label}
                    </span>
                  </td>
                  <td className="max-w-xs px-5 py-3.5">
                    <p className="truncate text-ink/80">
                      {t.note || <span className="text-muted">Tanpa catatan</span>}
                    </p>
                    {t.tags?.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {t.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[11px] font-medium text-accent-strong">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className={`whitespace-nowrap px-5 py-3.5 text-right font-semibold tabular-nums ${income ? 'text-income' : 'text-expense'}`}>
                    {income ? '+' : '−'}{formatCurrency(t.amount)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-1">
                      <ActionButton
                        label={`Edit ${TYPE_LABELS[t.type]}`}
                        tone="hover:bg-primary/10 hover:text-primary"
                        onClick={() => onEdit(t)}
                        icon={ACTIONS.edit}
                      />
                      <ActionButton
                        label={`Hapus ${TYPE_LABELS[t.type]}`}
                        tone="hover:bg-expense/10 hover:text-expense"
                        onClick={() => onDelete(t)}
                        icon={ACTIONS.trash}
                      />
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {remaining > 0 && (
        <button
          type="button"
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
          className="w-full cursor-pointer border-t border-line/70 py-3.5 text-sm font-semibold text-primary transition hover:bg-cream/60"
        >
          Muat {Math.min(PAGE_SIZE, remaining)} transaksi lagi (sisa {remaining})
        </button>
      )}
    </div>
  )
}
