# Budget Tracker — Dashboard Keuangan Pribadi

Aplikasi **budget tracker** untuk mencatat pemasukan & pengeluaran, menganalisis arus uang dengan grafik, dan mengekspor laporan. Tanpa backend — semua data disimpan di **LocalStorage** browser.

## Fitur

- Pencatatan **pemasukan & pengeluaran** (dengan kategori ikonik: Makanan, Transportasi, Tagihan, dll.)
- **Filter** berdasarkan tipe, kategori, rentang tanggal (preset 7/30 hari, bulan ini), dan pencarian catatan/tag
- Visualisasi **Chart.js**: doughnut (pengeluaran per kategori), bar distribusi, dan bar pemasukan vs pengeluaran per bulan
- Sistem **tag** (input bebas + saran tag otomatis) untuk kategorisasi lintas-baris
- **Export ke CSV** (Excel/Sheets friendly, UTF-8 BOM) dan **PDF** (laporan + ringkasan saldo)
- Edit & hapus transaksi, reset data
- Responsif (mobile/desktop) dengan Tailwind CSS

## Stack

React 19 + Vite 8, Tailwind CSS 4, Chart.js + react-chartjs-2, jsPDF, gh-pages

## Palet Warna

Seluruh UI memakai palet ini (didefinisikan sebagai token di `src/index.css`):

| Token | Hex | Penggunaan |
| --- | --- | --- |
| `cream` | `#FAF7F0` | Background halaman |
| `surface` | `#FFFFFF` | Kartu, panel, menu, dialog |
| `surface-2` | `#F4EFE5` | Input/track sekunder (turunan) |
| `primary` | `#1F2937` | Aksi utama, teks kuat, fokus (Charcoal) |
| `accent` | `#D97706` | Aksen dekoratif, highlight (Amber/Gold) |
| `income` | `#059669` | Pemasukan/surplus (Green) |
| `expense` | `#DC2626` | Pengeluaran/defisit/hapus (Red) |
| `ink` | `#111827` | Teks utama |
| `muted` | `#78716C` | Teks sekunder, placeholder |

Turunan lain: `line` (`#E6DDCD`) untuk border, `primary-strong` (`#111827`), `accent-strong` (`#B45309`),
`income-strong` (`#047857`), dan `expense-strong` (`#B91C1C`) untuk gradient/hover.

## Menjalankan lokal

```bash
npm install
npm run dev      # buka http://localhost:5173
```

## Deploy ke GitHub Pages

```bash
npm run build
npm run deploy
```

Langkah:
1. Push repo ke GitHub.
2. `npm run deploy` — build lalu publish folder `dist` ke branch `gh-pages` (butuh akses push).
3. Di repo Settings → Pages, pilih source **Deploy from a branch** → branch `gh-pages` → `/ (root)`.

Config `base: './'` di `vite.config.js` memastikan path relatif sehingga aplikasi jalan di `https://<user>.github.io/<repo>/`.

## Struktur

```
src/
├── lib/
│   ├── constants.js   # kategori, warna, ikon, preset
│   ├── store.js       # LocalStorage CRUD + seed data
│   ├── format.js      # format mata uang/tanggal (id-ID, IDR)
│   ├── analytics.js   # agregasi untuk grafik
│   ├── chartSetup.js  # registrasi Chart.js
│   └── export.js      # export CSV & PDF (jsPDF)
├── components/        # UI: form, filter, tabel, grafik, tag, export
└── App.jsx
```
