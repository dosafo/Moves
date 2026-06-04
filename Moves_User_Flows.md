# Vibescape — User Flows

This document lists the core user flows for Vibescape in the format:

> A user can ___, and the app will ___.

Each flow also includes the main data touched, latency expectations, state requirements, AI shape, and failure behavior.

---

## 1. Onboarding and preference setup

### Flow

A user can create an account and answer onboarding questions, and the app will build an initial preference profile for discovery and recommendations.

### User actions

- Choose home city/neighborhood
- Select preferred activities
- Select music tastes
- Select budget comfort level
- Select preferred social settings
- Select favorite vibes
- Select disliked vibes
- Choose whether they usually go out solo, with a partner, or with friends

### App response

- Saves profile and preferences
- Creates initial recommendation settings
- Uses preferences to personalize search and home feed

### Data touched

- Writes user profile
- Writes user preferences
- Reads vibe taxonomy
- Reads activity categories

### Latency

Interactive. The user waits.

### State

Persistent user state.

### AI shape

Optional. AI can help map free-text preferences into structured vibe tags.

### Failure behavior

Visible. If save fails, show an error and let the user retry. Partial onboarding should be recoverable.

---

## 2. Home recommendation feed

### Flow

A user can open the app, and the app will show recommended places, events, and activities based on their preferences, location, saved items, and past behavior.

### User actions

- Open app
- Browse recommended cards
- Filter by tonight, this weekend, near me, friends, price, or vibe

### App response

- Loads personalized recommendations
- Ranks results by vibe match, location, timing, price, and user preferences
- Shows fallback recommendations if personalization is weak

### Data touched

- Reads places/events
- Reads user profile/preferences
- Reads saved items
- Reads historical interactions
- Reads recommendation scores or ranking features
- Writes recommendation impressions asynchronously

### Latency

Interactive. The user waits for the feed.

### State

Persistent profile state and behavior history.

### AI shape

Usually RAG/retrieval plus ranking. AI may explain recommendations but should not invent places/events.

### Failure behavior

Partially visible. If personalization fails, fall back to trending/popular/nearby recommendations.

---

## 3. Basic search

### Flow

A user can search for places, events, or activities, and the app will return matching results from the internal catalog.

### Example searches

- “Afrobeats tonight”
- “date night in Logan Square”
- “cheap group activity Saturday”
- “house music after 10”
- “something fun that is not a bar”

### App response

- Parses the query and filters
- Retrieves matching places/events
- Ranks by relevance, location, vibe, time, and quality
- Displays list/map results

### Data touched

- Reads places/events catalog
- Reads vibe tags
- Reads location/neighborhood data
- Reads user preferences if logged in
- Writes search event asynchronously

### Latency

Interactive. Target should be fast.

### State

Session state for active query and filters. Persistent state if search history is saved.

### AI shape

RAG/retrieval path. Optional LLM parser for natural-language search.

### Failure behavior

Visible. If search fails, show fallback filters, broader suggestions, or manual location entry.

---

## 4. Natural-language discovery

### Flow

A user can describe the experience they want in natural language, and the app will convert that request into structured search filters and return relevant options.

### Example

A user can ask, “Where can my friends and I dance to Afrobeats tonight without spending $100?” and the app will search for relevant events/venues that match music, budget, time, and group context.

### App response

- Extracts intent
- Converts free text into structured filters
- Retrieves candidates from the catalog/search index
- Ranks results
- Explains why each result matches

### Data touched

- Reads search index
- Reads places/events
- Reads vibe taxonomy
- Reads user preferences
- Writes query and interaction events asynchronously

### Latency

Interactive, but AI may make it slower. Keep the LLM path constrained.

### State

Session state for conversation/search context. Persistent state if user feedback is saved.

### AI shape

LLM parser + RAG. The app should retrieve from real stored data, not generate fictional results.

### Failure behavior

Visible. If the AI parser fails, fall back to keyword search.

---

## 5. Filter and refine results

### Flow

A user can refine search results by date, price, distance, neighborhood, category, vibe, music, group size, or social setting, and the app will update results accordingly.

