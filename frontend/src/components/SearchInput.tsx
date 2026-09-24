import { useState } from 'react'

interface Props {
  onSearch: (query: string, location: string | null) => void
  loading: boolean
}

export function SearchInput({ onSearch, loading }: Props) {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return
    // Pass null not empty string — backend distinguishes "not provided"
    // from "provided but empty" and the distinction matters for catalog filtering.
    onSearch(trimmedQuery, location.trim() || null)
  }

  // Reverse-geocodes via OSM Nominatim (free, no API key) rather than Google
  // Places — we don't have Places credentials yet. Fine for MVP volume; swap
  // for Places once ingestion moves off the static catalog.
  function handleUseLocation() {
    if (!navigator.geolocation) {
      setLocationError('Location is not supported in this browser.')
      return
    }

    setLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=14`,
          )
          if (!res.ok) throw new Error('Reverse geocoding failed')
          const data = await res.json()
          const addr = data.address ?? {}
          const place =
            addr.neighbourhood || addr.suburb || addr.city_district ||
            addr.city || addr.town || addr.village
          if (!place) throw new Error('No place found')
          setLocation(place)
        } catch {
          setLocationError("Couldn't determine your location. Try typing it instead.")
        } finally {
          setLocating(false)
        }
      },
      () => {
        setLocationError('Location permission denied.')
        setLocating(false)
      },
      { timeout: 8000 },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto flex flex-col gap-3">
      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="chill spot for 4 people on a Friday night, nothing too loud…"
          disabled={loading}
          className="flex-1 px-5 py-4 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-4 rounded-2xl bg-indigo-600 text-white font-semibold text-base shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Finding…' : 'Find'}
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex gap-2">
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="City or neighbourhood (optional)"
            disabled={loading}
            maxLength={100}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleUseLocation}
            disabled={loading || locating}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 shadow-sm hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {locating ? 'Locating…' : 'Use my location'}
          </button>
        </div>
        {locationError && (
          <p className="text-xs text-red-500">{locationError}</p>
        )}
      </div>
    </form>
  )
}
