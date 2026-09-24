from dotenv import load_dotenv #doetenv library loads enviroment variables from a .env file into the env variables of the operating system. It helps keep sensitive info outside the codebase.
load_dotenv()

import hashlib

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware #CORSMiddleware allows cross-origin requests to the API from the frontend
from pydantic import BaseModel, Field #BaseModel is a base class for creating data models with validation and serialization.
from query_router import route_query

app = FastAPI(title="Moves API")

# Same catalog + same query + same location always yields an equivalent
# result, so top-level searches are memoized in-process. Refinements are
# excluded — their result depends on conversation history, not just these
# two fields, so keying on query+location alone would return stale answers.
_search_cache: dict[str, dict] = {}


def _cache_key(query: str, location: str | None) -> str:
    normalized = f"{query.strip().lower()}|{(location or '').strip().lower()}"
    return hashlib.sha256(normalized.encode()).hexdigest()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Turn(BaseModel):
    role: str   # "user" | "assistant"
    content: str


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    # Location is capped at 00 chars to limit the surface area for
    # prompt injection; the value is injected verbatim into the system prompt.
    location: str | None = Field(None, max_length=100)
    history: list[Turn] = Field(default_factory=list)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/search")
async def search(req: SearchRequest):
    is_refinement = bool(req.history)
    cache_key = None if is_refinement else _cache_key(req.query, req.location)

    if cache_key and cache_key in _search_cache:
        return _search_cache[cache_key]

    try:
        result = await route_query(
            req.query,
            req.location,
            [t.model_dump() for t in req.history], #convert the list of Turn objects in the request history to a list of dictionaries using model_dump()
        )
    except ValueError as e:
        raise HTTPException(status_code=502, detail=f"Model returned invalid response: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if cache_key:
        _search_cache[cache_key] = result

    return result
