# Moves — CLAUDE.md

## Project Overview

**Moves** is a discovery platform that helps people find third spaces — venues like coffee shops, parks, bars, restaurants, and event spaces — tailored to their vibe, group, and occasion. The goal is to surface places that are fun, fitting, and social: whether hanging with friends, spending time with family, or meeting new people.

## Architecture

```
Moves/
├── frontend/          # React + TypeScript (Vite)
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       └── components/
│           ├── SearchInput.tsx   # Natural language query entry
│           └── SearchResult.tsx  # Venue result cards
└── backend/           # Python (FastAPI expected)
    ├── main.py        # API entrypoint
    └── query_router.py  # Routes/classifies user queries
```

### Frontend
- React + TypeScript
- Core UX is search-driven: user types a natural language query, results are returned as venue cards
- `SearchInput` captures the query; `SearchResult` renders each match

### Backend
- Python; expected to use FastAPI
- `query_router.py` is the core intelligence layer — it interprets user queries and routes them to the appropriate data source or AI model
- Likely integrates with Claude (Anthropic) for semantic understanding of what the user wants

## Core User Flow

1. User lands on the app and sees a prominent search input
2. User types a natural language prompt (e.g., "chill spot for 4 people on a Friday night, nothing too loud")
3. Query router parses intent: group size, vibe, occasion, location constraints
4. Relevant venues are returned and displayed as result cards
5. User can browse, filter, or refine

## Development Conventions

- **Frontend**: TypeScript strict mode; functional components only; no class components
- **Backend**: Python; keep `query_router.py` focused on routing/classification logic, not data fetching
- **No premature abstractions** — build for the current feature, not hypothetical future ones
- **No comments unless the WHY is non-obvious** — clear naming is preferred
- **No unnecessary error handling** — only validate at system boundaries (user input, external APIs)

## Key Design Decisions

- Search is the primary interface — not browsing categories
- Natural language input is a first-class feature, not a filter layer on top of a grid
- Results should feel curated, not exhaustive — quality over quantity

## What's Not Built Yet

- Package/dependency setup (no `package.json`, `requirements.txt`, or `vite.config` yet)
- All source files are currently empty placeholders
- No database or venues data source wired up
- No auth layer

## Immediate Next Steps (expected build order)

1. Scaffold frontend: `package.json`, Vite config, Tailwind or CSS setup
2. Scaffold backend: FastAPI app in `main.py`, dev server
3. Implement `SearchInput` component with debounced query submission
4. Implement `SearchResult` component for rendering venue cards
5. Wire `query_router.py` to Claude API for query understanding
6. Connect frontend to backend search endpoint
7. Integrate a venues data source (Google Places API, Foursquare, or custom)
