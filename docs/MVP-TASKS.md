# Moves MVP — Task List

Snapshot handed to an external planning/calendar tool for scheduling. Kept here for reference. Generated 2026-09-22.

## Constraints for scheduling

- Availability: 1–3 hrs/week, in sessions of 20–60 minutes, a few times per week
- Target launch window: Spring 2027 (~late March 2027) — soft target, not a hard deadline
- Total estimated core-path effort: ~14–23 hours (Milestones M1–M4). At the availability above, that's roughly 8–20 calendar weeks, leaving several months of buffer before the spring target.
- Task order matters within a milestone where a dependency is listed. Milestones are ordered (M1 → M2 → M3 → M4 → M5); do not start a later milestone before its dependency milestone is done.
- Every task has a "done-check" — a concrete, observable way to confirm it's actually finished. Don't mark complete without it.

---

## Milestone M1 — App runs and renders in a browser
**Status:** critical path · **Depends on:** nothing · **Total estimate:** 3–5 hrs

| Task | Est. time | Depends on | Done-check |
|---|---|---|---|
| Fix `index.html` malformed script tag | 20–30 min | — | Page loads at localhost:5173 with no browser console errors |
| Manual walkthrough: submit a search query | 45–60 min | previous | On-screen result (intent chips + venue cards) matches expected behavior |
| Manual walkthrough: refine a search | 45–60 min | previous | Refinement updates results and intent chips correctly |
| Exercise "click a chip to edit" and "use my location" features, note bugs | 30–45 min | previous | Written list of bugs found (may be zero) |
| Fix found bugs or cut the feature for now; commit | 30–45 min | previous | `git status` clean; commit message states what shipped vs. cut |
| Spike: deploy current app to Render + Vercel free tiers (throwaway, pre-hardening) | 30–45 min | previous | A live URL exists, even if not yet safe to share publicly |

---

## Milestone M2 — Safe to put a URL in someone's hands
**Status:** critical path · **Depends on:** M1 · **Total estimate:** 4–6 hrs

| Task | Est. time | Depends on | Done-check |
|---|---|---|---|
| Pin backend dependency versions in `requirements.txt` | 20–30 min | — | Fresh `pip install -r requirements.txt` reproduces exact versions |
| Add history validation (role whitelist: user/assistant only; size cap) | 45–60 min | — | Malformed history payload returns HTTP 422 |
| Replace raw exception text in error responses with generic messages + server-side logging | 30–45 min | — | Forced 500 error shows no internal exception string to the client |
| Fix location-filter fallback (currently silently returns full catalog for unmatched cities) + surface a "Chicago only" message in the UI | 45–60 min | — | Querying a non-Chicago city shows a coverage message, not unrelated results |
| Set a hard monthly spend cap in the Anthropic console | 10–15 min | — | Setting visible/confirmed in console |
| Build a simple in-memory per-IP rate limiter | 45–60 min | — | Script sending 25 req/min from one IP gets some 429 responses |
| Manual verification pass (curl tests of the above) | 20–30 min | all above | Each guardrail confirmed with a real request |

---

## Milestone M3 — Test suite
**Status:** critical path · **Depends on:** M2 · **Total estimate:** 3–5 hrs

| Task | Est. time | Depends on | Done-check |
|---|---|---|---|
| pytest: catalog filtering, including the Chicago-only fix | 45–60 min | — | `pytest -q` passes, covers the "Brooklyn returns full catalog" bug class |
| pytest: venue ID validation / dedup logic | 30–45 min | — | Test covers unknown-ID drop and duplicate-ID collapse |
| pytest: request validation edge cases | 30–45 min | — | Test covers oversized query, bad role, oversized history |
| Pair session: mock the Anthropic client for 1–2 deterministic `route_query` tests | 60–90 min | above | Tests run with no API key and no network call, and pass |

---

## Milestone M4 — Deployed for real
**Status:** critical path · **Depends on:** M1, M2 · **Total estimate:** 4–7 hrs

| Task | Est. time | Depends on | Done-check |
|---|---|---|---|
| Deploy backend to Render free tier | 45–60 min | — | Live backend URL responds to `/health` |
| Deploy frontend to Vercel free tier | 30–45 min | — | Live frontend URL renders the search form |
| Wire `VITE_API_URL` and CORS allow-list via environment variables | 30–45 min | above | No hardcoded localhost URLs remain in the deployed build |
| Smoke test against the live URL (real search + refine) | 20–30 min | above | Matches behavior already verified locally |
| Test from an outside network (e.g. phone on cellular) | 15–20 min | above | Full flow works from outside your home network |
| Rehearse one rollback to a previous deploy | 15–20 min | above | Rollback completes successfully once, as a dry run |
| Debug buffer (CORS issues are the classic first-deploy bug) | 60–90 min | — | Reserved time, not a specific task |

---

## Milestone M5 — Learn from real use (stretch — first to cut if time is short)
**Status:** not critical path · **Depends on:** M4 · **Total estimate:** 3–5 hrs

| Task | Est. time | Depends on | Done-check |
|---|---|---|---|
| Build `POST /feedback` (thumbs up/down) + JSONL logging | 45–60 min | — | Feedback file has entries after real use |
| Swap regex-based JSON extraction for Claude tool-use with a strict schema | 60–90 min | — | No more markdown-fence/parse-failure edge cases |
| Add prompt caching on the catalog block | 30–45 min | — | Cached-read cost visible in Anthropic usage dashboard |

---

## Cut list (in priority order, if hours run out)

1. M5 — thumbs up/down feedback logging
2. M2 — rate limiting (the Anthropic spend cap is the real backstop; this is a courtesy layer)
3. Catalog expansion beyond the current 15 Chicago venues (not scoped as a task above — deliberately deferred)
4. M1 — chip-editing / "use my location" features (leave uncommitted, revisit later)

**Never cut:** the `index.html` fix, the history-validation guardrails, and the Chicago-only honesty message — these are what separate "broken" from "safe to share."

---

## Weekly review template (for tracking actual vs. planned)

```
## Week of <date>
Planned: ...
Done: ...
Hours spent vs. estimated: ...
Scope or date adjustment: ...
```

---

## Note on source of truth

This file is a snapshot generated for an external scheduling tool. Once implementation starts, `docs/ROADMAP.md` and `docs/STATUS.md` become the authoritative, continuously-updated tracking docs — if this file and those disagree later, the repo docs win. This file won't be kept in sync automatically.
