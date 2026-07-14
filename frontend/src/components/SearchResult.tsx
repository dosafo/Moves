interface Venue {
  id: string
  name: string
  type: string
  vibe: string
  description: string
  tags: string[]
}

interface Props {
  venue: Venue
}

export function SearchResult({ venue }: Props) {
  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900 leading-snug">{venue.name}</h3>
        <span className="shrink-0 text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full capitalize">
          {venue.type}
        </span>
      </div>
      <p className="text-sm italic text-gray-500">{venue.vibe}</p>
      <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{venue.description}</p>
      <div className="flex flex-wrap gap-2 pt-1">
        {venue.tags.map(tag => (
          <span
            key={tag}
            className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  )
}
