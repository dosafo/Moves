# Moves — Roadmap

Living document. Updated when a milestone closes or scope changes — unlike
`docs/MVP-TASKS.md`, which is a dated snapshot handed to an external
scheduling tool and not kept in sync automatically.

**Target launch window:** Spring 2027 (~late March), soft target.

## Where this is headed

Moves is a search-first discovery app: natural language query in, 2–4
curated venues out, backed by a hand-curated Chicago catalog and Claude for
intent parsing + selection (see root `CLAUDE.md` for the architecture and
design decisions). The roadmap below is the path from "runs on one laptop"
to "safe to hand someone a URL."

## Milestones

### M1 — App runs and renders in a browser
**Depends on:** nothing
Get the app into a state where a person can load it, search, and refine
without hitting a broken build or an obvious defect. Includes an initial
throwaway deploy spike (Render + Vercel free tiers) to flush out
deploy-time surprises early, before hardening work in M2 makes iteration
slower.
**Exit criteria:** Search and refine both work end-to-end locally with no
console errors; known UI features are either verified working or explicitly
cut; a live (not-yet-hardened) URL exists.

### M2 — Safe to put a URL in someone's hands
**Depends on:** M1
Close the gaps between "works for me" and "won't leak internals, run up an
API bill, or silently mislead a user outside Chicago" if a stranger uses it.
Dependency pinning, input validation, generic error responses, the
location-fallback honesty fix, a spend cap, and basic rate limiting.
**Exit criteria:** Every guardrail below is verified against a real
request, not just read in the source.

### M3 — Test suite
**Depends on:** M2
Lock in the M1/M2 fixes with automated coverage so they can't silently
regress — catalog filtering (incl. the Chicago-only fix), ID
validation/dedup, request validation edge cases, and a mocked-Claude test
for `route_query` that runs with no API key and no network call.
**Exit criteria:** `pytest -q` passes and covers the bug classes above.

### M4 — Deployed for real
**Depends on:** M1, M2
Turn the M1 throwaway deploy into the real one: environment-driven config
(no hardcoded localhost), a verified outside-network smoke test, and one
rehearsed rollback so a bad deploy isn't a first-time-under-pressure event.
**Exit criteria:** Full search+refine flow works from a phone on cellular
data, against the live URLs.

### M5 — Learn from real use (stretch)
**Depends on:** M4
Not critical path — first to cut if time runs short. Lightweight feedback
capture (`POST /feedback`, thumbs up/down + JSONL), swapping regex-based
JSON extraction for Claude tool-use with a strict schema, and prompt
caching on the catalog block.

## After MVP (not scheduled yet)

From `CLAUDE.md`'s "What's Not Built Yet," still open once M1–M5 close:
- Real venue database (Postgres + Prisma, or Google Places ingestion) —
  replaces the static `venues.py` catalog
- Auth layer
- Dark mode
- Catalog expansion beyond the current 15 Chicago venues

## Relationship to the other docs

- **`docs/MVP-TASKS.md`** — the task-level breakdown (estimates,
  dependencies, done-checks) that this roadmap's milestones summarize. Task
  order and time estimates live there, not here.
- **`docs/STATUS.md`** — the current-state snapshot: what's built, what's
  in progress, what's broken, as of the last update. Check status before
  trusting this roadmap's milestone boundaries against the real repo state.
- **`CLAUDE.md`** — architecture and conventions; doesn't change per
  milestone.
