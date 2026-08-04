import json
import re #regex library for searching the model's response for a JSON object
from anthropic import AsyncAnthropic
from venues import filter_catalog, catalog_to_prompt_text, get_venue_by_id, CATALOG

client = AsyncAnthropic() #AsyncAnthropic is a class from the anthropic library that allows for interaction with the Anthropic API asynchronously

# Precompute the full-catalog text at import time so the string
# isn't rebuilt on every request when no location filter is applied.
_FULL_CATALOG_TEXT = catalog_to_prompt_text(CATALOG)

SYSTEM_PROMPT_TEMPLATE = """\
You are a venue curator for Moves, a platform that helps people find third spaces in their city.

Here is the complete list of venues you have available. You MUST only recommend venues from this list, using their exact `id` values. Do not invent venues.

--- VENUES ---
{catalog_text}
--- END VENUES ---

Given the user's query, do two things:
1. Extract their intent as structured fields.
2. Select 2–4 venues from the list above that best match. Prefer quality of match over quantity.

Return ONLY valid JSON — no explanation, no prose, no markdown fences. Use exactly this schema:

{{
  "intent": {{
    "group_type": "friends | family | solo | date | mixed",
    "occasion": "string describing the occasion",
    "vibe": "string describing the desired atmosphere",
    "time_of_day": "morning | afternoon | evening | night | null",
    "constraints": ["any specific constraints the user mentioned"]
  }},
  "venues": [
    {{
      "id": "exact-id-from-the-list",
      "match_reason": "one sentence explaining why this venue fits the query"
    }}
  ]
}}\
"""

#builds the system prompt for the model based on the location parameter.
def _build_system_prompt(location: str | None) -> str:
    venues = filter_catalog(location) #venues is a list of venues from the catalog filtered by the location parameter.
    catalog_text = ( #Catalog text is either the full catalog if venues is the same as CATALOG, or a filtered version 
        _FULL_CATALOG_TEXT
        if venues is CATALOG
        else catalog_to_prompt_text(venues)
    )
    return SYSTEM_PROMPT_TEMPLATE.format(catalog_text=catalog_text)


def _enrich_venues(raw_venues: list[dict]) -> list[dict]:
    """Merge Claude's slim response (id + match_reason) with full catalog data.

    Claude only needs to return the id and why it picked the venue.
    Everything else — name, address, vibes, price — comes from the catalog.
    This avoids asking Claude to parrot back data it was given, which reduces
    tokens and eliminates transcription errors on structured fields.
    """
    enriched = []
    valid_ids = set()

    for item in raw_venues:
        venue_id = item.get("id", "")
        venue = get_venue_by_id(venue_id)

        if venue is None:
            # Claude hallucinated an id not in the catalog — drop it silently.
            continue

        if venue_id in valid_ids:
            # Deduplicate if Claude returned the same venue twice.
            continue

        valid_ids.add(venue_id)
        enriched.append({
            "id": venue.id,
            "name": venue.name,
            "type": venue.type,
            "neighborhood": venue.neighborhood,
            "address": venue.address,
            "vibes": venue.vibes,
            "price_level": venue.price_level,
            "price_display": "$" * venue.price_level,
            "good_for": venue.good_for,
            "description": venue.description,
            "match_reason": item.get("match_reason", ""),
        })

    return enriched


Turn = dict  # {"role": "user" | "assistant", "content": str}. Turn is a dictionary representing a single turn in the conversation.

MAX_HISTORY_TURNS = 4  # cap to avoid context window bloat; older turns matter less


async def route_query(
    query: str,
    location: str | None,
    history: list[Turn] | None = None,
) -> dict:
    system = _build_system_prompt(location) #system prompt built on location parameter

    location_hint = f" in {location}" if location else "" #hint for the user message to include location if provided
    user_message = f"Find me a spot{location_hint}: {query}" #user message to be sent to the model with the location hint and the query

    # Build the messages list. Multi-turn history lets Claude interpret
    # follow-up refinements ("make it quieter") in context of prior results.
    # We cap history to avoid unbounded context growth: recent turns carry
    # the most signal; early turns in a long session are rarely relevant.
    prior = (history or [])[-MAX_HISTORY_TURNS:] #list of most recent turns in the conversation history, capped at MAX_HISTORY_TURNS (4)
    messages = [*prior, {"role": "user", "content": user_message}]

    message = await client.messages.create( #await the response from the model with the system prompt and the messages list
        model="claude-sonnet-4-6",
        max_tokens=2048,
        system=system,
        messages=messages,
    )

    raw = message.content[0].text #raw is the raw text response from the model

    # Claude occasionally wraps output in markdown fences despite instructions.
    json_match = re.search(r"\{.*\}", raw, re.DOTALL) #match the first JSON object in the raw text response from the model using regex. .DOTALL allows the 
    if not json_match:
        raise ValueError("No JSON object found in model response")

    parsed = json.loads(json_match.group()) #group of matched JSON objects parsed into a Python dictionary

    return {
        "intent": parsed.get("intent", {}),
        "venues": _enrich_venues(parsed.get("venues", [])),
        # Return raw text so the caller can store it as the assistant turn
        # in conversation history. Claude needs to see its own prior output
        # to interpret refinements correctly.
        "raw_response": raw,
    }
