import { useState } from 'react'

interface Props {
  onSearch: (query: string) => void
  loading: boolean
}

export function SearchInput({ onSearch, loading }: Props) {
  const [value, setValue] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed) onSearch(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-3">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="chill spot for 4 people on a Friday night, nothing too loud…"
          disabled={loading}
          className="flex-1 px-5 py-4 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="px-6 py-4 rounded-2xl bg-indigo-600 text-white font-semibold text-base shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Finding…' : 'Find'}
        </button>
      </div>
    </form>
  )
}