### App response

- Applies filters
- Re-ranks result set
- Updates map/list view
- Saves filter state during the session

### Data touched

- Reads search index
- Reads places/events
- Reads vibe/category metadata
- Writes filter interaction events asynchronously

### Latency

Interactive.

### State

Session state.

### AI shape

Usually none. Could use AI only if refining a natural-language search.

### Failure behavior

Visible. If no results match, show nearby/adjacent alternatives.

---

## 6. Place detail page

### Flow

A user can open a place page, and the app will show the venue’s description, vibe, location, hours, price, photos, events, reviews, and similar options.

### App response

- Shows core place details
- Shows vibe tags and confidence
- Shows reviews and user feedback
- Shows related events
- Shows similar places
- Shows save/share/plan actions

### Data touched

- Reads place record
- Reads place vibes
- Reads photos
- Reads reviews
- Reads related events
- Reads similar places
- Reads friend/social signals if available
- Writes page view event asynchronously

### Latency

Interactive.

### State

Mostly read-only, but user actions from this page can update persistent state.

### AI shape

Optional AI summary of vibe/reviews.

### Failure behavior

Visible if the page cannot load. Non-critical sections like similar places or reviews can fail softly.

---

## 7. Event detail page

### Flow

A user can open an event page, and the app will show date, time, location, price, ticket link, vibe, music/category, description, and related options.

### App response

- Shows event details
- Shows venue details
- Shows ticket/booking link if available
- Shows similar events
- Allows save/share/add to plan

### Data touched

- Reads event record
- Reads venue/place record
- Reads event vibes
- Reads external source metadata
- Reads user saved state
- Writes page view event asynchronously

### Latency

Interactive.

### State

Persistent if user saves, shares, or adds event to a plan.

### AI shape

Optional AI event summary or vibe explanation.

### Failure behavior

Visible if event cannot load. If ticket freshness fails, show last-known data and link to external source.

---

## 8. Save/favorite item

### Flow

A user can save a place, event, or activity, and the app will add it to their saved list for later.

### App response

- Immediately shows the item as saved
- Writes saved item to profile
- Uses the save as a recommendation signal

### Data touched

- Writes saved item
- Reads current saved state
- Writes analytics event asynchronously
- Updates recommendation signals asynchronously

### Latency

Interactive. The user expects immediate feedback.

### State

Persistent user state.

### AI shape

None.

### Failure behavior

Visible. Use idempotency so duplicate saves are treated as success.

---

## 9. Unsave item

### Flow

A user can remove a saved item, and the app will remove it from their saved list.

### App response

- Immediately updates the UI
- Removes or marks saved item inactive
- Updates recommendation signals

### Data touched

- Writes saved item status or deletes saved item
- Writes analytics event asynchronously

### Latency

Interactive.

### State

Persistent user state.

### AI shape

None.

### Failure behavior

Visible. If the write fails, revert the UI and allow retry.

---

## 10. Saved items page

### Flow

A user can view saved places/events, and the app will show everything they have saved with useful filters.

### App response

- Loads saved places/events
- Allows filtering by date, vibe, neighborhood, price, and category
- Allows user to add saved items to a plan

### Data touched

- Reads saved items
- Reads places/events for saved item details
- Reads user profile

### Latency

Interactive.

### State

Persistent user state.

### AI shape

Optional AI grouping, such as “good for date night” or “good for groups.”

### Failure behavior

Visible. If saved items fail to load, show retry.

---

## 11. Create a plan

### Flow

A user can create a plan for a future date, and the app will store the plan and let them add places/events/options.

### App response

- Creates plan
- Adds creator as member
- Adds selected places/events as options
- Prepares plan for inviting friends

### Data touched

- Writes plan
- Writes plan members
- Writes plan options
- Reads saved/search results
- Writes analytics event asynchronously

### Latency

Interactive for core plan creation. Notifications can be async.

### State

Persistent planning state.

### AI shape

Optional. AI can suggest a plan title or itinerary.

### Failure behavior

Partially visible. Core plan creation should be transactional. Invite/notification failures should not destroy the plan.

---

