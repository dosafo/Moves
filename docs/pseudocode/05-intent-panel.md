# 05 — Intent Transparency Panel (`frontend/src/components/IntentPanel.tsx`)

## L1 — Purpose
Renders the structured intent Claude extracted from the user's query — group type, vibe, occasion, time of day, constraints — as labelled badges above the results grid. It exists because users cannot verify the system understood them without seeing the intermediate representation; when the intent is wrong (e.g., Claude misread "low-key" as "nightlife"), the panel makes the mismatch immediately visible and explains why results look off.

## L2 — Step-by-step flow

```
RECEIVE intent: Intent | null
  (null while loading, or if no search has happened)

IF intent is null:
  render nothing  ← no flash of empty content between searches

BUILD chips array from intent fields:
  if intent.group_type:   chip("group",    intent.group_type)
  if intent.occasion:     chip("occasion", intent.occasion)
  if intent.vibe:         chip("vibe",     intent.vibe)
  if intent.time_of_day:  chip("time",     intent.time_of_day)
  for each c in intent.constraints:
    chip("constraint", c)

  reason: only render chips for fields that are non-null/non-empty
          so the panel doesn't show blank/misleading badges for
          dimensions the query didn't mention

RENDER:
  <section aria-label="How we understood your query">
    <p class="section label"> "We understood:" </p>
    <div class="chip row">
      for each chip:
        <span>
          <label class="dim label"> chip.dimension </label>
          <value> chip.value </value>
        </span>
    </div>
  </section>
```

## L3 — Key mechanisms

**Why a dedicated component instead of rendering badges inline in App?**
The intent shape has 5+ fields with conditional rendering logic. Putting that inside App's JSX makes App longer and harder to scan. A `IntentPanel` component is testable in isolation (pass an intent object, assert chips appear) and swappable — you could replace it with an editable panel later without touching App.

**Why render nothing when intent is null rather than a placeholder?**
A skeleton/placeholder would flash in before the first search, implying content is loading when nothing is actually in flight. `null` means "no search has happened" — rendering nothing is the honest state. The component becomes a purely additive layer once results exist.

**Why chips rather than a prose sentence?**
A sentence like "We think you want a chill bar for a small group on a Friday night" is readable but hard to scan and harder to click-to-edit later. Chips have discrete labels, are visually anchored, and each chip maps 1:1 to a field in the `Intent` type — making it straightforward to add editing (click a chip → modal → new search) in a future step.

**Why include `aria-label` on the section?**
Screen readers announce region landmarks. Without a label, a reader hears "section" with no context. With it, they hear "How we understood your query" — enough context to decide whether to engage.

## L4 — Edge cases and risks

| Risk | Where it breaks | Mitigation |
|---|---|---|
| All intent fields are null | Panel renders nothing (silently) | This is correct — show nothing rather than misleading empty badges |
| Vibe string is very long | Chip overflows its container | `max-w-xs truncate` in Tailwind, title attribute shows full text on hover |
| Multiple constraints (long list) | Row of chips wraps unpredictably | `flex-wrap` keeps layout intact; more than 4 constraints → truncate and show "+N more" |
| Intent shown for stale results | User types new query; old intent persists until new results arrive | Clear `intent` in App state when a new search starts (set to null alongside `setVenues([])`) |
| Backend returns intent with unexpected field names | TypeScript `Intent` interface mismatch | Type the response strictly; unknown fields are ignored; missing expected fields render no chip |

## L5 — Experiments to try

- Send a deliberately vague query ("something fun") and observe which intent fields Claude fills vs. leaves null — see how the panel reveals the model's confidence.
- Send the same query twice and compare the two panels — notice how stochastic the LLM extraction is, and consider whether you should cache or determinise it.
- Add a click handler to a chip that appends "not [value]" to the next query ("not evening" → "morning or afternoon") — see how little code it takes to turn the panel into an interactive refinement layer.
- Remove the `aria-label` and run a screen reader through the page — hear what a user with a visual impairment experiences without it.

## L6 — Meta reflection

**What this teaches:** Explainability as a first-class UI feature. The intent panel is a form of "show your work" — the same principle behind confidence scores in ML, audit logs in finance, and reasoning traces in agentic AI. Whenever a system makes a decision on behalf of a user, surfacing the decision's basis lets the user verify, correct, and learn to trust the system. This pattern (extract → display → allow correction) is the foundation of human-in-the-loop AI design and will appear in every production AI product that aims for user trust rather than just accuracy.
