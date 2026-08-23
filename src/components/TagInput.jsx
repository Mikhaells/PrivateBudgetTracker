import { useMemo, useState } from 'react'

const normalize = (s) => s.trim().toLowerCase()

export default function TagInput({ value, onChange, suggestions, id }) {
  const [draft, setDraft] = useState('')

  const filtered = useMemo(() => {
    const q = normalize(draft)
    if (!q) return suggestions.slice(0, 6)
    return suggestions.filter((s) => normalize(s).includes(q)).slice(0, 6)
  }, [draft, suggestions])

  const add = (raw) => {
    const tag = raw.trim().replace(/^#/, '')
    if (!tag) return
    if (!value.includes(tag)) onChange([...value, tag])
    setDraft('')
  }

  const remove = (tag) => onChange(value.filter((t) => t !== tag))

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(draft)
    } else if (e.key === 'Backspace' && !draft && value.length) {
      remove(value[value.length - 1])
    }
  }

  return (
    <div>
      <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700"
          >
            #{tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              className="cursor-pointer text-indigo-400 transition hover:text-indigo-700"
              aria-label={`Hapus tag ${tag}`}
            >
              &times;
            </button>
          </span>
        ))}
        <input
          id={id}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => {
            if (draft.trim()) add(draft)
          }}
          placeholder={value.length ? '' : 'Ketik tag lalu Enter, contoh: kebutuhan'}
          className="min-w-40 flex-1 bg-transparent py-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {filtered.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="cursor-pointer rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