## 12. Invite friends to a plan

### Flow

A user can invite friends to a plan, and the app will notify those friends and add them as plan members.

### App response

- Adds invited users to plan
- Sends notifications asynchronously
- Tracks invite status

### Data touched

- Reads friend/social graph
- Writes plan members/invites
- Writes notification jobs
- Writes analytics event asynchronously

### Latency

Core invite action is interactive. Notification delivery is async.

### State

Persistent planning and social state.

### AI shape

None required.

### Failure behavior

Partially visible. If plan membership saves but notifications fail, retry notifications in background and show invite status.

---

## 13. Vote on plan options

### Flow

A user can vote on plan options, and the app will update the group’s rankings.

### App response

- Records vote
- Updates vote totals
- Shows current leading option
- Allows vote changes if supported

### Data touched

- Writes plan vote
- Reads plan options
- Reads vote totals
- Writes analytics event asynchronously

### Latency

Interactive.

### State

Persistent group planning state.

### AI shape

None required.

### Failure behavior

Visible. Duplicate votes should update the existing vote rather than create duplicates.

---

## 14. RSVP to a plan

### Flow

A user can RSVP to a plan, and the app will update their attendance status.

### App response

- Saves RSVP status
- Updates plan member list
- May notify plan creator or group

### Data touched

- Writes plan member RSVP status
- Reads plan details
- Writes notification job asynchronously

### Latency

Interactive.

### State

Persistent planning state.

### AI shape

None.

### Failure behavior

Visible. If RSVP fails, show retry.

---

## 15. Confirm final plan

### Flow

A user can confirm the winning plan option, and the app will mark the plan as confirmed and notify members.

### App response

- Updates plan status
- Marks selected option as final
- Sends notifications/reminders asynchronously
- Optionally adds to calendar later

### Data touched

- Writes plan status
- Writes selected option
- Reads plan members
- Writes notification jobs

### Latency

Interactive for confirmation. Notifications are async.

### State

Persistent plan state machine.

### AI shape

Optional. AI can generate a short summary or itinerary.

### Failure behavior

Partially visible. Core confirmation should succeed independently of notification delivery.

---

## 16. Share a place/event/plan

### Flow

A user can share a place, event, or plan, and the app will generate a shareable link or send it to selected friends.

### App response

- Creates share link or internal share record
- Sends message/notification if sharing inside the app
- Tracks share event

### Data touched

- Reads target item
- Writes share record
- Writes notification job if internal
- Writes analytics event asynchronously

### Latency

Interactive for link generation. Delivery is async.

### State

Persistent if internal share is tracked.

### AI shape

Optional. AI can generate a short share message.

### Failure behavior

Visible if link generation fails. Delivery failures should retry in background.

---

## 17. Submit review or vibe feedback

### Flow

A user can review a place/event or correct its vibe, and the app will store the feedback and use it to improve future recommendations.

### User actions

- Rate place/event
- Write review
- Select vibes that matched
- Select vibes that did not match
- Add comments like “more lounge than dancing”

### App response

- Saves review/feedback
- Updates user contribution history
- Sends review to moderation if needed
- Updates vibe aggregates asynchronously

### Data touched

- Writes review
- Writes selected vibe feedback
- Writes moderation job
- Writes vibe aggregation job
- Writes analytics event asynchronously

### Latency

Interactive for save. Moderation and vibe updates are background.

### State

Persistent user-generated content and catalog feedback.

### AI shape

AI can moderate, summarize, or classify review content asynchronously.

### Failure behavior

Partially visible. Review save failure is visible. Moderation/vibe aggregation failures should retry silently.

---

## 18. Hide or dislike recommendation

### Flow

A user can hide a recommendation or mark it as not interested, and the app will reduce similar recommendations in the future.

### App response

- Removes item from current feed
- Saves negative preference signal
- Updates recommendation behavior

### Data touched

- Writes feedback signal
- Reads user profile/preferences
- Writes analytics event asynchronously

### Latency

Interactive.

### State

Persistent recommendation memory.

### AI shape

None required.

### Failure behavior

Visible but low-risk. If write fails, item may reappear later.

