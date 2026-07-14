# 03 — Frontend Search (`App.tsx` + `SearchInput.tsx` + `SearchResult.tsx`)

## L1 — Purpose
The search UI is a three-component system: `App` owns state and the API call, `SearchInput` captures the query, and `SearchResult` renders one venue card. It exists to give users a fast, minimal interface to type intent and see curated results — no category browsing, no filters, just a search box and cards.

## L2 — Step-by-step flow

```
App RENDERS
  state: venues = []         ← Venue[]
  state: loading = false     ← bool, disables input during fetch
  state: error = null        ← string | null, shown below input

  render:
    <header>  "Moves" wordmark + tagline
    <SearchInput onSearch=handleSearch loading=loading />
    if error:  <error message>
    if loading: <skeleton / spinner>
    <grid of <SearchResult venue=v /> for each v in venues>

handleSearch(query: string) — async
  set loading = true
  set error = null
  try:
    POST http://localhost:8000/search
      body: { query }
      headers: { Content-Type: application/json }
    await response
    if !res.ok: throw Error("Search failed")
    data = await res.json()
    set venues = data.venues
  catch e:
    set error = "Something went wrong. Try again."
  finally:
    set loading = false

SearchInput RENDERS (controlled input)
  local state: value = ""
  on change: setValue(e.target.value)
  on submit (form):
    preventDefault
    if value.trim() is non-empty: call onSearch(value.trim())
  disabled when loading=true
  button disabled when loading or value is empty

SearchResult RENDERS (pure, no state)
  receive: venue { id, name, type, vibe, description, tags[] }
  render card:
    venue.name       ← bold heading
    venue.type       ← pill / badge
    venue.vibe       ← italic subheading
    venue.description ← body text
    venue.tags[]     ← row of tag chips
```

## L3 — Key mechanisms

**Lifting state to App** — `SearchInput` does not call the API or hold venue data. It accepts `onSearch` as a prop and calls it with the raw string. This keeps the component dumb and reusable — the same input could be reused in a modal or a different page without bringing its own network logic.

**Controlled input** — `value` is React state, and `onChange` updates it on every keystroke. The input never manages its own value in the DOM. This makes it trivial to clear the field programmatically (e.g. after submit) or pre-fill it from URL params.

**Loading state as a single boolean** — one `loading` flag drives both the input's disabled state and the spinner. Keeping it in `App` (not in `SearchInput`) means the whole page knows when a fetch is in flight, making it easy to add a global progress bar later.

**Optimistic nothing** — results are only replaced when a new fetch resolves. Stale results stay visible while the next query loads, giving the user something to look at rather than a blank screen.

**`SearchResult` as a pure component** — it receives a `Venue` prop and renders it. No hooks, no side effects. This makes it trivially testable and replaceable — swap the card layout without touching App or SearchInput.

## L4 — Edge cases and risks

| Risk | Where it breaks | Mitigation |
|---|---|---|
| User submits while previous fetch is in flight | Two fetches race; last to resolve wins | Track an AbortController and cancel the previous fetch on new submit |
| Backend returns `venues: []` (no matches) | Blank results area with no feedback | Show "No spots found — try a different vibe" empty state |
| Network offline | `fetch` throws TypeError | Caught by the catch block; sets error string |
| Very long venue description | Card overflows its grid cell | Add `line-clamp-3` in Tailwind to cap description height |
| `data.venues` is undefined | Crashes on `.map` | Default to `data.venues ?? []` when setting state |
| CORS failure during fetch | `fetch` throws with opaque network error | Handled by catch, but error message is generic — log to console in dev |
| No ANTHROPIC_API_KEY on backend | Backend returns 500 | Frontend shows generic error; backend should return a clear 503 |

## L5 — Experiments to try

- Add a `useRef<AbortController>` and cancel in-flight fetches when a new query is submitted — observe that fast typing no longer causes stale results to flash.
- Remove `finally { setLoading(false) }` and see what happens when the fetch errors — the input stays disabled forever.
- Change `SearchResult` to accept a `rank: number` prop and show it as a badge — observe how a pure component change stays isolated.
- Wrap `handleSearch` in `useCallback` and add it to the dependency array of a `useEffect` — notice how it changes when `loading` changes unless `loading` is excluded or the dependency is stabilised.
- Add `localStorage.setItem('lastQuery', query)` before the fetch, then read it in a `useEffect` on mount to pre-fill the input on page reload.

## L6 — Meta reflection

**What this teaches:** The container/presentational split and unidirectional data flow. Data flows down as props (`onSearch`, `loading`, `venue`), events flow up as callbacks (`onSearch(query)`). The UI is a pure function of state: given the same `venues`, `loading`, and `error`, it always renders identically.

**Where else this appears:** This is the React mental model at its core — also seen in Elm, Svelte stores, and Vue's options API `emit` pattern. At a larger scale it maps to the Redux pattern (one store owns state, components dispatch actions and select data). Understanding this split is the foundation for moving to any state management library without confusion.
