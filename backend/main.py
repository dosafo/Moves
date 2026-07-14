from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from query_router import route_query

app = FastAPI(title="Moves API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    location: str | None = None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/search")
async def search(req: SearchRequest):
    try:
        result = await route_query(req.query, req.location)
        return result
    except ValueError as e:
        raise HTTPException(status_code=502, detail=f"Model returned invalid response: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