---

## 19. Friend activity feed

### Flow

A user can view what friends saved, planned, or are interested in, and the app will show social activity with privacy controls.

### App response

- Shows friend activity
- Filters based on privacy settings
- Lets user join, save, or react to visible plans/items

### Data touched

- Reads social graph
- Reads friend activity events
- Reads privacy settings
- Reads places/events/plans

### Latency

Interactive.

### State

Persistent social graph and activity state.

### AI shape

Optional summarization, but not necessary for MVP.

### Failure behavior

Visible. If social feed fails, fall back to regular recommendations.

---

## 20. Follow similar users or taste profiles

### Flow

A user can follow people or taste profiles with similar interests, and the app will use that social signal to improve recommendations.

### App response

- Creates follow relationship
- Shows relevant activity/recommendations
- Updates recommendation signals

### Data touched

- Writes follow relationship
- Reads user/taste profile
- Reads activity/recommendation data

### Latency

Interactive.

### State

Persistent social/preference state.

### AI shape

Optional. AI can cluster users by taste later.

### Failure behavior

Visible. If follow fails, show retry.

---

## 21. Personalized digest

### Flow

A user can receive a weekly or weekend digest, and the app will generate a personalized list of places/events worth checking out.

### App response

- Selects candidate events/places
- Ranks them for the user
- Generates digest copy
- Sends push/email/in-app notification

### Data touched

- Reads user profile/preferences
- Reads saved items
- Reads places/events
- Reads recommendation features
- Writes digest record
- Writes notification job

### Latency

Background. User does not wait.

### State

Persistent user profile and notification state.

### AI shape

Model call for digest generation/explanation.

### Failure behavior

Usually invisible. Needs retries and job status tracking.

---

## 22. Event reminder

### Flow

A user can save or RSVP to an event, and the app will remind them before it happens.

### App response

- Schedules reminder
- Sends notification before event time
- Handles event changes/cancellations if known

### Data touched

- Reads saved items/plans/RSVPs
- Reads event time
- Writes scheduled notification job
- Writes notification delivery status

### Latency

Background.

### State

Persistent reminder/notification state.

### AI shape

None required.

### Failure behavior

Usually invisible unless reminder is late/missed. Needs retries and delivery status.

---

## 23. Venue/event ingestion

### Flow

An admin, partner, or background job can add/import venues and events, and the app will store them in the catalog.

### App response

- Imports records
- Deduplicates by external ID/name/location/time
- Geocodes locations
- Stores source references
- Marks stale or failed records

### Data touched

- Writes places/events
- Writes external source references
- Writes ingestion logs
- Writes geocode data
- Writes job status

### Latency

Background/batch.

### State

Catalog state.

### AI shape

Optional. AI can normalize descriptions or classify category/vibe after ingestion.

### Failure behavior

Usually invisible to users. Needs retries, idempotent upserts, logs, and alerts.

---

## 24. Vibe classification

### Flow

The system can classify places/events into vibe categories, and the app will use those labels for search, recommendations, and explanations.

### App response

- Reads venue/event metadata
- Reads descriptions/reviews/music/category signals
- Assigns vibe tags
- Stores confidence scores
- Updates retrieval index

### Data touched

- Reads places/events/reviews
- Reads vibe taxonomy
- Writes place/event vibe mappings
- Writes embeddings/search index entries
- Writes classification job logs

### Latency

Background.

### State

Catalog enrichment state.

### AI shape

Model call. This is an async inference path.

### Failure behavior

Usually invisible. Needs retries, confidence scores, manual override, and stale classification tracking.

---

## 25. Admin catalog correction

### Flow

An admin can correct a place, event, or vibe label, and the app will update the catalog and downstream search/recommendation data.

### App response

- Updates catalog record
- Records who changed it
- Rebuilds affected search/index entries
- Preserves override if AI classification later runs again

### Data touched

- Writes places/events/vibes
- Writes audit log
- Writes search index update job

### Latency

Interactive for admin save. Index update can be async.

### State

Catalog/admin state.

### AI shape

None required. AI can suggest corrections but admin override should win.

