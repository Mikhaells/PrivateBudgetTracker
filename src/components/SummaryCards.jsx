import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { formatCurrency, formatNumber } from '../lib/format'
import TiltCard from './motion/TiltCard'

const entrance = (i) => ({
  initial: { opacity: 0, y: 36, rotateX: -18 },
  animate: { opacity: 1, y: 0, rotateX: 0 },
  transition: { delay: 0.08 * i, type: 'spring', stiffness: 110, damping: 15 },
})

function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0)
  const raf = useRef(null)
  const fromRef = useRef(0)

  useEffect(() => {
    const from = fromRef.current
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fromRef.current = target
      setValue(target)
      return
    }
    const start = performance.now()
    cancelAnimationFrame(raf.current)
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      const v = from + (target - from) * eased
      fromRef.current = v
      setValue(v)
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  return value
}

const ICONS = {
  income: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m4-4H8" />
    </svg>
  ),
  expense: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9l-5 5-5-5" />
    </svg>
  ),
  balance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  ),
}

function KpiCard({ icon, chip, value, bar, index = 0 }) {
  return (
    <motion.div {...entrance(index)} style={{ transformPerspective: 900 }} className="h-full">
      <TiltCard
        max={10}
        className="group relative h-full rounded-2xl bg-surface p-5 shadow-sm shadow-black/5 ring-1 ring-line/70 transition-shadow duration-200 hover:shadow-md hover:shadow-black/10"
      >
        <div className={`absolute inset-x-0 top-0 h-0.5 rounded-t-2xl ${bar}`} />
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted">{icon.label}</p>
          <span
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${chip}`}
            style={{ transform: 'translateZ(32px)' }}
          >
            {icon.node}
          </span>
        </div>
        <p
          className="mt-3 truncate text-2xl font-bold tabular-nums tracking-tight text-ink sm:text-3xl"
          style={{ transform: 'translateZ(22px)' }}
        >
          {value}
        </p>
        <p className="mt-2 text-xs text-muted">{icon.sub}</p>
      </TiltCard>
    </motion.div>
  )
}

export default function SummaryCards({ income, expense, balance, count }) {
  const incomeV = useCountUp(income)
  const expenseV = useCountUp(expense)
  const balanceV = useCountUp(balance)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <KpiCard
        icon={{ label: 'Total Pemasukan', node: ICONS.income, sub: `${formatNumber(count)} transaksi terfilter` }}
        chip="bg-income/10 text-income"
        bar="bg-income"
        value={formatCurrency(Math.round(incomeV))}
      />
      <KpiCard
        icon={{ label: 'Total Pengeluaran', node: ICONS.expense, sub: 'Dalam rentang filter aktif' }}
        chip="bg-expense/10 text-expense"
        bar="bg-expense"
        value={formatCurrency(Math.round(expenseV))}
      />

      <motion.div {...entrance(2)} style={{ transformPerspective: 900 }} className="h-full">
        <TiltCard
          max={12}
          scale={1.03}
          className="relative h-full rounded-2xl bg-gradient-to-br from-primary to-primary-strong p-5 text-white shadow-lg shadow-primary/20 ring-1 ring-primary/10 transition-shadow duration-200 hover:shadow-xl hover:shadow-primary/30"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute -right-10 -top-14 h-40 w-40 rounded-full bg-accent/25 blur-2xl" />
            <div className="absolute -bottom-16 -left-8 h-36 w-36 rounded-full bg-income/20 blur-2xl" />
          </div>
          <div
            className="relative flex items-center justify-between"
            style={{ transform: 'translateZ(18px)' }}
          >
            <p className="text-sm font-medium text-white/70">Saldo Bersih</p>
            <motion.span
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2.5 }}
              className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-accent ring-1 ring-white/15"
              style={{ transform: 'translateZ(34px)', transformStyle: 'preserve-3d' }}
            >
              {ICONS.balance}
            </motion.span>
          </div>
          <p
            className="relative mt-3 truncate text-2xl font-bold tabular-nums tracking-tight sm:text-3xl"
            style={{ transform: 'translateZ(28px)' }}
          >
            {formatCurrency(Math.round(balanceV))}
          </p>
          <div
            className="relative mt-3 flex items-center gap-2"
            style={{ transform: 'translateZ(14px)' }}
          >
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                balance >= 0 ? 'bg-income/25 text-white' : 'bg-expense/25 text-white'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3">
                {balance >= 0 ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                )}
              </svg>
              {balance >= 0 ? 'Surplus' : 'Defisit'}
            </span>
            <span className="text-xs text-white/60">Pemasukan − Pengeluaran</span>
          </div>
        </TiltCard>
      </motion.div>
    </div>
  )
}
