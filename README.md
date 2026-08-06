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
