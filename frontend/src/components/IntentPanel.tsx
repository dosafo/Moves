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

export function IntentPanel({ intent }: Props) {
  // Render nothing until a search completes — avoids a flash of empty
  // content between page load and first result set.
  if (!intent) return null

  const chips = buildChips(intent)
  if (chips.length === 0) return null

  return (
    <section
      aria-label="How we understood your query"
      className="w-full max-w-2xl flex flex-col gap-2"
    >
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        We understood
      </p>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-sm"
            title={chip.value}
          >
            <span className="text-xs text-gray-400">{chip.dimension}</span>
            <span className="text-gray-800 font-medium max-w-[180px] truncate">
              {chip.value}
            </span>
          </span>
        ))}
      </div>
    </section>
  )
}
