import { useState } from 'react'

interface Props {
  onRefine: (query: string) => void
  loading: boolean
}

// Separate component rather than reusing SearchInput because the UX contract
// is different: this field is secondary (smaller, different placeholder, no
// location row), and its submit label conveys continuation not initiation.
export function RefineInput({ onRefine, loading }: Props) {
  const [value, setValue] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed) {
      onRefine(trimmed)
      setValue('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Narrow it down… (e.g. "make it quieter" or "closer to downtown")"
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="px-5 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '…' : 'Refine'}
        </button>
      </div>
    </form>
  )
}