### Failure behavior

Visible to admin. If index update fails, retry in background.

---

## 26. Partner/promotion submission

### Flow

A venue or event partner can submit a promotion, and the app will review and publish it if approved.

### App response

- Saves promotion draft
- Links it to place/event
- Sends for moderation/approval
- Displays promotion once approved

### Data touched

- Writes promotion record
- Reads place/event record
- Writes moderation/review status
- Writes audit log

### Latency

Interactive for submission. Approval/publishing can be async.

### State

Persistent partner/catalog state.

### AI shape

Optional moderation or categorization.

### Failure behavior

Visible to submitter. Publishing jobs need retry/idempotency.

---

## 27. Report incorrect information

### Flow

A user can report that a place/event has incorrect information, and the app will create a correction task.

### App response

- Saves user report
- Optionally hides or flags suspicious data
- Sends task to admin/review queue
- Uses reports as data quality signal

### Data touched

- Writes report
- Reads place/event record
- Writes admin review task
- Writes analytics event asynchronously

### Latency

Interactive for report submission.

### State

Persistent data quality state.

### AI shape

Optional. AI can classify report type.

### Failure behavior

Visible. If report save fails, show retry.

---

## 28. Map-based exploration

### Flow

A user can explore nearby options on a map, and the app will show places/events within the visible area.

### App response

- Reads current map bounds
- Loads relevant places/events
- Clusters results if necessary
- Applies active filters

### Data touched

- Reads geospatial place/event data
- Reads vibe/category filters
- Writes map interaction event asynchronously

### Latency

Interactive.

### State

Session state for map bounds and filters.

### AI shape

None required.

### Failure behavior

Visible. If map data fails, fall back to list view.

---

## 29. Calendar/date-based browsing

### Flow

A user can browse what is happening tonight, tomorrow, this weekend, or on a specific date, and the app will show matching events and activities.

### App response

- Filters events by date/time
- Shows open places if browsing by tonight/weekend
- Ranks by relevance and freshness

### Data touched

- Reads events
- Reads place hours
- Reads user preferences
- Writes browse event asynchronously

### Latency

Interactive.

### State

Session state for active date filter.

### AI shape

Optional for natural-language dates like “this Friday after work.”

### Failure behavior

Visible. If no results, suggest nearby dates or broader categories.

---

## 30. Budget-aware discovery

### Flow

A user can set a budget, and the app will recommend options that fit that budget.

### App response

- Filters by price range
- Prioritizes low-cover/free/affordable options
- Warns if price is unknown or likely higher

### Data touched

- Reads event prices
- Reads place price level
- Reads user budget preference
- Writes filter interaction asynchronously

### Latency

Interactive.

### State

Session state and optional persistent budget preference.

### AI shape

Optional. AI can interpret phrases like “not expensive” or “under $50.”

### Failure behavior

Visible. If price is unknown, label it clearly instead of pretending certainty.

---

## 31. Music-based discovery

### Flow

A user can search by music style, and the app will return places/events matching that music or scene.

### Examples

- Afrobeats
- House
- R&B
- Hip-hop
- Latin
- Disco/funk
- Techno
- Jazz

### App response

- Maps music style to event/venue tags
- Searches matching places/events
- Ranks by relevance and timing

### Data touched

- Reads events
- Reads place/event vibe tags
- Reads music tags
- Reads user music preferences
- Writes search event asynchronously

### Latency

Interactive.

### State

Persistent if music preference is saved.

### AI shape

RAG/retrieval. AI can map natural language to known music/vibe taxonomy.

### Failure behavior

Visible. If exact match is unavailable, show adjacent scenes.

---

## 32. Group-size-aware discovery

### Flow

A user can say how many people are going, and the app will recommend places/events that fit the group size.

### App response

- Prioritizes group-friendly venues/activities
- Avoids options likely to be difficult for larger groups
- Suggests reservation-friendly places when relevant

### Data touched

- Reads place/event metadata
- Reads vibe tags
- Reads user query/session filters
- Writes interaction events asynchronously

### Latency

Interactive.

### State

Session state for current group size. Persistent if user often goes out with groups.

