import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

function formatDriveTime(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString('id-ID')
}

export default function ExportDropdown({ onExportCsv, onExportPdf, disabled, drive }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const run = (fn) => {
    if (typeof fn !== 'function') return
    fn()
    setOpen(false)
  }

  const driveLabel = () => {
    if (!drive?.configured) return { text: 'Google Drive (belum disiapkan)', disabled: true }
    if (drive.busy && drive.status !== 'needs-choice') return { text: 'Memproses...', disabled: true }
    if (drive.status === 'needs-choice') return { text: 'Perbedaan file di Drive', disabled: false, accent: true }
    if (drive.status === 'connected') return { text: 'Google Drive: Terhubung', disabled: false }
    if (drive.status === 'connecting') return { text: 'Menghubungkan...', disabled: true }
    if (drive.status === 'reconnecting') return { text: 'Menyambung ulang...', disabled: true }
    if (drive.status === 'error') return { text: 'Google Drive: Coba ulang', disabled: false }
    return { text: 'Hubungkan Google Drive', disabled: false }
  }

  const driveAction = () => {
    if (!drive?.configured || drive.busy) return
    if (drive.status === 'needs-choice') return
    if (drive.status === 'connected') {
      drive.syncNow?.()
      setOpen(false)
      return
    }
    drive.connect?.()
    setOpen(false)
  }

  const dLabel = driveLabel()
  const lastSync = formatDriveTime(drive?.lastSync)
  const remoteTime = formatDriveTime(drive?.remote?.modifiedTime)

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Export & backup Google Drive"
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-primary bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-black/10 transition hover:bg-primary-strong"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
        Export / Backup
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3 transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : undefined }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, rotateX: -35, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, rotateX: -20, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            style={{ transformPerspective: 600, transformOrigin: 'top center' }}
            className="absolute right-0 z-20 mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl bg-surface shadow-xl shadow-black/15 ring-1 ring-line"
          >
            <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-muted">
              Export data terfilter
            </p>
            {[
              {
                key: 'csv',
                onClick: () => run(onExportCsv),
                iconCls: 'bg-income/10 text-income',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3M9 13l-4-4h8" />
                  </svg>
                ),
                title: 'CSV',
                sub: 'Buka di Excel / Sheets',
              },
              {
                key: 'pdf',
                onClick: () => run(onExportPdf),
                iconCls: 'bg-expense/10 text-expense',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10m-9-4h8a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3z" />
                  </svg>
                ),
                title: 'PDF',
                sub: 'Laporan + ringkasan',
              },
            ].map((item, i) => (
              <motion.button
                key={item.key}
                type="button"
                onClick={item.onClick}
                disabled={disabled}
                initial={{ opacity: 0, y: -8, rotateX: -25 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.04 + i * 0.06, type: 'spring', stiffness: 280, damping: 22 }}
                style={{ transformPerspective: 500 }}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-ink/80 transition hover:bg-cream/60 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className={`grid h-8 w-8 place-items-center rounded-lg ${item.iconCls}`}>{item.icon}</span>
                <span>
                  <span className="block font-semibold">{item.title}</span>
                  <span className="block text-xs text-muted">{item.sub}</span>
                </span>
              </motion.button>
            ))}

            <div className="mt-1 border-t border-line/70">
              <p className="px-4 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                Google Drive (appDataFolder)
              </p>
              <button
                type="button"
                onClick={driveAction}
                disabled={dLabel.disabled}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
                  dLabel.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-cream/60'
                } ${dLabel.accent ? 'text-accent-strong' : 'text-ink/80'}`}
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-surface-2 text-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 18a4 4 0 0 1 .88-7.903A5 5 0 1 1 15.9 6L16 6a5 5 0 0 1 1 9.9M9 15l3-3m0 0 3 3m-3-3v12" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 font-semibold">
                    {dLabel.text}
                    {drive?.status === 'connected' && (
                      <span className="h-1.5 w-1.5 rounded-full bg-income" aria-hidden="true" />
                    )}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {!drive?.configured
                      ? 'Tambahkan VITE_GOOGLE_CLIENT_ID'
                      : drive.status === 'connected'
                        ? `Terakhir sync: ${lastSync || '-'}`
                        : drive.status === 'needs-choice'
                          ? `Ada file di Drive: ${remoteTime || 'waktu tidak diketahui'}`
                          : 'File disimpan tersembunyi di Drive'}
                  </span>
                </span>
              </button>

              {drive?.status === 'needs-choice' && (
                <div className="px-4 pb-2.5">
                  <p className="mb-2 rounded-lg bg-accent/10 px-2.5 py-2 text-[11px] leading-relaxed text-accent-strong">
                    Backup di Drive <strong>tidak akan ditimpa</strong> sampai kamu memilih salah satu.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        drive.keepLocal?.()
                        setOpen(false)
                      }}
                      disabled={drive.busy}
                      className="flex-1 cursor-pointer rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-ink transition hover:bg-cream disabled:opacity-50"
                    >
                      Simpan versi ini
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        drive.restoreFromRemote?.()
                        setOpen(false)
                      }}
                      disabled={drive.busy}
                      className="flex-1 cursor-pointer rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-strong disabled:opacity-50"
                    >
                      Pulihkan dari Drive
                    </button>
                  </div>
                </div>
              )}

              {drive?.status === 'connected' && (
                <div className="px-4 pb-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      drive.disconnect?.()
                      setOpen(false)
                    }}
                    disabled={drive.busy}
                    className="w-full cursor-pointer text-left text-xs text-muted transition hover:text-ink disabled:opacity-50"
                  >
                    Putuskan koneksi Google Drive
                  </button>
                </div>
              )}

              {!drive?.configured && (
                <div className="mx-3 mb-2.5 rounded-lg bg-surface-2 p-2.5 text-[11px] leading-relaxed text-muted">
                  <p className="font-semibold text-ink">Cara mengaktifkan:</p>
                  <ol className="mt-1 list-decimal space-y-0.5 pl-4">
                    <li>Buat OAuth Client ID (Web) di Google Cloud Console.</li>
                    <li>
                      Tambahkan origin <code className="text-ink">http://localhost:5173</code> dan{' '}
                      <code className="text-ink">https://mikhaells.github.io</code>.
                    </li>
                    <li>
                      Isi <code className="text-ink">VITE_GOOGLE_CLIENT_ID</code> di <code className="text-ink">.env</code>,
                      lalu build ulang.
                    </li>
                  </ol>
                  <p className="mt-1">Panduan lengkap ada di README.</p>
                </div>
              )}

              {drive?.error && <p className="px-4 pb-2.5 text-xs text-expense">{drive.error}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
