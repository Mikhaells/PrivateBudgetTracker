import { useEffect, useRef, useState } from 'react'

export default function ExportDropdown({ onExportCsv, onExportPdf, disabled }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-navy-900/20 backdrop-blur transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
        Export
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3 transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : undefined }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200">
          <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Export data terfilter
          </p>
          <button
            type="button"
            onClick={() => {
              onExportCsv()
              setOpen(false)
            }}
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-100 text-emerald-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3M9 13l-4-4h8" />
              </svg>
            </span>
            <span>
              <span className="block font-semibold">CSV</span>
              <span className="block text-xs text-slate-400">Buka di Excel / Sheets</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              onExportPdf()
              setOpen(false)
            }}
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-rose-100 text-rose-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10m-9-4h8a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3z" />
              </svg>
            </span>
            <span>
              <span className="block font-semibold">PDF</span>
              <span className="block text-xs text-slate-400">Laporan + ringkasan</span>
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
