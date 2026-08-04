import { useState } from 'react'
import { SearchInput } from './components/SearchInput'
import { SearchResult } from './components/SearchResult'
import { IntentPanel, type Intent } from './components/IntentPanel'
import { RefineInput } from './components/RefineInput'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Venue {
  id: string
  name: string
  type: string
  neighborhood: string
  address: string
  vibes: string[]
  price_level: number
  price_display: string
  good_for: string[]
  description: string
  match_reason: string
}

interface SearchResponse {
  intent: Intent
  venues: Venue[]
  raw_response: string
}

// A single turn in the conversation history sent to the backend.
// The backend needs alternating user/assistant pairs to give Claude
// the prior context it needs for refinement queries.
interface Turn {
  role: 'user' | 'assistant'
  content: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_URL = 'http://localhost:8000'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function App() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [intent, setIntent] = useState<Intent | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  // Conversation history stored in the browser, sent on each refinement.
  // Keeping it client-side keeps the backend stateless — no session storage needed.
  const [history, setHistory] = useState<Turn[]>([])
  // Location persisted across refinements so users don't re-type it.
  const [lastLocation, setLastLocation] = useState<string | null>(null)

  // ---------------------------------------------------------------------------
  // Shared fetch helper — used by both initial search and refinement
  // ---------------------------------------------------------------------------

  async function executeSearch(
    query: string,
    location: string | null,
    priorHistory: Turn[],
  ) {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, location, history: priorHistory }),
      })

      if (!res.ok) {
        const detail = await res.json().catch(() => ({}))
        throw new Error(detail.detail ?? 'Search failed')
      }

      const data: SearchResponse = await res.json()
      setVenues(data.venues ?? [])
      setIntent(data.intent ?? null)

      // Append this exchange to history so the next refinement has context.
      // We store the raw_response string (not the parsed object) because
      // Claude interprets its own prior JSON output more reliably than a
      // restructured version of it.
      setHistory(prev => [
        ...prev,
        { role: 'user',      content: query },
        { role: 'assistant', content: data.raw_response },
      ])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.')
      setVenues([])
      setIntent(null)
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function handleSearch(query: string, location: string | null) {
    setHasSearched(true)
    setLastLocation(location)
    // Clear history — a new top-level search is a clean break from any
    // prior refinement chain. Otherwise Claude would interpret the new
    // query as a refinement of the old one.
    setHistory([])
    executeSearch(query, location, [])
  }

  function handleRefine(refinement: string) {
    // Reuse the location from the top-level search so users don't need
    // to re-type it, and so the catalog filter stays consistent.
    executeSearch(refinement, lastLocation, history)
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center gap-8">

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

        {/* Intent panel appears as soon as we have a parsed intent.
            Cleared to null at the start of each new search so it doesn't
            show stale data between a submit and the response arriving. */}
        <IntentPanel intent={intent} />

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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {venues.map(venue => (
                <SearchResult key={venue.id} venue={venue} />
              ))}
            </div>

            {/* Refinement input is shown only after results arrive —
                there's nothing to refine until the user has seen something. */}
            <div className="w-full border-t border-gray-100 pt-6 flex flex-col items-center gap-3">
              <p className="text-xs text-gray-400">Not quite right?</p>
              <RefineInput onRefine={handleRefine} loading={loading} />
            </div>
          </>
        )}

        {!loading && hasSearched && venues.length === 0 && !error && (
          <p className="text-gray-500 text-sm">No spots found — try a different vibe.</p>
        )}

      </div>
    </div>
  )
}
