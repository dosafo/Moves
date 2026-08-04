# Moves — CLAUDE.md

## Project Overview

**Moves** is a discovery platform that helps people find third spaces — venues like coffee shops, parks, bars, restaurants, and event spaces — tailored to their vibe, group, and occasion. The goal is to surface places that are fun, fitting, and social: whether hanging with friends, spending time with family, or meeting new people.

## Architecture

```
Moves/
├── backend/                      # Python — FastAPI
│   ├── main.py                   # API entrypoint: /health, /search
│   ├── query_router.py           # Claude API integration + multi-turn history
│   ├── venues.py                 # In-memory venue catalog + filtering utilities
│   ├── requirements.txt
│   └── .env.example              # Copy to .env and add ANTHROPIC_API_KEY
└── frontend/                     # React + TypeScript (Vite + Tailwind)
    └── src/
        ├── App.tsx               # Root: state, search/refine handlers, layout
        ├── components/
        │   ├── SearchInput.tsx   # Query + optional location inputs
        │   ├── SearchResult.tsx  # Venue card (enriched: vibes, price, match reason)
        │   ├── IntentPanel.tsx   # Parsed-intent badge row ("We understood…")
        │   └── RefineInput.tsx   # Follow-up refinement field (shown after results)
        └── index.tsx             # ReactDOM entry point
```

## Stack

- **Backend**: Python 3.12, FastAPI, Pydantic, Uvicorn, Anthropic SDK
- **Frontend**: React 18, TypeScript (strict), Vite, Tailwind CSS
- **AI**: Claude (claude-sonnet-4-6) via Anthropic async client

## Core User Flow

1. User types a natural language query ("chill spot for a date, not too loud") and optionally a city/neighbourhood
2. `SearchInput` submits to `POST /search` in `main.py`
3. `query_router.py` filters the venue catalog by location, injects it into the Claude system prompt, and sends the query (plus any prior conversation history for refinements)
4. Claude selects 2–4 venues from the catalog by ID and returns structured intent + picks
5. `query_router` validates IDs, enriches each venue with full catalog data, returns JSON
6. `App.tsx` renders `IntentPanel` (parsed intent chips) + `SearchResult` cards
7. If the user refines ("make it quieter"), the prior turns are sent as history so Claude can interpret the follow-up in context

## Key Design Decisions

### RAG over hallucination
`venues.py` holds a curated catalog. Claude **selects** from it by ID rather than inventing venues. IDs are validated post-parse; unknown IDs are dropped. This makes results trustworthy and eventually replaceable with a real DB or Google Places call.

### Deterministic filtering + LLM understanding
Location filtering is done in Python (exact/substring match on city + neighborhood), not by asking Claude to filter. Claude handles "what did the user mean?"; Python handles "which exact records match?" The two concerns are intentionally separate.

### Multi-turn history is client-side
Conversation history is stored in `App.tsx` state and sent with each request. The backend stays completely stateless — no sessions, no Redis. History is capped at the last 4 turns in `query_router.py` to avoid context bloat.

### Intent transparency
The `IntentPanel` shows what Claude understood (group type, vibe, occasion, time, constraints) as dismissable chips. This lets users verify the system's interpretation and helps debug misparsing.

### Search is the primary interface
No category browsing. Natural language first. Results are curated (2–4 venues), not exhaustive.

## Development Conventions

- **TypeScript strict mode**; functional components only; no class components
- **Python 3.12+** — uses `str | None` union syntax, dataclasses
- **No premature abstractions** — build for the current feature
- **No comments unless the WHY is non-obvious** — clear naming preferred
- **No unnecessary error handling** — validate at system boundaries (user input, external APIs)

## Running Locally

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env and add: ANTHROPIC_API_KEY=sk-ant-...
cd backend
pip install -r requirements.txt
python3 -m uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install          # if node_modules not present
npm run dev
# → http://localhost:5173
```

## Smoke Test (once API key is set)

```bash
curl -s -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query":"something low-key for a date, not too loud","location":"Chicago","history":[]}' \
  | python3 -m json.tool
```

Expected: JSON with `intent` object (group_type, vibe, etc.) and `venues` array of 2–4 enriched catalog entries with `match_reason`.

## What's Not Built Yet

- Real venue database (Postgres + Prisma, or Google Places ingestion)
- Auth layer
- Refinement UI to edit individual intent chips (click a chip → change that dimension)
- Dark mode
- Result caching (same query → same catalog → same results; cache by query+location hash)

## Immediate Next Steps

1. Add `ANTHROPIC_API_KEY` to `backend/.env` and run the smoke test above
2. Replace `venues.py` catalog with a real data source (Google Places API or Postgres)
3. Add intent chip editing (click a chip to refine that single dimension)
4. Wire browser geolocation to the location field as a "use my location" shortcut

## Documentation

Detailed L1–L6 pseudocode docs for each layer are in `docs/pseudocode/`:
- `01-backend-api.md` — FastAPI server + request lifecycle
- `02-query-router.md` — Claude integration + JSON extraction
- `03-frontend-search.md` — React state + component structure
- `04-venue-catalog.md` — RAG catalog design + ID validation
- `05-intent-panel.md` — intent transparency + chip layout
- `06-location-search.md` — deterministic filtering + LLM understanding split
- `07-refinement.md` — stateless multi-turn history pattern
