# 04 — Venue Catalog (`backend/venues.py` + updated `query_router.py`)

## L1 — Purpose
Replaces Claude hallucinating fictional venues with Claude selecting and ranking from a real, curated catalog. The catalog is the authoritative list of places the system knows about; Claude's job shifts from *invention* to *curation*. This exists because invented venues cannot be verified, linked, or trusted — a real catalog (even a small mock one) is what makes the product usable rather than a demo.

## L2 — Step-by-step flow

```
DEFINE Venue dataclass
  fields: id, name, type, neighborhood, city,
          vibes[], music_styles[], price_level (1–4),
          description, good_for[], address

DEFINE CATALOG: list[Venue]
  ~15–20 hand-curated venues across varied types, vibes, price levels

DEFINE get_catalog_text() -> str
  serialize each Venue to a numbered, readable block
  reason: Claude parses plain text more reliably than raw JSON dicts
          in a system prompt; numbered list preserves ordering context

IN query_router.route_query(query, location, history):
  BUILD system prompt:
    role: "you are a venue curator for Moves"
    inject CATALOG_TEXT  ← the full serialized catalog
    instruction: "ONLY recommend venues from the list above, by their exact id"
    instruction: "never invent venues not in the catalog"
    JSON schema (same as before, but venues now have an `id` that MUST
                 match a catalog entry — validated after parse)

  IF history is non-empty:
    prepend prior turns to messages list   ← step D territory

  CALL Claude with messages
  PARSE response JSON
  VALIDATE each returned venue.id exists in {v.id for v in CATALOG}
    if an id is unknown: drop that venue rather than 500-ing
    reason: graceful degradation is better than crashing on hallucinated ids
  ENRICH returned venues with catalog data
    Claude may return a subset of fields; merge with catalog record
    for guaranteed completeness

  RETURN { intent, venues (enriched) }
```

## L3 — Key mechanisms

**Why a dataclass and not a plain dict?**
Python dataclasses give field-level type annotations and `asdict()` for free. A dict would work but loses autocomplete and makes typos in field names silently wrong. A Pydantic model would add runtime validation but is heavier than needed for a hand-maintained in-memory catalog.

**Why serialize to plain text for the prompt?**
Injecting `json.dumps(catalog)` would work but is harder for Claude to scan — raw JSON is dense and lacks human-readable structure. A numbered, labelled block (venue 1: The Vinyl Room / type: bar / vibes: laid-back, social ...) maps more closely to how Claude was trained to read documents. The formatting cost is a one-time serialisation; it doesn't change per request.

**Why validate returned IDs against the catalog after parsing?**
Claude will occasionally hallucinate a plausible-sounding venue ID that isn't in the list, especially when the query describes something the catalog covers poorly. Validating post-parse lets us drop rogue entries silently rather than serving users a link to a non-existent place. The alternative (strict prompt engineering) reduces but doesn't eliminate hallucination.

**Why enrich returned venues from the catalog record?**
Claude's response only needs to include the IDs and a short explanation — the rest (address, price level, good_for) is already in the catalog. Merging avoids asking Claude to parrot back data it was given, reducing token usage and the surface area for transcription errors.

## L4 — Edge cases and risks

| Risk | Where it breaks | Mitigation |
|---|---|---|
| Catalog covers only one city | Queries for other cities return irrelevant results | Add `city` field to venues; filter catalog by `location` before injecting |
| Catalog is too large for context | Prompt token limit hit for large catalogs | Filter to top-N by category or neighborhood before injection; embed + retrieve at scale |
| Claude returns no matching IDs | All venues dropped; empty results | Return an explicit "no match" flag so frontend shows "try a different vibe" |
| Hallucinated ID slips validation | Venue appears in UI with missing fields | Post-parse ID check drops unknown entries; enrich step fills required fields from catalog |
| Catalog serialisation is slow | Adds latency on every request | Compute `CATALOG_TEXT` at module import time, not per-request |
| Price level not communicated to users | Users don't know what 1–4 means | Map to `$` / `$$` / `$$$` / `$$$$` in the frontend card |

## L5 — Experiments to try

- Change the prompt instruction from "ONLY recommend venues from the list" to "prefer venues from the list but you may suggest others" — observe how quickly Claude starts hallucinating, and measure how often hallucinations are useful vs. harmful.
- Remove the ID validation step and watch what arrives in the UI — this builds intuition for how often the model drifts.
- Add a `capacity` field (intimate / medium / large) and ask Claude to use it for group-size filtering — notice that structured fields in the catalog translate into better filtering without any extra code.
- Time `get_catalog_text()` called 1000× vs computed once at import — see why module-level precomputation matters at scale.
- Swap the plain-text serialization for `json.dumps` and compare Claude's result quality on ambiguous queries.

## L6 — Meta reflection

**What this teaches:** The RAG (Retrieval-Augmented Generation) pattern at its simplest. Instead of relying on a model's parametric memory (what it learned during training), you inject the authoritative data directly into the context window. The model's role changes from "know the answer" to "reason over provided data." This is the foundation of every production LLM application that needs to be factually grounded — from customer support chatbots to code-search assistants. The mock catalog is a stand-in for a vector database; the ID validation is a stand-in for citation verification.
