# Budget Tracker — Dashboard Keuangan Pribadi

Aplikasi **budget tracker** untuk mencatat pemasukan & pengeluaran, menganalisis arus uang dengan grafik, dan mengekspor laporan. Data utama disimpan di **LocalStorage** browser; tersedia **backup/restore JSON** dan **backup otomatis ke Google Drive** (opsional).

## Fitur

- Pencatatan **pemasukan & pengeluaran** (dengan kategori ikonik: Makanan, Transportasi, Tagihan, dll.)
- **Filter** berdasarkan tipe, kategori, rentang tanggal (preset 7/30 hari, bulan ini), dan pencarian catatan/tag
- Visualisasi **Chart.js**: doughnut (pengeluaran per kategori), bar distribusi, dan bar pemasukan vs pengeluaran per bulan
- Sistem **tag** (input bebas + saran tag otomatis) untuk kategorisasi lintas-baris
- **Export ke CSV** (Excel/Sheets friendly, UTF-8 BOM) dan **PDF** (laporan + ringkasan saldo)
- **Backup & Restore JSON** — unduh seluruh data (transaksi, kategori, tag) jadi satu file, lalu pulihkan dengan mode *ganti semua* atau *gabungkan*
- **Google Drive (opsional)** — backup otomatis ke folder tersembunyi `appDataFolder`; tidak perlu memilih file atau membuat file manual
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

## Backup & Restore JSON

Menu **Export / Backup** di header punya tiga bagian: export terfilter (CSV/PDF), backup/restore semua data, dan Google Drive.

- **Backup (.json)** mengunduh `budget-tracker-backup-YYYY-MM-DD.json` berisi **seluruh** transaksi, kategori (termasuk anggaran), dan tag — bukan hanya hasil filter.
- **Restore (.json)** membaca file, memvalidasi isinya, lalu menampilkan ringkasan sebelum menulis apa pun.
  - **Ganti semua** — data browser diganti isi file.
  - **Gabungkan** — hanya transaksi/kategori dengan ID baru yang ditambahkan.
- File lama tetap aman jika validasi gagal. Setelah restore, tersedia tombol **Urungkan** selama beberapa detik.

Format file:

```json
{
  "app": "private-budget-tracker",
  "version": 1,
  "exportedAt": "2026-11-02T03:41:12.000Z",
  "counts": { "transactions": 128, "categories": 12, "tags": 34 },
  "data": {
    "transactions": [],
    "categories": { "expense": [], "income": [] },
    "tags": []
  }
}
```

> File backup berisi data keuangan **plaintext**. Simpan di tempat yang aman dan jangan bagikan link-nya.

## Google Drive (opsional)

Backup otomatis ke Google Drive memakai scope `drive.appdata` dan menyimpan **satu file** di folder tersembunyi `appDataFolder`:

- Scope `drive.appdata` hanya memberi akses ke folder data aplikasi ini — aplikasi tidak bisa membaca file lain di Drive pengguna.
- File tidak muncul di tampilan Drive biasa dan tidak mengotori folder pengguna.
- User tidak perlu memilih file atau membuat file baru: aplikasi membuatnya sekali, lalu menimpanya setiap ada perubahan (debounce ±4 detik).

### Setup

1. Buka [Google Cloud Console](https://console.cloud.google.com/) → buat project baru.
2. **APIs & Services → Library** → aktifkan **Google Drive API**.
3. **OAuth consent screen** → pilih **External** → isi nama aplikasi & email.
   - Saat masih **Testing**, tambahkan email Google kamu sebagai **Test user**.
   - Refresh token di mode Testing bisa kedaluwarsa; untuk pemakaian jangka panjang, publish aplikasinya.
4. **Credentials → Create credentials → OAuth client ID** → tipe **Web application**.
   - **Authorized JavaScript origins**:
     - `http://localhost:5173`
     - `https://mikhaells.github.io`
5. Salin **Client ID** ke `.env`:

   ```bash
   # .env (jangan di-commit)
   VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
   ```

   Contoh tersedia di `.env.example`.
6. Jalankan ulang `npm run dev`, atau `npm run build` + `npm run deploy` untuk produksi.

### Cara kerja & batasan

- Klik **Hubungkan Google Drive** → pilih akun → izinkan. Aplikasi mencari file backup; jika belum ada, file dibuat otomatis.
- Jika Drive sudah punya backup, aplikasi menawarkan **Pulihkan dari Drive** atau **Simpan versi ini** (timpa Drive dengan data lokal). Ini mencegah data lokal menimpa backup secara tidak sengaja.
- Access token Google berlaku ±1 jam dan hanya disimpan di memori (tidak di LocalStorage). Saat halaman dibuka, aplikasi mencoba menyambung ulang secara senyap; jika gagal, user perlu klik **Hubungkan** lagi.
- Karena aplikasi ini murni frontend (tanpa server), tidak ada refresh token permanen. Untuk sync yang benar-benar "connect sekali selamanya", diperlukan backend (mis. Supabase) — backup JSON dan Drive tetap berguna sebagai jaring pengaman.

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

> Variabel `VITE_GOOGLE_CLIENT_ID` dibaca saat build. Set di `.env` **sebelum** `npm run build`/`npm run deploy`, dan pastikan origin GitHub Pages sudah terdaftar di Google Cloud Console.

## Struktur

```
src/
├── lib/
│   ├── constants.js     # kategori, warna, ikon, preset
│   ├── store.js         # LocalStorage CRUD + seed data
│   ├── backup.js        # build/parse/validasi/apply backup JSON
│   ├── drive.js         # Google Drive API (appDataFolder, drive.file)
│   ├── useDriveBackup.js# hook: connect, auto-sync, restore
│   ├── format.js        # format mata uang/tanggal (id-ID, IDR)
│   ├── analytics.js     # agregasi untuk grafik
│   ├── chartSetup.js    # registrasi Chart.js
│   └── export.js        # export CSV & PDF (jsPDF)
├── components/          # UI: form, filter, tabel, grafik, tag, export
└── App.jsx
```
