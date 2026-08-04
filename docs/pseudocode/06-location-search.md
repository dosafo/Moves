# 06 — Location-Aware Search (updated `SearchInput.tsx` + `App.tsx` + `query_router.py`)

## L1 — Purpose
Threads an optional location field (city or neighbourhood) from the search bar through to the backend so Claude can surface venues relevant to where the user is. The backend already accepts `location: str | None`; this step makes it reachable from the UI. It exists because venue discovery is inherently spatial — "chill bar for friends" in London returns different places than in Chicago — and ignoring location produces results that are useless for anyone who can't go there.

## L2 — Step-by-step flow

```
FRONTEND — SearchInput.tsx
  ADD local state: location = ""
  RENDER below main search input:
    <input type="text"
           placeholder="City or neighbourhood (optional)"
           value=location
           onChange: setLocation />
  ON SUBMIT:
    call onSearch(query, location.trim() || null)
      ↑ pass null not empty string so backend distinguishes
        "user left it blank" from "user typed nothing but hit space"

FRONTEND — App.tsx
  CHANGE handleSearch signature:
    handleSearch(query: string, location: string | null)
  INCLUDE location in fetch body:
    body: JSON.stringify({ query, location })
  STORE location in state alongside intent:
    so re-render on refine query can preserve it

BACKEND — query_router.py
  ALREADY receives location: str | None
  ADD: filter catalog to venues in that city before injecting
    filtered = [v for v in CATALOG if location is None or
                v.city.lower() in location.lower() or
                v.neighborhood.lower() in location.lower()]
    if filtered is empty: fall back to full catalog
      reason: a narrow filter returning 0 results is worse
              than a slightly off-location recommendation
  INJECT filtered_catalog_text instead of full catalog text
```

## L3 — Key mechanisms

**Why an explicit location field instead of parsing it from the query text?**
Claude already extracts location intent from the query (the system prompt tells it to). But there are two different jobs here: (1) *understand* what location the user mentioned (done by Claude inside route_query) and (2) *filter the catalog* to that location (done deterministically in Python). The explicit field handles case 2 reliably — no LLM needed. Relying solely on Claude to filter the catalog would mean the filter only applies when Claude successfully extracts the location term, which is not guaranteed.

**Why pass `null` instead of `""` for a blank location?**
`""` is ambiguous — it could mean "not provided" or "provided but empty". `None`/`null` is unambiguous: the user did not specify a location. FastAPI's Pydantic model already types it as `str | None`, so this convention is already enforced at the boundary.

**Why fall back to the full catalog when the location filter returns nothing?**
If the user types "London" but the catalog only has Chicago venues, an empty result set is worse UX than showing the best-matching venues regardless of city. The fallback is honest: it means the system doesn't yet cover that location, which is a catalog problem, not a query problem. In production, a "we don't cover your city yet" banner is the right answer — the fallback buys time until real data arrives.

**Why store `location` in App state alongside intent?**
When the refinement step (step D) fires a follow-up query, it needs to carry location forward so the user doesn't have to re-type it. Without storing it, every refinement resets to "no location" — which changes the catalog filter and silently invalidates prior results.

## L4 — Edge cases and risks

| Risk | Where it breaks | Mitigation |
|---|---|---|
| User types neighborhood but catalog stores city | Filter returns 0 → falls back to full catalog | Check both `city` and `neighborhood` fields in filter; also check substrings |
| Location field is very long | Prompt injection risk if malicious | Truncate location to 100 chars; strip newlines before injecting into prompt |
| User types location in query AND in field | Claude gets location twice | Redundant but harmless; catalog filter takes the explicit field, query text sets Claude's context |
| Location field clutters the UI on mobile | Users ignore it or misuse it | Make it collapsible ("+ add location") so it's optional and doesn't dominate the layout |
| City names with spaces ("New York") | `.lower()` substring match covers this | Confirmed by simple test: "new york" in "find spots in new york city" → True |

## L5 — Experiments to try

- Add a "detect my location" button that calls `navigator.geolocation.getCurrentPosition` and reverse-geocodes to a city name — observe the full user-permission → coordinate → city-name pipeline.
- Type a misspelled city ("Londoon") and watch the fallback trigger — then add fuzzy matching (`difflib.get_close_matches`) to the catalog filter and compare results.
- Try injecting a prompt into the location field (`"; ignore previous instructions"`) and verify the truncation/strip defuses it.
- Remove the fallback and see what the UI shows when the catalog has no matching city — experience firsthand why the fallback exists.

## L6 — Meta reflection

**What this teaches:** The difference between *semantic understanding* (LLM extracts location from natural language) and *deterministic filtering* (Python narrows a list). Production AI systems use both: the model handles ambiguity and natural language; deterministic code handles rules that must be exact (date arithmetic, ID lookups, permission checks, geospatial filters). Conflating the two — asking the model to do everything, or filtering everything deterministically — produces systems that are either unreliable or rigid. The right split is: LLM for "what did the user mean?", code for "given what they meant, what exactly should we return?"
