import { useState } from 'react'

export interface Intent {
  group_type: string | null
  occasion: string | null
  vibe: string | null
  time_of_day: string | null
  constraints: string[]
}

interface Chip {
  dimension: string
  value: string
}

interface Props {
  intent: Intent | null
  onEdit?: (dimension: string, oldValue: string, newValue: string) => void
  disabled?: boolean
}

// Dimension labels are lowercase and short so they read as secondary
// information — the value is what the user cares about, not the label.
function buildChips(intent: Intent): Chip[] {
  const chips: Chip[] = []
  if (intent.group_type)  chips.push({ dimension: 'group',     value: intent.group_type })
  if (intent.occasion)    chips.push({ dimension: 'occasion',  value: intent.occasion })
  if (intent.vibe)        chips.push({ dimension: 'vibe',      value: intent.vibe })
  if (intent.time_of_day) chips.push({ dimension: 'time',      value: intent.time_of_day })
  for (const c of intent.constraints ?? []) {
    chips.push({ dimension: 'note', value: c })
  }
  return chips
}

export function IntentPanel({ intent, onEdit, disabled }: Props) {
  // Index of the chip currently in edit mode, if any. Only one chip can be
  // edited at a time since an edit immediately fires a refinement request.
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [draft, setDraft] = useState('')

  // Render nothing until a search completes — avoids a flash of empty
  // content between page load and first result set.
  if (!intent) return null

  const chips = buildChips(intent)
  if (chips.length === 0) return null

  function startEditing(chip: Chip, i: number) {
    if (disabled || !onEdit) return
    setEditingIndex(i)
    setDraft(chip.value)
  }

  function commitEdit(chip: Chip) {
    const trimmed = draft.trim()
    setEditingIndex(null)
    if (trimmed && trimmed !== chip.value) {
      onEdit?.(chip.dimension, chip.value, trimmed)
    }
  }

  return (
    <section
      aria-label="How we understood your query"
      className="w-full max-w-2xl flex flex-col gap-2"
    >
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        We understood
      </p>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip, i) =>
          editingIndex === i ? (
            <input
              key={i}
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={() => commitEdit(chip)}
              onKeyDown={e => {
                if (e.key === 'Enter') commitEdit(chip)
                if (e.key === 'Escape') setEditingIndex(null)
              }}
              className="px-3 py-1.5 rounded-full border border-indigo-300 bg-white text-sm text-gray-800 font-medium max-w-[220px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => startEditing(chip, i)}
              disabled={disabled}
              title={onEdit ? `Click to change ${chip.dimension}` : chip.value}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-sm hover:border-indigo-300 hover:bg-indigo-50 disabled:hover:border-gray-200 disabled:hover:bg-white disabled:cursor-default transition-colors"
            >
              <span className="text-xs text-gray-400">{chip.dimension}</span>
              <span className="text-gray-800 font-medium max-w-[180px] truncate">
                {chip.value}
              </span>
            </button>
          ),
        )}
      </div>
    </section>
  )
}
