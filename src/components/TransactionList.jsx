import { CATEGORIES, CATEGORY_ICONS, TYPES, TYPE_LABELS } from '../lib/constants'
import { formatCurrency, formatDate } from '../lib/format'

function catMeta(type, id) {
  const defs = CATEGORIES[type] || []
  return defs.find((c) => c.id === id) || { id, label: id, color: '#64748b' }
}

function EmptyState() {
  return (
    <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-slate-200">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4"
          />
        </svg>
      </span>
      <p className="mt-4 text-sm font-semibold text-slate-600">Belum ada transaksi yang cocok.</p>
      <p className="mt-1 text-xs text-slate-400">Coba ubah filter, atau tambahkan transaksi baru lewat form di atas.</p>
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
      className={`grid h-10 w-10 cursor-pointer place-items-center rounded-lg text-slate-400 transition active:scale-95 ${tone}`}
    >
      {icon}
    </button>
  )
}

function MobileCard({ t, onEdit, onDelete }) {
  const meta = catMeta(t.type, t.category)
  const income = t.type === TYPES.INCOME

  return (
    <li className="flex items-start gap-3 border-b border-slate-100 px-4 py-3.5 transition-colors last:border-0 hover:bg-brand-50/40">
      <span
        className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl"
        style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d={CATEGORY_ICONS[meta.id] || CATEGORY_ICONS.lainnya} />
        </svg>
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-slate-800">{meta.label}</p>
          <p className={`shrink-0 text-sm font-bold tabular-nums ${income ? 'text-emerald-600' : 'text-rose-600'}`}>
            {income ? '+' : '−'}{formatCurrency(t.amount)}
          </p>
        </div>
        <p className="mt-0.5 truncate text-xs text-slate-500">
          {t.note || <span className="text-slate-400">Tanpa catatan</span>}
        </p>
        {t.tags?.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {t.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <p className="mt-1 text-[11px] text-slate-400">
          {formatDate(t.date)} · {income ? 'Pemasukan' : 'Pengeluaran'}
        </p>
      </div>

      <div className="flex shrink-0 flex-col gap-1">
        <ActionButton
          label={`Edit ${TYPE_LABELS[t.type]}`}
          tone="hover:bg-indigo-50 hover:text-indigo-600"
          onClick={() => onEdit(t)}
          icon={ACTIONS.edit}
        />
        <ActionButton
          label={`Hapus ${TYPE_LABELS[t.type]}`}
          tone="hover:bg-rose-50 hover:text-rose-600"
          onClick={() => onDelete(t)}
          icon={ACTIONS.trash}
        />
      </div>
    </li>
  )
}

export default function TransactionList({ transactions, onEdit, onDelete }) {
  if (!transactions.length) return <EmptyState />

  const sorted = [...transactions].sort(
    (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt)
  )

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-brand-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
            </svg>
          </span>
          <h2 className="font-bold text-slate-800">Riwayat Transaksi</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
            {transactions.length} transaksi
          </span>
        </div>
      </div>

      {/* Mobile: kartu */}
      <ul className="divide-y divide-slate-50 md:hidden">
        {sorted.map((t) => (
          <MobileCard key={t.id} t={t} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </ul>

      {/* Desktop: tabel */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-semibold">Tanggal</th>
              <th className="px-5 py-3 font-semibold">Kategori</th>
              <th className="px-5 py-3 font-semibold">Catatan &amp; Tag</th>
              <th className="px-5 py-3 text-right font-semibold">Jumlah</th>
              <th className="px-5 py-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t) => {
              const meta = catMeta(t.type, t.category)
              const income = t.type === TYPES.INCOME
              return (
                <tr
                  key={t.id}
                  className="group border-b border-slate-50 transition-colors last:border-0 hover:bg-brand-50/40"
                >
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <p className="font-medium text-slate-700">{formatDate(t.date)}</p>
                    <p className="text-xs text-slate-400">{income ? 'Pemasukan' : 'Pengeluaran'}</p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${
                        income ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="2" className="h-3.5 w-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d={CATEGORY_ICONS[meta.id] || CATEGORY_ICONS.lainnya} />
                      </svg>
                      {meta.label}
                    </span>
                  </td>
                  <td className="max-w-xs px-5 py-3.5">
                    <p className="truncate text-slate-700">
                      {t.note || <span className="text-slate-400">Tanpa catatan</span>}
                    </p>
                    {t.tags?.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {t.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className={`whitespace-nowrap px-5 py-3.5 text-right font-semibold tabular-nums ${income ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {income ? '+' : '−'}{formatCurrency(t.amount)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-1">
                      <ActionButton
                        label={`Edit ${TYPE_LABELS[t.type]}`}
                        tone="hover:bg-indigo-50 hover:text-indigo-600"
                        onClick={() => onEdit(t)}
                        icon={ACTIONS.edit}
                      />
                      <ActionButton
                        label={`Hapus ${TYPE_LABELS[t.type]}`}
                        tone="hover:bg-rose-50 hover:text-rose-600"
                        onClick={() => onDelete(t)}
                        icon={ACTIONS.trash}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
