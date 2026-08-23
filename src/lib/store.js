import { CATEGORIES_KEY, STORAGE_KEY, TAGS_KEY } from './constants'

function safeJsonParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export function uid() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function loadTransactions() {
  return safeJsonParse(localStorage.getItem(STORAGE_KEY), [])
}

export function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
}

export function loadTags() {
  return safeJsonParse(localStorage.getItem(TAGS_KEY), [])
}

export function saveTags(tags) {
  localStorage.setItem(TAGS_KEY, JSON.stringify(tags))
}

export function loadCategories() {
  return safeJsonParse(localStorage.getItem(CATEGORIES_KEY), null)
}

export function saveCategories(categories) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
}

export function clearAll() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(TAGS_KEY)
}

// Contoh data agar grafik tidak kosong saat pertama kali dibuka.
export function createSeedTransactions() {
  const today = new Date()
  const iso = (d) => d.toISOString().slice(0, 10)
  const daysAgo = (n) => {
    const d = new Date(today)
    d.setDate(d.getDate() - n)
    return iso(d)
  }

  return [
    { id: uid(), type: 'income', amount: 7500000, category: 'gaji', date: daysAgo(18), note: 'Gaji bulanan', tags: ['rutin'], createdAt: Date.now() },
    { id: uid(), type: 'income', amount: 1500000, category: 'freelance', date: daysAgo(9), note: 'Project landing page', tags: ['side-job'], createdAt: Date.now() },
    { id: uid(), type: 'income', amount: 250000, category: 'bonus', date: daysAgo(4), note: 'Bonus performa', tags: ['performa'], createdAt: Date.now() },
    { id: uid(), type: 'expense', amount: 850000, category: 'makanan', date: daysAgo(14), note: 'Belanja bulanan', tags: ['kebutuhan'], createdAt: Date.now() },
    { id: uid(), type: 'expense', amount: 350000, category: 'makanan', date: daysAgo(7), note: 'Makan di luar', tags: ['harian'], createdAt: Date.now() },
    { id: uid(), type: 'expense', amount: 400000, category: 'transportasi', date: daysAgo(12), note: 'Top up e-money', tags: ['bensin'], createdAt: Date.now() },
    { id: uid(), type: 'expense', amount: 1200000, category: 'tagihan', date: daysAgo(8), note: 'Listrik & internet', tags: ['rumah'], createdAt: Date.now() },
    { id: uid(), type: 'expense', amount: 300000, category: 'hiburan', date: daysAgo(3), note: 'Streaming + tiket', tags: ['liburan'], createdAt: Date.now() },
    { id: uid(), type: 'expense', amount: 200000, category: 'kesehatan', date: daysAgo(5), note: 'Vitamin', tags: ['kebutuhan'], createdAt: Date.now() },
    { id: uid(), type: 'expense', amount: 500000, category: 'pendidikan', date: daysAgo(10), note: 'Kursus online', tags: ['belajar'], createdAt: Date.now() },
  ]
}
