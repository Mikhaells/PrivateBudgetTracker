import { useState } from 'react'
import { formatNumber } from '../lib/format'

const MAX_DIGITS = 12
const OPS = new Set(['+', '-', '×', '÷'])

const round = (n) => Math.round(n)

const fmtToken = (t) => (typeof t === 'number' ? formatNumber(t) : t)

function evaluate(tokens, current) {
  const nums = [...tokens]
  if (current !== '') nums.push(Number(current))

  const reduced = []
  for (let i = 0; i < nums.length; i++) {
    const t = nums[i]
    if ((t === '×' || t === '÷') && typeof reduced[reduced.length - 1] === 'number') {
      const b = nums[i + 1]
      if (typeof b !== 'number') break
      const a = reduced.pop()
      reduced.push(round(t === '×' ? a * b : a / b))
      i++
    } else {
      reduced.push(t)
    }
  }

  let acc = typeof reduced[0] === 'number' ? reduced[0] : 0
  for (let j = 1; j < reduced.length; j += 2) {
    const b = reduced[j + 1]
    if (typeof b !== 'number') break
    acc = round(reduced[j] === '+' ? acc + b : acc - b)
  }
  return acc
}

const digitKey =
  'cursor-pointer rounded-lg bg-surface py-2 text-sm font-bold text-ink ring-1 ring-line transition hover:bg-cream active:scale-95'
const opKey =
  'cursor-pointer rounded-lg bg-primary/10 py-2 text-sm font-bold text-primary transition hover:bg-primary/20 active:scale-95'

export default function Calculator({ onApply, onClose }) {
  const [tokens, setTokens] = useState([])
  const [current, setCurrent] = useState('')
  const [history, setHistory] = useState('')
  const [fresh, setFresh] = useState(false)

  const total = evaluate(tokens, current)
  const hasPending = tokens.length > 0
  const isError = !Number.isFinite(total)
  const canApply = (current !== '' || hasPending) && !isError

  const reset = () => {
    setTokens([])
    setCurrent('')
    setHistory('')
    setFresh(false)
  }

  const pressDigit = (d) => {
    if (isError) reset()
    setHistory('')
    if (fresh) {
      setCurrent(d)
      setFresh(false)
      return
    }
    setCurrent((c) => (c.length >= MAX_DIGITS ? c : c === '0' ? d : c + d))
  }

  const pressOp = (op) => {
    if (isError) return
    setHistory('')
    setFresh(false)
    if (current === '') {
      if (!tokens.length) return
      setTokens((t) => [...t.slice(0, -1), op])
    } else {
      setTokens((t) => [...t, Number(current), op])
      setCurrent('')
    }
  }

  const pressEquals = () => {
    if (!hasPending) return
    const parts = tokens.map(fmtToken)
    if (current !== '') parts.push(formatNumber(Number(current)))
    const result = evaluate(tokens, current)
    if (!Number.isFinite(result)) {
      reset()
      setHistory('Tidak bisa dibagi nol')
      return
    }
    setHistory(`${parts.join(' ')} =`)
    setTokens([])
    setCurrent(String(result))
    setFresh(true)
  }

  const pressPercent = () => {
    if (isError || current === '') return
    setCurrent(String(round(Number(current) / 100)))
  }

  const pressBack = () => {
    if (isError) {
      reset()
      return
    }
    setFresh(false)
    if (current) setCurrent((c) => c.slice(0, -1))
    else setTokens((t) => t.slice(0, -1))
  }

  const apply = () => {
    if (!canApply) return
    onApply(Math.max(0, total))
  }

  const exprLine =
    history ||
    (hasPending
      ? `${tokens.map(fmtToken).join(' ')}${current !== '' ? ` ${formatNumber(Number(current))}` : ''}`
      : ' ')
  const mainLine = isError
    ? 'Error'
    : current !== ''
      ? formatNumber(Number(current))
      : hasPending
        ? ' '
        : '0'

  return (
    <div className="animate-[count-up_0.18s_ease-out] select-none rounded-xl border border-line bg-surface-2 p-3 shadow-sm shadow-black/5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Kalkulator</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup kalkulator"
          className="cursor-pointer rounded-md p-1 text-muted transition hover:bg-line/60 hover:text-ink"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="rounded-lg bg-surface px-3 py-2 text-right ring-1 ring-line">
        <div className="truncate text-xs text-muted">{exprLine}</div>
        <div className={`truncate text-xl font-bold ${isError ? 'text-expense' : 'text-ink'}`}>{mainLine}</div>
        {hasPending && !isError && (
          <div className="mt-0.5 text-xs font-semibold text-income">= {formatNumber(total)}</div>
        )}
      </div>

      <div className="mt-2 grid grid-cols-4 gap-1.5">
        <button
          type="button"
          onClick={reset}
          className="cursor-pointer rounded-lg bg-expense/10 py-2 text-sm font-bold text-expense transition hover:bg-expense/20 active:scale-95"
        >
          C
        </button>
        <button type="button" onClick={pressBack} className={opKey}>
          ⌫
        </button>
        <button type="button" onClick={pressPercent} className={opKey}>
          %
        </button>
        <button type="button" onClick={() => pressOp('÷')} className={opKey}>
          ÷
        </button>

        {['7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+'].map((k) =>
          OPS.has(k) ? (
            <button key={k} type="button" onClick={() => pressOp(k)} className={opKey}>
              {k}
            </button>
          ) : (
            <button key={k} type="button" onClick={() => pressDigit(k)} className={digitKey}>
              {k}
            </button>
          ),
        )}

        <button type="button" onClick={() => pressDigit('0')} className={`${digitKey} col-span-2`}>
          0
        </button>
        <button
          type="button"
          onClick={pressEquals}
          className="col-span-2 cursor-pointer rounded-lg bg-accent py-2 text-sm font-bold text-white shadow-sm transition hover:bg-accent-strong active:scale-95"
        >
          =
        </button>
      </div>

      <button
        type="button"
        onClick={apply}
        disabled={!canApply}
        className="mt-2 w-full cursor-pointer rounded-lg bg-primary py-2 text-sm font-bold text-white shadow-sm transition hover:bg-primary-strong active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Gunakan Hasil
      </button>
    </div>
  )
}
