import json
import re
from anthropic import AsyncAnthropic

client = AsyncAnthropic()

SYSTEM_PROMPT = """You are a venue discovery assistant for Moves, a platform that helps people find third spaces — coffee shops, bars, parks, restaurants, event spaces, and similar hangout spots.

Given the user's natural language query, do two things:
1. Extract their intent (group type, occasion, vibe, time of day, constraints)
2. Suggest 3–5 venues that would match that intent

Return ONLY valid JSON — no explanation, no prose, no markdown fences. Use exactly this schema:

{
  "intent": {
    "group_type": "friends | family | solo | mixed",
    "occasion": "string describing the occasion",
    "vibe": "string describing the desired atmosphere",
    "time_of_day": "morning | afternoon | evening | night | null",
    "constraints": ["array of specific constraints the user mentioned"]
  },
  "venues": [
    {
      "id": "short-unique-slug",
      "name": "Venue Name",
      "type": "coffee shop | bar | restaurant | park | gallery | etc",
      "vibe": "one-line vibe descriptor",
      "description": "1-2 sentence description of what makes this spot right for this occasion",
      "tags": ["3 to 5 short descriptive tags"]
    }
  ]
}"""


async def route_query(query: str, location: str | None) -> dict:
    location_hint = f" in {location}" if location else ""
    user_message = f"Find me a spot{location_hint}: {query}"

    message = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )

    raw = message.content[0].text

    # Claude occasionally wraps output in markdown fences despite instructions
    json_match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not json_match:
        raise ValueError("No JSON object found in model response")

    try:
        return json.loads(json_match.group())
    except json.JSONDecodeError as e:
        raise ValueError(f"JSON parse error: {e}")
