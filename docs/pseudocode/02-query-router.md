# 02 — Query Router (`query_router.py`)

## L1 — Purpose
Translates a raw natural-language user query into structured venue suggestions using Claude as the reasoning engine. It exists because free-text intent ("chill spot for 4 people, nothing too loud on a Friday") cannot be reduced to a simple keyword search — it requires semantic understanding of vibe, occasion, and group dynamics.

## L2 — Step-by-step flow

```
MODULE LOAD
  import AsyncAnthropic, json, os
  instantiate client = AsyncAnthropic()
    reads ANTHROPIC_API_KEY from environment automatically

DEFINE SYSTEM_PROMPT (constant string)
  role: venue discovery assistant for Moves
  task: extract user intent + suggest 3-5 matching venues
  output constraint: return ONLY valid JSON, no prose
  schema:
    intent:
      group_type   ← "friends" | "family" | "solo" | "mixed"
      occasion     ← free string
      vibe         ← free string
      time_of_day  ← string or null
      constraints  ← list of strings
    venues:
      id           ← short unique string
      name         ← venue name
      type         ← "coffee shop" | "bar" | "restaurant" | "park" | etc
      vibe         ← one-line vibe descriptor
      description  ← 1-2 sentences
      tags         ← list of 3-5 descriptive tags

DEFINE async route_query(query: str, location: str | None) -> dict
  build user_message:
    if location:  "Find me a spot in {location}: {query}"
    else:         "Find me a spot: {query}"

  call client.messages.create(
    model = "claude-sonnet-4-6"
    max_tokens = 1024
    system = SYSTEM_PROMPT
    messages = [{ role: "user", content: user_message }]
  )  ← awaited, network I/O yielded to event loop

  extract raw = message.content[0].text
  parse and return json.loads(raw)
    ← raises json.JSONDecodeError if Claude deviates from schema
```

## L3 — Key mechanisms

**System prompt as schema contract** — the system prompt is where the output shape is defined. By instructing Claude to return ONLY valid JSON with a specific schema, the router avoids parsing prose. This works because Claude reliably follows strict schema instructions when the schema is unambiguous and given in the system turn (not the user turn).

**Separate system vs user message** — placing the role and output rules in the system prompt keeps the user message clean (just the query intent). This matters because Claude weights the system prompt as a persistent instruction, not a conversational turn — it doesn't get "forgotten" as dialogue continues.

**Async Anthropic client** — `AsyncAnthropic` uses `httpx` under the hood and yields control during the network call. FastAPI's event loop can serve other requests while Claude processes. If you used the sync client inside an `async def` handler it would block the entire process.

**Implicit API key loading** — `AsyncAnthropic()` without arguments reads `ANTHROPIC_API_KEY` from `os.environ`. `load_dotenv()` in `main.py` ensures this is populated before the client is instantiated.

**Future DB pattern (not yet wired)** — when real venue records replace Claude-generated ones, the fetch will look like:
```python
with Session() as session:
    venues = session.merge(venue_record)
```
Keep DB access inside `with Session()` blocks so the connection is always returned to the pool.

## L4 — Edge cases and risks

| Risk | Where it breaks | Mitigation |
|---|---|---|
| Claude returns prose before JSON | `json.loads` fails on the wrapper text | Use `re.search(r'\{.*\}', raw, re.DOTALL)` to extract JSON substring |
| JSON schema mismatch (missing fields) | Downstream code KeyErrors | Validate with Pydantic model before returning |
| Very short/ambiguous query | Claude may generate generic results | Acceptable for MVP; add a minimum query quality check later |
| max_tokens too low | Response truncates mid-JSON | Raise to 2048 if 5-venue responses are being cut off |
| Anthropic outage / timeout | `httpx.TimeoutException` propagates as 500 | Add `timeout=30` param and catch with a clear 503 |
| Location is a vague string | Claude incorporates it as a hint, not a geocode | Fine for MVP; swap with geocoding API later |
| Prompt injection in query | User could try to override system prompt | System prompt is in a separate role, reducing risk; add basic sanitisation for prod |

## L5 — Experiments to try

- Send a query without a system prompt and compare how much the response format degrades.
- Change `max_tokens` to 256 and observe what happens to 5-venue responses (you'll see truncation mid-JSON).
- Add `temperature=0` to `messages.create` and compare consistency of results across identical queries.
- Try returning `thinking` blocks using `claude-opus-4-8` with `thinking={"type":"enabled", "budget_tokens": 500}` and inspect how Claude reasons about vibe extraction.
- Replace the free-text schema with a Pydantic model and use `model.model_json_schema()` to generate the schema string programmatically.

## L6 — Meta reflection

**What this teaches:** Using a language model as a structured parser. The key insight is that Claude is not being asked to "be creative" here — it is being used as a reliable JSON transformer that maps unstructured natural language to a typed schema. This is the same pattern behind every "extract entities from text" or "classify intent" pipeline in production AI systems.

**Where else it appears:** Intent extraction in voice assistants (Siri, Alexa), tool-call argument filling in function-calling APIs, form auto-fill from free text, document information extraction (receipts, contracts). The pattern scales from a single-field extraction to arbitrarily complex nested schemas.
