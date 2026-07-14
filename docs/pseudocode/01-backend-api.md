# 01 — Backend API (`main.py`)

## L1 — Purpose
FastAPI server that exposes a `/search` POST endpoint. It exists as the single entry point between the browser and the AI query layer — it handles CORS, validates the request shape, and delegates all intelligence to `query_router.py`.

## L2 — Step-by-step flow

```
BOOT
  load .env (reads ANTHROPIC_API_KEY into environment)
  create FastAPI app instance
  attach CORSMiddleware
    allowed origins: [http://localhost:5173]   ← Vite dev server
    allowed methods: [*]
    allowed headers: [*]

DEFINE SearchRequest model
  query: str             ← required, the raw user text
  location: str | None   ← optional city/neighbourhood hint

DEFINE POST /search
  receive SearchRequest body
  call route_query(req.query, req.location)  ← async, may raise
  return dict from route_query as JSON response

ON STARTUP (implicit)
  no DB connection needed yet
  no warm-up required — anthropic client is created lazily in query_router
```

## L3 — Key mechanisms

**Pydantic request validation** — FastAPI uses the `SearchRequest` BaseModel to parse and validate the JSON body before the handler is called. If the body is missing `query` or has the wrong type, FastAPI returns a 422 Unprocessable Entity automatically — no manual validation needed.

**CORS middleware** — browsers block cross-origin requests by default. The React dev server runs on port 5173 and the API on 8000; without this middleware, every fetch would be silently rejected. Restricting to `localhost:5173` in dev is intentional — tighten to the production domain when deploying.

**Async handler** — `async def search(...)` lets FastAPI handle concurrent requests without blocking. Since `route_query` is also async (it awaits the Anthropic SDK), the event loop is never stalled waiting for network I/O.

**`python-dotenv` at module level** — calling `load_dotenv()` at import time means the API key is in `os.environ` before the Anthropic client is ever created, regardless of where the process is started from.

## L4 — Edge cases and risks

| Risk | Where it breaks | Mitigation |
|---|---|---|
| `ANTHROPIC_API_KEY` not set | `AsyncAnthropic()` raises `AuthenticationError` at first request | Check env on startup, return 500 with clear message |
| Claude returns malformed JSON | `json.loads` throws in `query_router` | Wrap in try/except, return 502 with detail |
| Query is empty string | Pydantic accepts it — Claude gets a useless prompt | Add `min_length=1` to the `query` field |
| CORS origin mismatch in production | Frontend requests silently fail | Update `allow_origins` to production domain |
| Anthropic rate limit (429) | Unhandled exception bubbles as 500 | Catch `RateLimitError`, return 429 to client |
| No `location` provided | Works fine — prompt omits location hint | Handled with `None` default |

## L5 — Experiments to try

- Add `min_length=1, max_length=500` to the `query` field on `SearchRequest` and observe what 422 responses look like.
- Remove the CORS middleware and try making a fetch from the browser — observe the exact error in DevTools.
- Add a `GET /health` endpoint that returns `{"status": "ok"}` and call it from a startup script.
- Try switching from `async def search` to `def search` and measure how concurrency behaves under load with `wrk` or `hey`.
- Add a `BackgroundTasks` parameter to log queries asynchronously without adding latency to the response.

## L6 — Meta reflection

**What this teaches:** The thin-API-gateway pattern. `main.py` deliberately does nothing clever — it is a routing layer that validates input shapes and delegates to the domain layer (`query_router.py`). This separation means the AI logic can change without touching the HTTP contract, and the HTTP contract can change (e.g. add auth middleware) without touching the AI logic.

**Where else this appears:** Every microservice that sits in front of a model API uses this pattern — OpenAI's own completion proxy, LangServe, Vertex AI endpoints. In frontend terms it maps to the "container vs presentational component" split: the container owns I/O and state, the presentational component owns display only.
