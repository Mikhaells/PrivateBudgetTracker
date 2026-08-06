import { CATEGORIES, CHART_COLORS, TYPES } from './constants'
import { monthKey, monthLabel } from './format'

export function summarize(transactions) {
  return transactions.reduce(
    (acc, t) => {
      if (t.type === TYPES.INCOME) acc.income += Number(t.amount) || 0
      else acc.expense += Number(t.amount) || 0
      return acc
    },
    { income: 0, expense: 0 }
  )
}

export function expenseByCategory(transactions) {
  const expenseList = transactions.filter((t) => t.type === TYPES.EXPENSE)
  const map = new Map()
  for (const t of expenseList) {
    map.set(t.category, (map.get(t.category) || 0) + (Number(t.amount) || 0))
  }
  const catDefs = CATEGORIES.expense
  return [...map.entries()]
    .map(([id, value]) => ({
      id,
      label: catDefs.find((c) => c.id === id)?.label || id,
      value,
      color: catDefs.find((c) => c.id === id)?.color || CHART_COLORS[map.size % CHART_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value)
}

// Bar: pemasukan vs pengeluaran per bulan (dari seluruh data atau rentang filter).
export function monthlyComparison(transactions) {
  const buckets = new Map()
  for (const t of transactions) {
    const key = monthKey(t.date)
    if (!buckets.has(key)) buckets.set(key, { income: 0, expense: 0 })
    const b = buckets.get(key)
    if (t.type === TYPES.INCOME) b.income += Number(t.amount) || 0
    else b.expense += Number(t.amount) || 0
  }
  const keys = [...buckets.keys()].sort()
  return {
    labels: keys.map(monthLabel),
    income: keys.map((k) => buckets.get(k).income),
    expense: keys.map((k) => buckets.get(k).expense),
  }
}

// Data untuk chart bar "pengeluaran per kategori" dalam rentang aktif.
export function expenseByCategoryOverTime(transactions) {
  return expenseByCategory(transactions)
}

export function allTags(transactions) {
  const set = new Set()
  for (const t of transactions) for (const tag of t.tags || []) set.add(tag)
  return [...set].sort()
}
