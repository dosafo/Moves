import { useState } from 'react'
import { SearchInput } from './components/SearchInput'
import { SearchResult } from './components/SearchResult'

interface Venue {
  id: string
  name: string
  type: string
  vibe: string
  description: string
  tags: string[]
}

interface SearchResponse {
  intent: {
    group_type: string
    occasion: string
    vibe: string
    time_of_day: string | null
    constraints: string[]
  }
  venues: Venue[]
}

const API_URL = 'http://localhost:8000'

export default function App() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  async function handleSearch(query: string) {
    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const res = await fetch(`${API_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      if (!res.ok) {
        const detail = await res.json().catch(() => ({}))
        throw new Error(detail.detail ?? 'Search failed')
      }

      const data: SearchResponse = await res.json()
      setVenues(data.venues ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.')
      setVenues([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center gap-10">
        <header className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 tracking-tight">Moves</h1>
          <p className="mt-3 text-lg text-gray-500">Find your next third space.</p>
        </header>

        <SearchInput onSearch={handleSearch} loading={loading} />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl w-full max-w-2xl text-center">
            {error}
          </p>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-48 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-5/6" />
              </div>
            ))}
          </div>
        )}

        {!loading && venues.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {venues.map(venue => (
              <SearchResult key={venue.id} venue={venue} />
            ))}
          </div>
        )}

        {!loading && hasSearched && venues.length === 0 && !error && (
          <p className="text-gray-500 text-sm">No spots found — try a different vibe.</p>
        )}
      </div>
    </div>
  )
}
