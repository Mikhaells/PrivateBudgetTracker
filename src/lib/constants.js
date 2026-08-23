export const STORAGE_KEY = 'budget-tracker.v1'
export const TAGS_KEY = 'budget-tracker.tags.v1'
export const CATEGORIES_KEY = 'budget-tracker.categories.v1'
export const SEEDED_KEY = 'budget-tracker.seeded.v1'

export const TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
}

export const TYPE_LABELS = {
  [TYPES.INCOME]: 'Pemasukan',
  [TYPES.EXPENSE]: 'Pengeluaran',
}

// Kategori bawaan — dipakai sebagai data awal, lalu disimpan ke LocalStorage
// sehingga pengguna bisa menambah/mengedit/menghapus kategori dan anggarannya.
export const DEFAULT_CATEGORIES = {
  expense: [
    { id: 'makanan', label: 'Makanan & Minuman', color: '#f43f5e', type: TYPES.EXPENSE },
    { id: 'transportasi', label: 'Transportasi', color: '#f97316', type: TYPES.EXPENSE },
    { id: 'belanja', label: 'Belanja', color: '#eab308', type: TYPES.EXPENSE },
    { id: 'tagihan', label: 'Tagihan & Utilitas', color: '#3b82f6', type: TYPES.EXPENSE },
    { id: 'hiburan', label: 'Hiburan', color: '#a855f7', type: TYPES.EXPENSE },
    { id: 'kesehatan', label: 'Kesehatan', color: '#06b6d4', type: TYPES.EXPENSE },
    { id: 'pendidikan', label: 'Pendidikan', color: '#10b981', type: TYPES.EXPENSE },
    { id: 'lainnya', label: 'Lainnya', color: '#64748b', type: TYPES.EXPENSE },
  ],
  income: [
    { id: 'gaji', label: 'Gaji', color: '#10b981', type: TYPES.INCOME },
    { id: 'bonus', label: 'Bonus', color: '#22c55e', type: TYPES.INCOME },
    { id: 'freelance', label: 'Freelance', color: '#14b8a6', type: TYPES.INCOME },
    { id: 'investasi', label: 'Investasi', color: '#84cc16', type: TYPES.INCOME },
    { id: 'lainnya', label: 'Lainnya', color: '#64748b', type: TYPES.INCOME },
  ],
}

export const DEFAULT_CATEGORY_ID = 'makanan'

// Ikon inline (SVG path) per kategori untuk tampilan lebih hidup.
export const CATEGORY_ICONS = {
  makanan: 'M12 21c3.9 0 7-2.6 7-6 0-3.5-2.2-5.2-3.9-6.6C13.7 7.2 12 5.5 12 3c0 0-1.7 4-2.6 5.6C8.2 10.5 5 12.7 5 15c0 3.4 3.1 6 7 6z',
  transportasi: 'M9 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm10 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM3 13h18l-1.5-7H5.6L3 13z',
  belanja: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6zm0 2h12l1 2H5l1-2zm-1 4h14v12H5V8zm4 2v2a3 3 0 0 0 6 0v-2h-2v2a1 1 0 0 1-2 0v-2H9z',
  tagihan: 'M4 2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9l-4 4v-4H2V4a2 2 0 0 1 2-2zm14 6H6v2h12V8zm0 4H6v2h12v-2z',
  hiburan: 'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM8 15l5-5 2 2 4-4v8H8v-1z',
  kesehatan: 'M12 21s-7.5-4.7-9.5-9C1 8.2 2.8 5 6.2 5c2.1 0 3.6 1.1 4.5 2.6h1.4c1-1.5 2.5-2.6 4.5-2.6 3.4 0 5.2 3.2 3.7 7-2 4.3-9.3 9-9.3 9z',
  pendidikan: 'M12 3 1 8l11 5 9-4.1V15h2V8L12 3zM5 13.2V17c0 1.7 3.1 3 7 3s7-1.3 7-3v-3.8L12 16 5 13.2z',
  gaji: 'M3 5h18v14H3V5zm2 2v2h14V7H5zm0 6v2h14v-2H5z',
  bonus: 'M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8L12 2z',
  freelance: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm4.5 4.8a1 1 0 1 1-1 0h.5a1 1 0 0 1 .5.8zM12 8a8 8 0 1 1-8 8 8 8 0 0 1 8-8zm0 2a6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6 6 6 0 0 0-6-6zm0 3l1.5 1.5L12 16l-1.5-1.5L12 13z',
  investasi: 'M21 21H3V3h2v16h16v2zM17.5 6.5 13 11l-3-3-5 5 1.4 1.4 3.6-3.6 3 3 5.5-5.5-1.4-1.4z',
  lainnya: 'M4 10v9h16v-9M2 7l10-5 10 5H2zm4 6h4v2H6v-2zm8 0h4v2h-4v-2z',
}

export const PRESET_RANGES = [
  { id: '7d', label: '7 Hari' },
  { id: '30d', label: '30 Hari' },
  { id: 'bulan', label: 'Bulan Ini' },
  { id: 'all', label: 'Semua' },
]

export const CHART_COLORS = [
  '#f43f5e', '#f97316', '#eab308', '#3b82f6', '#a855f7',
  '#06b6d4', '#10b981', '#84cc16', '#6366f1', '#ec4899',
]

// Pilihan ikon yang bisa dipakai untuk kategori baru (path-nya ada di CATEGORY_ICONS).
export const CATEGORY_ICON_CHOICES = [
  'makanan', 'transportasi', 'belanja', 'tagihan', 'hiburan',
  'kesehatan', 'pendidikan', 'gaji', 'bonus', 'freelance',
  'investasi', 'lainnya',
]

// Pilihan warna untuk kategori baru (tidak duplikat).
export const CATEGORY_COLOR_CHOICES = [
  ...new Set([
    ...CHART_COLORS,
    ...Object.values(DEFAULT_CATEGORIES).flat().map((c) => c.color),
  ]),
]