### AI shape

Optional. AI can infer group suitability from reviews/descriptions.

### Failure behavior

Visible. If group suitability is unknown, label uncertainty.

---

## 33. Accessibility/preference-aware discovery

### Flow

A user can set accessibility or comfort preferences, and the app will filter or rank options accordingly.

### Examples

- Wheelchair accessible
- Not too crowded
- Low noise
- Seating available
- Non-drinking activity
- LGBTQ-friendly
- Good for solo attendance

### App response

- Stores user preference if desired
- Applies filters/ranking
- Labels uncertainty when data is incomplete

### Data touched

- Reads user preferences
- Reads place/event metadata
- Reads reviews/feedback
- Writes preference updates if saved

### Latency

Interactive.

### State

Persistent user preference state.

### AI shape

Optional. AI can infer comfort/accessibility tags from descriptions and reviews, but should not overclaim.

### Failure behavior

Visible. If the app lacks reliable data, it should say so.

---

## 34. Check-in after visiting

### Flow

A user can check in or confirm they went somewhere, and the app will use that as a stronger signal for future recommendations.

### App response

- Records visit/check-in
- Prompts for lightweight feedback
- Updates recommendation profile

### Data touched

- Writes visit/check-in record
- Writes analytics event
- Reads item details
- Writes feedback prompt state

### Latency

Interactive.

### State

Persistent behavior history.

### AI shape

None required.

### Failure behavior

Visible but low-risk. If check-in fails, allow retry.

---

## 35. Recommendation explanation

### Flow

A user can ask why something was recommended, and the app will explain the match in plain language.

### App response

- Shows matching factors such as vibe, location, price, music, friends, and past saves
- Avoids revealing sensitive/private data

### Data touched

- Reads recommendation result
- Reads user preferences
- Reads place/event tags
- Reads ranking features

### Latency

Interactive.

### State

Persistent recommendation and profile state.

### AI shape

Model call or template-based explanation. Best approach is structured explanation first, AI polish second.

### Failure behavior

Visible. If explanation fails, show structured factors instead.

---

# Flow-to-component summary

| Flow group | Main data | Latency | State | AI shape | Needed components |
|---|---|---|---|---|---|
| Onboarding | Profile + preferences + vibes | Interactive | Persistent | Optional parser | Profile store, vibe taxonomy |
| Search | Places/events + vibes | Interactive | Session | RAG/parser | Places store, retrieval index |
| Recommendations | Places/events + profile + behavior | Interactive | Persistent | RAG/ranking | Places store, profile store, ranking layer |
| Save | Profile/saved items | Interactive | Persistent | None | Profile store |
| Detail pages | Places/events + reviews + vibes | Interactive | Mixed | Optional summary | Places store, review store, retrieval index |
| Planning | Plans + members + options + votes | Interactive + async notifications | Persistent | Optional itinerary | Planning store, queue/worker |
| Reviews | Reviews + vibes + moderation | Interactive save, async processing | Persistent | Moderation/classification | Review store, queue/worker |
| Digest | Profile + places/events | Background | Persistent | Model call | Queue/worker, inference path |
| Ingestion | External data + catalog | Background | Catalog | Optional classifier | Queue/worker, places store |
| Vibe classification | Catalog + reviews + taxonomy | Background | Catalog enrichment | Model call | Inference path, queue/worker, retrieval index |
| Notifications | Plans/saves/events | Background | Persistent | Optional copy generation | Queue/worker, notification service |

---

# MVP priority order

1. Onboarding/preferences
2. Catalog seed data
3. Basic search
4. Detail pages
5. Save/unsave
6. Recommendation feed
7. Natural-language search
8. Create plan
9. Invite/vote on plan
10. Review/vibe feedback
11. Background vibe classification
12. Personalized digest

---

# Product principle

The product should feel like:

> “Tell me the kind of night you want, and I’ll help you find the right options, remember what you like, and make it easier to coordinate with friends.”

The technical system should follow the same idea:

> Fast retrieval for user-facing discovery, persistent memory for personalization, and async workers for everything slow or AI-heavy.
