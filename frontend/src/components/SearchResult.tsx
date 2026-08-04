import type { Venue } from '../App'

interface Props {
  venue: Venue
}

export function SearchResult({ venue }: Props) {
  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3 hover:shadow-md transition-shadow">

      {/* Header row: name + venue type badge */}
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900 leading-snug">{venue.name}</h3>
        <span className="shrink-0 text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full capitalize">
          {venue.type}
        </span>
      </div>

      {/* Location + price */}
      <p className="text-xs text-gray-400">
        {venue.neighborhood} · {venue.price_display}
      </p>

      {/* Why this venue was chosen — the match_reason from Claude */}
      {venue.match_reason && (
        <p className="text-sm italic text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg leading-relaxed">
          {venue.match_reason}
        </p>
      )}

      {/* Venue description from the catalog */}
      <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{venue.description}</p>

      {/* Vibe tags */}
      <div className="flex flex-wrap gap-2 pt-1">
        {venue.vibes.map(vibe => (
          <span
            key={vibe}
            className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full"
          >
            {vibe}
          </span>
        ))}
      </div>

    </article>
  )
}
