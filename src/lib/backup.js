import {
  CATEGORIES_KEY,
  SEEDED_KEY,
  STORAGE_KEY,
  TAGS_KEY,
  TYPES,
} from './constants.js'

export const BACKUP_APP_ID = 'private-budget-tracker'
export const BACKUP_VERSION = 1
export const BACKUP_FILE_BASENAME = 'budget-tracker-backup'

const MAX_NOTE = 500
const MAX_LABEL = 80
const MAX_ID = 100
const MAX_TAG = 40
const MAX_TAGS = 25
const FALLBACK_COLOR = '#78716c'

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function toText(value, max = 200) {
  if (typeof value !== 'string' && typeof value !== 'number') return ''
  const text = String(value).trim()
  return text.length > max ? text.slice(0, max) : text
}

function toColor(value) {
  const color = toText(value, 20)
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color) ? color : FALLBACK_COLOR
}

// Menerima angka maupun string ("850000" / "850.000") karena file backup
// sering diedit manual di spreadsheet sebelum dipulihkan.
function toAmount(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? Math.round(value) : 0
  }
  if (typeof value !== 'string') return 0
  const cleaned = value.trim()
  if (!cleaned || cleaned.startsWith('-')) return 0
  const digits = cleaned.replace(/[^\d]/g, '')
  if (!digits) return 0
  const amount = Number(digits)
  return Number.isFinite(amount) && amount > 0 ? amount : 0
}

function toDate(value) {
  if (typeof value !== 'string') return null
  const text = value.trim().slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null
  const [year, month, day] = text.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  if (Number.isNaN(date.getTime())) return null
  // Menolak tanggal mustahil seperti 2026-02-31 (tanpa terpengaruh timezone).
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null
  }
  return text
}

function toTags(value) {
  if (!Array.isArray(value)) return []
  const tags = []
  for (const item of value) {
    const tag = toText(item, MAX_TAG)
    if (tag && !tags.includes(tag)) tags.push(tag)
    if (tags.length >= MAX_TAGS) break
  }
  return tags
}

function newId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function normalizeTransaction(raw) {
  if (!isPlainObject(raw)) return null
  const type = raw.type === TYPES.INCOME ? TYPES.INCOME : raw.type === TYPES.EXPENSE ? TYPES.EXPENSE : null
  if (!type) return null
  const amount = toAmount(raw.amount)
  if (!amount) return null
  const date = toDate(raw.date)
  if (!date) return null

  const createdAt = Number(raw.createdAt)
  return {
    id: toText(raw.id, MAX_ID) || newId(),
    type,
    amount,
    category: toText(raw.category, MAX_ID) || 'lainnya',
    date,
    note: toText(raw.note, MAX_NOTE),
    tags: toTags(raw.tags),
    createdAt: Number.isFinite(createdAt) && createdAt > 0 ? createdAt : new Date(`${date}T00:00:00`).getTime(),
  }
}

function normalizeCategories(raw, warnings) {
  if (!isPlainObject(raw)) return null
  const output = { [TYPES.EXPENSE]: [], [TYPES.INCOME]: [] }
  let invalid = 0

  for (const type of [TYPES.EXPENSE, TYPES.INCOME]) {
    const list = Array.isArray(raw[type]) ? raw[type] : []
    const seen = new Set()
    for (const item of list) {
      if (!isPlainObject(item)) {
        invalid += 1
        continue
      }
      const id = toText(item.id, MAX_ID)
      if (!id || seen.has(id)) {
        invalid += 1
        continue
      }
      seen.add(id)
      const category = {
        id,
        type,
        label: toText(item.label, MAX_LABEL) || id,
        color: toColor(item.color),
      }
      const icon = toText(item.icon, 40)
      if (icon) category.icon = icon
      if (type === TYPES.EXPENSE) {
        const budget = toAmount(item.budget)
        category.budget = budget
      }
      output[type].push(category)
    }
  }

  if (invalid) warnings.push(`${invalid} kategori dilewati karena formatnya tidak valid.`)
  const total = output[TYPES.EXPENSE].length + output[TYPES.INCOME].length
  return total ? output : null
}

function sortTransactions(transactions) {
  return [...transactions].sort((a, b) =>
    a.date === b.date ? (b.createdAt || 0) - (a.createdAt || 0) : a.date < b.date ? 1 : -1
  )
}

function normalizeData(data, warnings) {
  const rawTransactions = Array.isArray(data.transactions) ? data.transactions : []
  const transactions = []
  const seenIds = new Set()
  let invalid = 0
  let duplicates = 0

  for (const raw of rawTransactions) {
    const transaction = normalizeTransaction(raw)
    if (!transaction) {
      invalid += 1
      continue
    }
    if (seenIds.has(transaction.id)) {
      duplicates += 1
      continue
    }
    seenIds.add(transaction.id)
    transactions.push(transaction)
  }

  if (invalid) warnings.push(`${invalid} transaksi dilewati karena formatnya tidak valid.`)
  if (duplicates) warnings.push(`${duplicates} transaksi dilewati karena ID-nya duplikat.`)

  const categories = normalizeCategories(data.categories, warnings)
  const tags = Array.isArray(data.tags)
    ? toTags(data.tags)
    : toTags(transactions.flatMap((transaction) => transaction.tags))

  if (categories) {
    const unknown = transactions.filter(
      (transaction) => !categories[transaction.type].some((category) => category.id === transaction.category)
    ).length
    if (unknown) {
      warnings.push(
        `${unknown} transaksi memakai kategori yang tidak ada di file ini; namanya akan tampil apa adanya.`
      )
    }
  }

  return { transactions: sortTransactions(transactions), categories, tags }
}

