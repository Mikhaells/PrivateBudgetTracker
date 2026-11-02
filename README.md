# Budget Tracker — Dashboard Keuangan Pribadi

Aplikasi web untuk mencatat pemasukan dan pengeluaran, memantau anggaran per kategori, menganalisis arus kas lewat grafik, serta mengekspor laporan ke CSV/PDF. Seluruh data utama disimpan di **LocalStorage** browser, dengan opsi **backup otomatis ke Google Drive** melalui folder aplikasi tersembunyi.

Dirancang sebagai aplikasi *privacy-first* dan *serverless*: tidak ada backend, tidak ada data keuangan yang dikirim ke server pihak ketiga, dan aplikasi dapat di-hosting sebagai situs statis.

## Daftar Isi

- [Fitur](#fitur)
- [Stack](#stack)
- [Mulai Cepat](#mulai-cepat)
- [Prasyarat](#prasyarat)
- [Perintah npm](#perintah-npm)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Panduan Penggunaan](#panduan-penggunaan)
- [Penyimpanan Data](#penyimpanan-data)
- [Backup ke Google Drive](#backup-ke-google-drive)
- [Format File Backup](#format-file-backup)
- [Export CSV & PDF](#export-csv--pdf)
- [Palet Warna](#palet-warna)
- [Deploy ke GitHub Pages](#deploy-ke-github-pages)
- [Struktur Proyek](#struktur-proyek)
- [Troubleshooting](#troubleshooting)
- [Privasi & Keamanan](#privasi--keamanan)

## Fitur

### Pencatatan transaksi

- Pemasukan dan pengeluaran dengan jumlah, tanggal, kategori, catatan, dan tag.
- Input jumlah otomatis berformat ribuan (IDR) serta dilengkapi kalkulator inline untuk perhitungan cepat.
- Tag bebas dengan saran otomatis dari tag yang pernah dipakai.
- Edit dan hapus transaksi, dengan aksi **Urungkan** pada notifikasi penghapusan.

### Kategori & anggaran

- Kategori bawaan untuk pemasukan (Gaji, Bonus, Freelance, Investasi, Lainnya) dan pengeluaran (Makanan, Transportasi, Belanja, Tagihan, Hiburan, Kesehatan, Pendidikan, Lainnya).
- Kelola kategori sendiri: tambah, ubah, hapus, pilih ikon dan warna, serta atur **anggaran bulanan per kategori pengeluaran**.
- Panel **Anggaran Kategori** menampilkan pemakaian, sisa/kelebihan, dan persentase per kategori untuk bulan berjalan.
- Menghapus kategori tidak menghapus transaksi lama; transaksi tersebut tetap tampil menggunakan ID kategori sebagai label.

### Analisis & visualisasi

- Kartu ringkasan: total pemasukan, total pengeluaran, saldo, dan jumlah transaksi pada filter aktif.
- Grafik **doughnut** pengeluaran per kategori.
- Grafik **bar** distribusi pengeluaran per kategori.
- Grafik **bar** perbandingan pemasukan vs pengeluaran per bulan.
- Semua grafik dan ringkasan mengikuti filter yang sedang aktif.

### Filter & riwayat

- Filter berdasarkan tipe, kategori, rentang tanggal manual, dan pencarian pada catatan/tag.
- Preset rentang cepat: **7 Hari**, **30 Hari**, **Bulan Ini**, dan **Semua**.
- Tombol bersihkan filter dan indikator jumlah hasil.
- Riwayat responsif: tabel di desktop, kartu di mobile, dimuat bertahap 25 transaksi.

### Export & backup

- Export **CSV** data terfilter (kompatibel Excel/Google Sheets, UTF-8 dengan BOM).
- Export **PDF** berisi ringkasan pemasukan, pengeluaran, saldo, dan tabel transaksi dengan pergantian halaman otomatis.
- Backup otomatis ke **Google Drive** (opsional) menggunakan `appDataFolder` dan scope `drive.appdata`.
- Deteksi konflik saat data Drive dan lokal berbeda, dengan pilihan **Pulihkan dari Drive** atau **Simpan versi ini**.

### Pengalaman pengguna

- Antarmuka responsif berbasis Tailwind CSS 4.
- Animasi halus dengan Motion, menghormati preferensi `prefers-reduced-motion`.
- Dialog konfirmasi, notifikasi toast, fokus keyboard yang jelas, dan label aksesibilitas.
- Data contoh otomatis pada pembukaan pertama agar grafik tidak kosong.

## Stack

| Kategori | Teknologi |
| --- | --- |
| UI | React 19, Vite 8, Tailwind CSS 4 |
| Animasi | Motion |
| Grafik | Chart.js 4, react-chartjs-2 |
| Export PDF | jsPDF |
| Deploy | gh-pages |
| Lint | oxlint |
| Penyimpanan | LocalStorage |
| Backup opsional | Google Drive API (`drive.appdata`) + Google Identity Services |

## Mulai Cepat

```bash
git clone <url-repo-anda>
cd PrivateBudgetTracker
npm install
npm run dev
```

Buka `http://localhost:5173`.

Backup Google Drive bersifat opsional. Tanpa konfigurasi tambahan, aplikasi tetap berjalan penuh dengan penyimpanan lokal.

## Prasyarat

- **Node.js** 20.19+ atau 22.12+ (dibutuhkan Vite 8).
- **npm** 10+.
- Browser modern yang mendukung LocalStorage, `fetch`, dan ES modules.
- (Opsional) Akun Google dan project di Google Cloud Console untuk fitur backup Drive.

## Perintah npm

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan Vite dengan hot reload. |
| `npm run build` | Membuat build produksi ke folder `dist/`. |
| `npm run preview` | Menjalankan preview build produksi secara lokal. |
| `npm run lint` | Menjalankan oxlint pada kode sumber. |
| `npm run deploy` | Build lalu publish `dist/` ke branch `gh-pages`. |

## Konfigurasi Environment

Salin contoh konfigurasi:

```bash
cp .env.example .env
```

| Variabel | Wajib | Deskripsi |
| --- | --- | --- |
| `VITE_GOOGLE_CLIENT_ID` | Tidak | OAuth Client ID (tipe *Web application*) untuk mengaktifkan backup Google Drive. |

Catatan penting:

- Variabel `VITE_*` dibaca **saat build**, bukan saat runtime.
- Jangan commit file `.env`; file tersebut sudah dikecualikan di `.gitignore`.
- Setelah mengubah `.env`, jalankan ulang `npm run dev` atau build ulang untuk produksi.

## Panduan Penggunaan

1. **Tambah transaksi** melalui form di sisi kiri: pilih tipe, isi jumlah, tanggal, kategori, catatan, dan tag.
2. **Atur kategori dan anggaran** melalui tombol **Kategori** di header. Anggaran hanya berlaku untuk kategori pengeluaran dan dihitung per bulan berjalan.
3. **Pantau ringkasan dan grafik** di bagian atas; semuanya otomatis mengikuti filter.
4. **Gunakan filter** untuk mempersempit data sebelum export.
5. **Export** CSV/PDF melalui menu **Export / Backup**.
6. **Hubungkan Google Drive** (opsional) untuk cadangan otomatis. Pada koneksi pertama, aplikasi akan menawarkan pilihan jika sudah ada backup di Drive.

Perilaku **Reset**:

- Menghapus seluruh transaksi dan tag dari browser.
- Kategori kustom dan anggaran **tetap dipertahankan**.
- Jika Google Drive sedang terhubung, koneksi diputuskan dan file backup di Drive **tidak dihapus**, sehingga masih bisa dipulihkan kapan saja.
- Data contoh tidak dibuat ulang setelah reset.

## Penyimpanan Data

Data disimpan per origin (skema + host + port). Membuka aplikasi di `localhost` dan di GitHub Pages berarti memakai penyimpanan yang berbeda.

| Key LocalStorage | Isi |
| --- | --- |
| `budget-tracker.v1` | Daftar transaksi. |
| `budget-tracker.tags.v1` | Daftar tag yang dikenal. |
| `budget-tracker.categories.v1` | Kategori pemasukan/pengeluaran beserta ikon, warna, dan anggaran. |
| `budget-tracker.seeded.v1` | Penanda bahwa data contoh sudah pernah dibuat. |
| `budget-tracker.drive.v1` | Metadata sinkronisasi Drive (`fileId`, `remoteModifiedTime`, `lastSync`, `autoSync`). Tidak berisi token. |

Access token Google **hanya disimpan di memori** dan tidak pernah ditulis ke LocalStorage.

## Backup ke Google Drive

Backup otomatis menggunakan scope `https://www.googleapis.com/auth/drive.appdata` dan menyimpan satu file bernama `budget-tracker-backup.json` di folder tersembunyi `appDataFolder`.

Keuntungan pendekatan ini:

- Aplikasi hanya dapat mengakses folder data miliknya sendiri, bukan file lain di Drive pengguna.
- File tidak muncul di tampilan Drive biasa dan tidak mengotori folder pengguna.
- Pengguna tidak perlu memilih atau membuat file secara manual.

### Setup

1. Buka [Google Cloud Console](https://console.cloud.google.com/) dan buat project baru.
2. Buka **APIs & Services → Library**, lalu aktifkan **Google Drive API**.
3. Buka **OAuth consent screen**, pilih **External**, dan lengkapi nama aplikasi serta email.
   - Selama status masih **Testing**, tambahkan setiap email pengguna sebagai **Test user** (maksimal 100).
   - Aplikasi memakai access token jangka pendek (±1 jam), sehingga mode Testing cukup untuk pemakaian pribadi.
4. Buka **Credentials → Create credentials → OAuth client ID**, pilih tipe **Web application**.
   - Tambahkan **Authorized JavaScript origins**:
     - `http://localhost:5173`
     - `https://<username>.github.io`
5. Isi **Client ID** di `.env`:

   ```bash
   VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
   ```

6. Jalankan ulang `npm run dev`, atau jalankan `npm run build` sebelum deploy produksi.

### Cara kerja sinkronisasi

- Klik **Hubungkan Google Drive**, pilih akun, lalu izinkan akses.
- Jika belum ada file backup, aplikasi membuatnya otomatis dan mengaktifkan sinkronisasi.
- Setiap perubahan data memicu unggahan otomatis setelah jeda ±4 detik (debounce).
- Jika Drive sudah memiliki backup, aplikasi menawarkan **Pulihkan dari Drive** atau **Simpan versi ini** untuk mencegah timpa data yang tidak disengaja.
- Saat halaman dibuka kembali, aplikasi mencoba menyambung ulang secara senyap menggunakan sesi Google yang aktif.
- Jika file backup terhapus dari Drive, aplikasi akan mencarinya ulang dan membuat file baru saat sinkronisasi berikutnya.

### Batasan

- Karena aplikasi murni frontend, tidak ada refresh token permanen. Token berlaku ±1 jam dan disimpan hanya di memori.
- Untuk sinkronisasi yang benar-benar "connect sekali selamanya" dan multi-perangkat secara real-time, diperlukan backend (misalnya Supabase).
- File backup berisi data keuangan **plaintext** yang dilindungi oleh kontrol akses Google Drive pada akun masing-masing pengguna.
- Sinkronisasi otomatis hanya berjalan selama tab aplikasi terbuka dan koneksi Drive aktif.

## Format File Backup

File backup adalah JSON dengan amplop versi. Contoh ringkas:

```json
{
  "app": "private-budget-tracker",
  "version": 1,
  "exportedAt": "2026-01-31T10:00:00.000Z",
  "counts": {
    "transactions": 2,
    "categories": 13,
    "tags": 2
  },
  "data": {
    "transactions": [
      {
        "id": "c2f1...",
        "type": "expense",
        "amount": 850000,
        "category": "makanan",
        "date": "2026-01-15",
        "note": "Belanja bulanan",
        "tags": ["kebutuhan"],
        "createdAt": 1768471200000
      }
    ],
    "categories": {
      "expense": [
        {
          "id": "makanan",
          "type": "expense",
          "label": "Makanan & Minuman",
          "color": "#dc2626",
          "icon": "makanan",
          "budget": 1500000
        }
      ],
      "income": []
    },
    "tags": ["kebutuhan", "rutin"]
  }
}
```

Saat memulihkan backup, data dinormalisasi dan divalidasi:

- Versi backup yang lebih baru dari aplikasi akan ditolak.
- Nilai jumlah harus positif dan tanggal harus valid (`YYYY-MM-DD`).
- Catatan dibatasi 500 karakter, label kategori 80 karakter, tag 40 karakter, maksimal 25 tag per transaksi.
- Warna kategori divalidasi sebagai hex; nilai tidak valid diganti warna fallback.
- Transaksi dengan ID duplikat atau format tidak valid dilewati, dan pengguna diberi peringatan.
- Penulisan hasil restore dilakukan secara atomik; jika penyimpanan browser penuh (`QuotaExceededError`), data lama tidak ditimpa.

## Export CSV & PDF

Export selalu mengikuti filter aktif.

**CSV**

- Kolom: `Tanggal`, `Tipe`, `Kategori`, `Catatan`, `Tag`, `Jumlah`.
- Encoding UTF-8 dengan BOM agar karakter Indonesia tampil benar di Excel.
- Nilai yang mengandung koma, kutip, atau baris baru akan di-escape sesuai standar CSV.
- Nama file: `transaksi-YYYY-MM-DD.csv`.

**PDF**

- Ringkasan pemasukan, pengeluaran, dan saldo.
- Tabel transaksi dengan header berulang dan pagination otomatis.
- Nama file: `laporan-keuangan-YYYY-MM-DD.pdf`.

## Palet Warna

Seluruh UI memakai palet berikut (didefinisikan sebagai token Tailwind di `src/index.css`):

| Token | Hex | Penggunaan |
| --- | --- | --- |
| `cream` | `#FAF7F0` | Background halaman |
| `surface` | `#FFFFFF` | Kartu, panel, menu, dialog |
| `surface-2` | `#F4EFE5` | Input dan track sekunder |
| `primary` | `#1F2937` | Aksi utama, teks kuat, fokus (Charcoal) |
| `accent` | `#D97706` | Aksen dekoratif, highlight (Amber/Gold) |
| `income` | `#059669` | Pemasukan/surplus (Green) |
| `expense` | `#DC2626` | Pengeluaran/defisit/hapus (Red) |
| `ink` | `#111827` | Teks utama |
| `muted` | `#78716C` | Teks sekunder, placeholder |

Turunan: `line` (`#E6DDCD`) untuk border, `primary-strong` (`#111827`), `primary-soft` (`#374151`), `accent-strong` (`#B45309`), `income-strong` (`#047857`), dan `expense-strong` (`#B91C1C`) untuk gradient/hover.

## Deploy ke GitHub Pages

```bash
npm run build
npm run deploy
```

Langkah lengkap:

1. Push repo ke GitHub.
2. Set `VITE_GOOGLE_CLIENT_ID` di `.env` sebelum build (jika memakai backup Drive).
3. Jalankan `npm run deploy` — perintah ini melakukan build lalu mem-publish folder `dist/` ke branch `gh-pages`.
4. Buka **Settings → Pages** pada repo, pilih source **Deploy from a branch**, lalu pilih branch `gh-pages` dan folder `/ (root)`.
5. Pastikan origin GitHub Pages (misalnya `https://<username>.github.io`) sudah terdaftar di **Authorized JavaScript origins** pada Google Cloud Console.

Konfigurasi `base: './'` di `vite.config.js` membuat path aset relatif, sehingga aplikasi dapat berjalan di `https://<username>.github.io/<repo>/` tanpa penyesuaian tambahan.

## Struktur Proyek

```text
.
├── public/                  # Aset statis (favicon, dll.)
├── src/
│   ├── components/
│   │   ├── motion/
│   │   │   └── TiltCard.jsx      # Kartu dengan efek tilt
│   │   ├── BudgetPanel.jsx       # Panel anggaran kategori bulan ini
│   │   ├── Calculator.jsx        # Kalkulator inline pada form
│   │   ├── CategoryManager.jsx   # CRUD kategori, ikon, warna, anggaran
│   │   ├── Charts.jsx            # Doughnut dan bar chart
│   │   ├── ConfirmDialog.jsx     # Dialog konfirmasi
│   │   ├── ExportDropdown.jsx    # Menu export & Google Drive
│   │   ├── FilterBar.jsx         # Filter dan preset rentang
│   │   ├── SummaryCards.jsx      # Kartu ringkasan
│   │   ├── TagInput.jsx          # Input tag dengan saran
│   │   ├── TransactionForm.jsx   # Form tambah/edit transaksi
│   │   └── TransactionList.jsx   # Tabel/kartu riwayat transaksi
│   ├── lib/
│   │   ├── analytics.js          # Agregasi ringkasan, kategori, bulanan
│   │   ├── backup.js             # Build, validasi, dan restore backup
│   │   ├── chartSetup.js         # Registrasi komponen Chart.js
│   │   ├── constants.js          # Kategori bawaan, warna, ikon, preset
│   │   ├── drive.js              # Google Drive API & OAuth token
│   │   ├── export.js             # Export CSV dan PDF
│   │   ├── format.js             # Format IDR, tanggal, input angka
│   │   ├── store.js              # CRUD LocalStorage dan seed data
│   │   ├── ui.js                 # Kelas Tailwind bersama
│   │   ├── useDriveBackup.js     # Hook koneksi, auto-sync, restore
│   │   └── useMediaQuery.js      # Hook media query
│   ├── App.jsx                   # Orkestrasi state dan layout
│   ├── index.css                 # Tailwind, token warna, base style
│   └── main.jsx                  # Entry point React
├── index.html
├── vite.config.js
├── package.json
└── .env.example
```

## Troubleshooting

| Masalah | Penyebab umum | Solusi |
| --- | --- | --- |
| Menu Google Drive bertuliskan "belum disiapkan" | `VITE_GOOGLE_CLIENT_ID` kosong atau build belum diulang. | Isi `.env`, lalu jalankan ulang `npm run dev` atau build ulang. |
| Popup login Google tidak muncul | Popup diblokir browser. | Izinkan popup untuk origin aplikasi. |
| "Sesi Google sudah berakhir" | Access token (±1 jam) kedaluwarsa. | Klik **Hubungkan Google Drive** lagi. |
| Restore gagal karena penyimpanan penuh | Kuota LocalStorage habis. | Hapus data lama atau gunakan browser/profil lain. |
| Data tidak terlihat setelah pindah URL | LocalStorage terikat pada origin. | Gunakan URL yang sama, atau pulihkan dari backup Drive. |
| Karakter pada CSV berantakan | File dibuka tanpa dukungan UTF-8. | Buka lewat Excel/Sheets dengan encoding UTF-8 (BOM sudah disertakan). |
| Halaman GitHub Pages kosong | Source Pages belum diarahkan ke `gh-pages`. | Atur branch dan folder di **Settings → Pages**. |

## Privasi & Keamanan

- Tidak ada backend dan tidak ada telemetri; data transaksi tidak dikirim ke server aplikasi.
- Data utama tersimpan di browser pengguna dan hanya dapat diakses pada origin yang sama.
- Backup Drive memakai scope minimal `drive.appdata`, sehingga aplikasi tidak dapat membaca file lain di Drive.
- Token OAuth disimpan di memori dan tidak pernah ditulis ke penyimpanan persisten.
- Backup Google Drive **tidak terenkripsi end-to-end**; keamanannya bergantung pada akun Google pengguna. Untuk data yang sangat sensitif, pertimbangkan enkripsi tambahan atau penyimpanan lokal saja.
- Selalu review perubahan kode dan jangan pernah commit file `.env` atau kredensial OAuth.

---

Dibangun dengan React, Tailwind CSS, Chart.js, dan Motion. Data disimpan lokal di browser dan dapat dicadangkan ke Google Drive pribadi.
