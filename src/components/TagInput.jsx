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
      <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 py-2 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent-strong ring-1 ring-accent/20"
          >
            #{tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              className="cursor-pointer text-accent/60 transition hover:text-accent-strong"
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
          className="min-w-40 flex-1 bg-transparent py-1 text-sm text-ink placeholder:text-muted focus:outline-none"
        />
      </div>

      {filtered.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="cursor-pointer rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs text-muted transition hover:border-accent/50 hover:bg-accent/10 hover:text-accent-strong"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