export function backupCounts(data) {
  return {
    transactions: data.transactions?.length || 0,
    categories:
      (data.categories?.[TYPES.EXPENSE]?.length || 0) +
      (data.categories?.[TYPES.INCOME]?.length || 0),
    tags: data.tags?.length || 0,
  }
}

export function buildBackup({ transactions, categories, tags }) {
  const data = { transactions, categories, tags }
  return {
    app: BACKUP_APP_ID,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    counts: backupCounts(data),
    data,
  }
}

export function parseBackupText(text, { sourceName = 'file' } = {}) {
  if (typeof text !== 'string' || !text.trim()) {
    return { ok: false, error: 'File backup kosong.' }
  }

  let raw
  try {
    raw = JSON.parse(text.replace(/^\uFEFF/, ''))
  } catch {
    return { ok: false, error: 'File bukan JSON yang valid.' }
  }

  const warnings = []
  let envelope

  if (Array.isArray(raw)) {
    // Format lama: file hanya berisi array transaksi.
    envelope = { version: BACKUP_VERSION, exportedAt: null, data: { transactions: raw } }
    warnings.push('File berisi daftar transaksi saja (format lama).')
  } else if (isPlainObject(raw)) {
    if (raw.app && raw.app !== BACKUP_APP_ID) {
      return { ok: false, error: 'File ini bukan backup Budget Tracker.' }
    }
    const version = Number(raw.version)
    if (raw.version != null && (!Number.isInteger(version) || version < 1)) {
      return { ok: false, error: 'Versi backup tidak dikenali.' }
    }
    if (Number.isInteger(version) && version > BACKUP_VERSION) {
      return {
        ok: false,
        error: 'Backup dibuat oleh versi aplikasi yang lebih baru. Perbarui aplikasi lalu coba lagi.',
      }
    }
    envelope = {
      version: Number.isInteger(version) ? version : BACKUP_VERSION,
      exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : null,
      data: isPlainObject(raw.data) ? raw.data : raw,
    }
  } else {
    return { ok: false, error: 'Struktur file backup tidak dikenali.' }
  }

  const data = envelope.data
  if (!isPlainObject(data)) {
    return { ok: false, error: 'Struktur data backup tidak valid.' }
  }
  if (data.transactions != null && !Array.isArray(data.transactions)) {
    return { ok: false, error: 'Daftar transaksi di file tidak valid.' }
  }
  if (data.categories != null && !isPlainObject(data.categories)) {
    return { ok: false, error: 'Data kategori di file tidak valid.' }
  }
  if (data.tags != null && !Array.isArray(data.tags)) {
    return { ok: false, error: 'Data tag di file tidak valid.' }
  }

  const hasKnownShape =
    Array.isArray(data.transactions) || isPlainObject(data.categories) || Array.isArray(data.tags)
  if (!hasKnownShape) {
    return { ok: false, error: 'File tidak berisi data transaksi, kategori, atau tag.' }
  }

  const normalized = normalizeData(data, warnings)
  const backup = {
    app: BACKUP_APP_ID,
    version: envelope.version,
    exportedAt: envelope.exportedAt,
    counts: backupCounts(normalized),
    data: normalized,
  }

  return { ok: true, backup, warnings, sourceName }
}

export function applyBackup({ current, incoming, mode = 'replace' }) {
  if (mode === 'merge') {
    const transactionsById = new Map((current.transactions || []).map((transaction) => [transaction.id, transaction]))
    let addedTransactions = 0
    let skippedTransactions = 0

    for (const transaction of incoming.transactions || []) {
      if (transactionsById.has(transaction.id)) {
        skippedTransactions += 1
        continue
      }
      transactionsById.set(transaction.id, transaction)
      addedTransactions += 1
    }

    const incomingCategories = incoming.categories || { [TYPES.EXPENSE]: [], [TYPES.INCOME]: [] }
    let addedCategories = 0
    const categories = {}
    for (const type of [TYPES.EXPENSE, TYPES.INCOME]) {
      const byId = new Map((current.categories?.[type] || []).map((category) => [category.id, category]))
      for (const category of incomingCategories[type] || []) {
        if (byId.has(category.id)) continue
        byId.set(category.id, category)
        addedCategories += 1
      }
      categories[type] = [...byId.values()]
    }

    const tags = [...new Set([...(current.tags || []), ...(incoming.tags || [])])]
    const addedTags = tags.length - new Set(current.tags || []).size

    return {
      data: {
        transactions: sortTransactions([...transactionsById.values()]),
        categories,
        tags,
      },
      stats: { addedTransactions, skippedTransactions, addedCategories, addedTags },
    }
  }

  return {
    data: {
      transactions: sortTransactions(incoming.transactions || []),
      categories: incoming.categories || current.categories,
      tags: incoming.tags || [],
    },
    stats: {
      addedTransactions: (incoming.transactions || []).length,
      skippedTransactions: 0,
      addedCategories: 0,
      addedTags: (incoming.tags || []).length,
    },
  }
}

// Menulis langsung ke LocalStorage (bukan lewat store.js) agar modul ini bisa
// dipakai/diuji tanpa DOM. Efek sampingnya identik dengan saveTransactions,
// saveCategories, dan saveTags.
export function writeBackupToStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data.transactions))
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(data.categories))
  localStorage.setItem(TAGS_KEY, JSON.stringify(data.tags))
  localStorage.setItem(SEEDED_KEY, '1')
}

export function backupFileName(date = new Date()) {
  return `${BACKUP_FILE_BASENAME}-${date.toISOString().slice(0, 10)}.json`
}

export function downloadBackup(payload, fileName = backupFileName()) {
  const safeName = fileName.replace(/[\\/:*?"<>|]+/g, '-')
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = safeName
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
