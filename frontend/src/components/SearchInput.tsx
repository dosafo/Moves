import { useState } from 'react'

interface Props {
  onSearch: (query: string, location: string | null) => void
  loading: boolean
}

export function SearchInput({ onSearch, loading }: Props) {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return
    // Pass null not empty string — backend distinguishes "not provided"
    // from "provided but empty" and the distinction matters for catalog filtering.
    onSearch(trimmedQuery, location.trim() || null)
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

      <input
        type="text"
        value={location}
        onChange={e => setLocation(e.target.value)}
        placeholder="City or neighbourhood (optional)"
        disabled={loading}
        maxLength={100}
        className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent disabled:opacity-50"
      />
    </form>
  )
}
