# Moves — Status

**Last updated:** 2026-09-22
**Current milestone:** M1 — App runs and renders in a browser (in progress)

This is a snapshot, not a log — it reflects what's actually in the working
tree as of the date above, verified by reading the code, not by re-running
`docs/MVP-TASKS.md`'s task list from assumption. Update this file whenever
milestone status changes.

## Confirmed working

- Backend serves `/health` and `/search`; `.env` exists locally with an API
  key set (contents not inspected here).
- Result-level caching for top-level searches (query+location hash) is
  **already implemented** in `main.py` — ahead of `CLAUDE.md`'s "What's Not
  Built Yet" list, which still describes this as unbuilt. `CLAUDE.md` needs
  a pass to catch up with the code.

## Built but uncommitted (in working tree, not yet on `main`)

`git status` shows these files modified since the last commit
(`f9250c8`):

- **`frontend/src/components/IntentPanel.tsx`** — chip-editing is fully
  wired: clicking a chip turns it into an editable input, commits on
  blur/Enter, cancels on Escape.
- **`frontend/src/components/SearchInput.tsx`** — "use my location" is
  fully wired: browser geolocation → reverse-geocode via OSM Nominatim →
  populates the location field, with loading/error states.
- **`frontend/src/App.tsx`** — `handleChipEdit` turns a chip edit into a
  refinement message and calls `handleRefine`; both features are connected
  end-to-end, not standalone components.
- **`backend/main.py`** — cache layer added (see above); still passes raw
  exception text back to the client in both error branches (`detail=str(e)`
  / `detail=f"...{e}"`) — the M2 "generic error messages" task is **not**
  done yet, despite the caching work landing in the same file.
- **`backend/.env.example`** — deleted in the working tree (shows as `D`).
  This is the file `CLAUDE.md`'s "Running Locally" section tells a new
  contributor to `cp` into `.env`. Flagging this — confirm whether the
  deletion was intentional before it's committed, since it'll break that
  onboarding step for anyone else setting up the repo.

**Correction to `docs/MVP-TASKS.md`:** its M1 task "Exercise 'click a chip
to edit' and 'use my location' features, note bugs" assumed these were
unfinished/experimental. They're not — both are fully implemented and
wired end-to-end. The task is really "verify these work as expected,"
not "build or decide whether to cut."

## Known issues (verified by reading the code, not yet fixed)

- **`frontend/index.html`** — malformed script tag,
  `<script type="module"src="src/index.tsx">` (missing space before `src`).
  This is the M1 task-list item; confirmed still present.
- **`backend/venues.py:224-236`** (`filter_catalog`) — silently falls back
  to the *full* catalog when a location has zero matches, so a search for
  e.g. "Brooklyn" returns unrelated Chicago venues with no indication
  they're outside the requested area. M2 fix not yet applied.
- **`backend/requirements.txt`** — dependencies unpinned (`fastapi`,
  `uvicorn[standard]`, `anthropic`, `python-dotenv`, `pydantic` with no
  version constraints). M2 task not yet done.
- **No rate limiting** — no per-IP or other request-rate guard exists in
  `main.py`. M2 task not yet done.
- **No automated tests** — no `pytest` files found in `backend/`. M3 has
  not started.

## Not started

- M3 (test suite), M4 (real deploy), M5 (feedback + tool-use JSON +
  prompt caching on the catalog block — distinct from the result-level
  cache already built).

## Immediate next action

Fix `frontend/index.html`'s malformed script tag (M1's first task, 20–30
min, currently the only concrete blocker to a clean local walkthrough), and
resolve the `backend/.env.example` deletion question, before doing the
manual search/refine walkthroughs — those features are already built and
just need verification, not further work.
