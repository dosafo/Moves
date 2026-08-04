# 07 — Conversational Refinement (`App.tsx` + `backend/query_router.py`)

## L1 — Purpose
Lets users follow up on results without restarting from scratch — typing "make it quieter" or "something closer to downtown" refines the current results rather than starting a new cold search. It exists because natural language venue discovery is inherently multi-turn: the first query sets a direction, follow-ups narrow it. Without this, users who dislike the results must rephrase their entire intent from scratch, which is slow and loses context the system already has.

## L2 — Step-by-step flow

```
FRONTEND — App.tsx
  ADD state: conversationHistory: Turn[]
    Turn = { role: "user" | "assistant", content: string }

  ON initial search (handleSearch):
    CLEAR conversationHistory
    SEND { query, location, history: [] }
    ON success:
      APPEND { role: "user",      content: query }        to history
      APPEND { role: "assistant", content: rawResponse }  to history
      SET lastIntent = response.intent
      SET venues     = response.venues

  RENDER below results (only if venues.length > 0):
    <RefineInput onRefine={handleRefine} loading={loading} />

  ON handleRefine(refinement: string):
    SEND { query: refinement, location, history: conversationHistory }
    ON success:
      APPEND { role: "user",      content: refinement }   to history
      APPEND { role: "assistant", content: rawResponse }  to history
      SET lastIntent = response.intent   ← updated intent
      SET venues     = response.venues   ← new results (replaces, not appends)

BACKEND — query_router.py
  RECEIVE history: list[{ role, content }]
  IF history non-empty:
    BUILD messages array:
      for each turn in history:
        { "role": turn.role, "content": turn.content }
      APPEND current query as final user message
    reason: Claude's multi-turn API takes a messages array where
            each turn alternates user/assistant — this exactly
            mirrors how a human conversation would be recorded
  ELSE:
    messages = [{ "role": "user", "content": query_message }]

  CALL Claude with full messages array
    result: Claude has full prior context when interpreting the refinement;
            "make it quieter" is understood relative to prior intent
```

## L3 — Key mechanisms

**Why store history as `Turn[]` in App state and pass it to the backend, rather than keeping a server-side session?**
Server-side sessions require session IDs, storage (Redis or DB), and expiry logic — significant complexity for what is fundamentally a transient browsing session. The browser already holds the conversation in memory; sending the full history on each request is stateless, scales to any number of concurrent users without coordination, and means the backend stays completely stateless. The cost is slightly larger request payloads — acceptable for conversations that rarely exceed 5–6 turns before the user finds a spot.

**Why replace venues on refinement rather than merging/appending?**
Merging results from multiple turns creates duplicates and ordering confusion — the user asked to narrow down, not accumulate. Replacement means each refinement is a fresh, coherent result set that answers the most recent question. If users want to go back to prior results, that's a separate feature (history/favourites).

**Why append the raw response string to history rather than the parsed JSON?**
Claude's conversation context works best when the assistant turn contains the same text Claude actually generated. Passing the raw JSON response means Claude can "see" exactly what it said before — including its own reasoning — when interpreting the follow-up. Summarising or restructuring it would break that continuity.

**Why clear history on a new top-level search?**
A refinement is contextually dependent on the search that preceded it. Starting a new query ("show me jazz bars" after a "chill coffee shop" search) means the old context is not just irrelevant but actively misleading — Claude might interpret the new query as a refinement of the old one. Clearing history marks a clean break.

**Why is `RefineInput` only visible when `venues.length > 0`?**
There's nothing to refine if there are no results yet. Showing it before the first search would confuse users about the search flow. The reveal-on-results pattern anchors refinement clearly to the current result set.

## L4 — Edge cases and risks

| Risk | Where it breaks | Mitigation |
|---|---|---|
| History grows very long | Token limit hit; Claude truncates or errors | Cap history at last N=4 turns before sending; older context is less relevant anyway |
| User switches location mid-conversation | Old city context lingers in history | Update `location` state and include new value in each request; backend filter uses current location |
| Refinement query is contradictory to history | Claude may struggle to reconcile | Pass intent alongside history so Claude has the structured extraction, not just raw text |
| Raw response is very large (JSON with many venues) | History payload grows quickly | Store only the user's query in history assistant-side, not full venue JSON; Claude remembers its intent |
| User expects refinement to ADD new venues to existing | Replace semantics surprise them | Label the RefineInput clearly: "Narrow these results…" not "Search again" |

## L5 — Experiments to try

- Send a 3-turn conversation in a single POST from curl — verify Claude correctly chains context across all three turns before building the UI.
- Cap history at 2 turns vs. 8 turns on an ambiguous refinement chain — observe at what point earlier context stops helping and starts confusing.
- Try "actually, forget the bar idea — I want a coffee shop instead" after 3 refinements — see if Claude correctly pivots vs. stays anchored to earlier turns.
- Store only the prior intent JSON (not raw text) as the assistant turn and compare response quality — this is a trade-off between token efficiency and context fidelity.
- Add a "Start over" button that calls `setConversationHistory([])` — notice how little code this takes once history is already state.

## L6 — Meta reflection

**What this teaches:** Stateless multi-turn context, and the difference between *session state* and *conversation state*. Session state (who the user is, what they've saved) lives on the server and persists across browser tabs and restarts. Conversation state (what we've been talking about in the last 5 minutes) is ephemeral, belongs to the client, and should be passed to the backend on each request rather than stored centrally. This distinction appears everywhere in LLM application architecture: chat apps pass message history per-request, AI coding assistants embed file context per-completion, and document Q&A systems inject retrieved chunks per-query. The pattern is always: *the model is stateless; the caller provides context*. Building this intuition early makes the leap to agentic, multi-step AI systems much less mysterious.
