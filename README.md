# Moves — Coding README

> Working name: **Moves**  
> Product idea: a social experience-discovery app that helps young adults find places, events, and activities based on the kind of night, vibe, music, budget, neighborhood, and social context they want.

---

## 1. What this app is

Moves helps users answer questions like:

- “Where can my friends and I dance to Afrobeats tonight without spending $100?”
- “What’s a lowkey date spot near Logan Square?”
- “What’s something fun to do Saturday that is not just another bar?”
- “Where are my friends thinking about going this weekend?”
- “What events match my music taste, budget, and social comfort level?”

The core product is not just a map, event feed, or review app. The core product is a **vibe-based discovery and planning engine**.

---

## 2. MVP goal

The MVP should prove one thing:

> A user can describe the type of experience they want, and the app can return useful places/events that feel personally relevant.

The first version does **not** need full social networking, ticketing, advanced ML, payments, or live crowd prediction. Those can come later.

### MVP should include

- User onboarding/preferences
- Place/event catalog
- Vibe tags
- Search/discovery
- Recommendation feed
- Save/favorite functionality
- Basic plan creation
- Basic user feedback/review signals
- Async ingestion/classification pipeline

### MVP should avoid at first

- Full real-time chat
- Payments/ticket purchases inside the app
- Heavy live scraping during user search
- Complex friend graph recommendations
- Training custom ML models before there is enough user data
- Overbuilding admin tooling before the catalog model works

---

## 3. Core architecture idea

The system should be split into two major paths:

### A. Interactive path

The user is actively waiting.

Examples:

- Search
- Recommendations
- Place/event detail page
- Save item
- Create plan
- Vote on plan
- Submit feedback

This path should be fast. It should read from prepared internal stores and avoid slow live AI calls, scraping, or external API chains whenever possible.

### B. Background path

The user is not waiting.

Examples:

- Import venue/event data
- Refresh event info
- Classify vibe tags
- Build embeddings/search index
- Update recommendations
- Send notifications
- Moderate reviews
- Generate weekly digests

This path can use queues, workers, scheduled jobs, retries, and slower model calls.

---

## 4. Main components

### Frontend app

Responsible for:

- Onboarding UI
- Search UI
- Map/list results
- Place/event detail pages
- Save and collections UI
- Plan creation UI
- Voting UI
- User profile/preferences UI

Possible stack:

- Next.js / React
- TypeScript
- Tailwind or component library
- Map provider later, if needed

---

### Backend API

Responsible for:

- User authentication/session handling
- Search endpoints
- Recommendation endpoints
- Place/event detail endpoints
- Save/favorite endpoints
- Plan and voting endpoints
- Review/feedback endpoints
- Admin/partner endpoints later

Possible stack:

- FastAPI, Django, Express, or Next.js API routes
- Start with a simple monolith before splitting services

---

### Places store

Stores relatively durable catalog data:

- Venues
- Events
- Activities
- Categories
- Neighborhoods
- Hours
- Price level
- Location/geocode
- Photos
- External source references
- Ticket or booking links

This is needed because the same place/event data is read across search, recommendations, detail pages, saves, plans, reviews, and digests.

---

### Profile store

Stores user-specific data:

- Account identity
- Home city/neighborhood
- Preferred neighborhoods
- Favorite vibes
- Disliked vibes
- Music/activity preferences
- Budget preferences
- Saved places/events
- Past interactions
- Notification settings

This is needed because personalization spans multiple flows.

---

### Social/planning store

Stores planning state:

- Friends
- Groups
- Plans
- Plan options
- Invites
- RSVPs
- Votes
- Comments
- Plan status

This becomes important once the app moves from discovery into coordination.

---

### Retrieval/search index

Used for fast discovery.

Should support:

- Keyword search
- Filters
- Neighborhood/distance search
- Vibe search
- Category search
- Event date/time filtering
- Eventually semantic search/vector search

For MVP, this could be simple. For example:

- PostgreSQL full-text search
- Meilisearch
- Typesense
- Algolia
- Elasticsearch/OpenSearch
- Vector search later

---

### Inference path

Used when AI is helpful.

Common uses:

- Convert natural-language search into structured filters
- Explain why a place/event was recommended
- Classify venue/event vibe tags
- Summarize review patterns
- Generate personalized digests

Important principle:

> Do not let the LLM be the whole system. Let it parse, classify, summarize, and explain. Let the database/search layer retrieve the actual candidates.

---

### Queue + worker

Needed for anything slow, retryable, or failure-prone.

Background jobs:

- Ingest places/events
- Refresh stale event data
- Classify vibes
- Build search embeddings
- Send notifications
- Moderate reviews
- Generate digests
- Update recommendation features

---

## 5. Suggested first database tables

Start simple.

### users

- `id`
- `email`
- `display_name`
- `home_city`
- `home_neighborhood`
- `created_at`
- `updated_at`

### user_preferences

- `id`
- `user_id`
- `preferred_vibes`
- `preferred_categories`
- `preferred_music`
- `preferred_neighborhoods`
- `budget_preference`
- `social_context_preference`
- `created_at`
- `updated_at`

### places

- `id`
- `name`
- `description`
- `category`
- `address`
- `city`
- `neighborhood`
- `latitude`
- `longitude`
- `price_level`
- `website_url`
- `external_source`
- `external_id`
- `created_at`
- `updated_at`

### events

- `id`
- `place_id`
- `title`
- `description`
- `start_time`
- `end_time`
- `price_min`
- `price_max`
- `ticket_url`
- `external_source`
- `external_id`
- `created_at`
- `updated_at`

### vibes

- `id`
- `name`
- `description`
- `parent_category`

### place_vibes

- `id`
- `place_id`
- `vibe_id`
- `confidence_score`
- `source`
- `created_at`
- `updated_at`

### event_vibes

- `id`
- `event_id`
- `vibe_id`
- `confidence_score`
- `source`
- `created_at`
- `updated_at`

### saved_items

- `id`
- `user_id`
- `item_type`
- `item_id`
- `created_at`

Add a unique constraint on:

- `user_id`
- `item_type`
- `item_id`

This makes save actions idempotent.

### plans

- `id`
- `creator_user_id`
- `title`
- `description`
- `status`
- `planned_for`
- `created_at`
- `updated_at`

Suggested statuses:

- `draft`
- `invites_sent`
- `voting_open`
- `confirmed`
- `cancelled`
- `completed`

### plan_options

- `id`
- `plan_id`
- `item_type`
- `item_id`
- `created_at`

### plan_members

- `id`
- `plan_id`
- `user_id`
- `role`
- `rsvp_status`
- `created_at`
- `updated_at`

### plan_votes

- `id`
- `plan_id`
- `plan_option_id`
- `user_id`
- `vote_value`
- `created_at`
- `updated_at`

Add a unique constraint on:

- `plan_id`
- `plan_option_id`
- `user_id`

### reviews

- `id`
- `user_id`
- `item_type`
- `item_id`
- `rating`
- `body`
- `selected_vibes`
- `moderation_status`
- `created_at`
- `updated_at`

### user_events / analytics_events

- `id`
- `user_id`
- `event_type`
- `target_type`
- `target_id`
- `metadata`
- `created_at`

Examples of `event_type`:

- `search_submitted`
- `result_viewed`
- `result_clicked`
- `item_saved`
- `item_unsaved`
- `plan_created`
- `vote_submitted`
- `review_submitted`
- `recommendation_impression`

---

## 6. API endpoints to build first

### Health

```txt
GET /health
```

Returns whether the API is running.

---

### Auth/user

```txt
GET /me
POST /onboarding/preferences
GET /me/preferences
PATCH /me/preferences
```

---

### Search/discovery

```txt
GET /search
POST /search/natural-language
GET /recommendations
```

Initial query params for `/search`:

- `q`
- `city`
- `neighborhood`
- `lat`
- `lng`
- `radius`
- `category`
- `vibe`
- `date`
- `price_min`
- `price_max`

---

### Places/events

```txt
GET /places/:id
GET /events/:id
GET /places/:id/similar
GET /events/:id/similar
```

---

### Saves

```txt
POST /saved-items
GET /saved-items
DELETE /saved-items/:id
```

Make `POST /saved-items` idempotent.

---

### Plans

```txt
POST /plans
GET /plans
GET /plans/:id
PATCH /plans/:id
POST /plans/:id/options
POST /plans/:id/invites
POST /plans/:id/votes
POST /plans/:id/rsvp
```

---

### Reviews/feedback

```txt
POST /reviews
GET /places/:id/reviews
GET /events/:id/reviews
POST /feedback/recommendation
```

---

## 7. Recommended folder structure

This is a generic structure. Adapt it to the stack you choose.

```txt
moves/
  README.md
  docs/
    user-flows.md
    architecture.md
    data-model.md
    api-contracts.md
    async-jobs.md
  apps/
    web/
      src/
        app/
        components/
        features/
          onboarding/
          search/
          recommendations/
          places/
          plans/
          profile/
        lib/
        styles/
    api/
      src/
        main.*
        routes/
          health.*
          users.*
          search.*
          recommendations.*
          places.*
          events.*
          saves.*
          plans.*
          reviews.*
        services/
          search_service.*
          recommendation_service.*
          place_service.*
          plan_service.*
          profile_service.*
          vibe_service.*
        repositories/
          user_repository.*
          place_repository.*
          event_repository.*
          plan_repository.*
        workers/
          ingest_places_worker.*
          classify_vibes_worker.*
          notification_worker.*
        models/
        schemas/
        config/
        tests/
  packages/
    shared/
      types/
      constants/
      utils/
  infra/
    docker/
    migrations/
    seed/
```

---

## 8. Coding order

Build in this order.

### Step 1 — Project shell

- Create repo
- Add README
- Add `.env.example`
- Add basic frontend shell
- Add basic backend API shell
- Add health check endpoint
- Add database connection

Definition of done:

- App runs locally
- API health check works
- Database connection works

---

### Step 2 — Catalog seed data

- Create `places`, `events`, `vibes`, `place_vibes`, and `event_vibes`
- Add seed data for one city, preferably Chicago
- Add 25–100 initial places/events manually or from a simple CSV

Definition of done:

- You can load place/event data locally
- You can view it through an API endpoint

---

### Step 3 — Basic search

- Build `/search`
- Support keyword, category, neighborhood, date, and vibe filters
- Return list results
- Display results in frontend

Definition of done:

- User can search places/events
- Results render in the app
- Search is fast enough for local testing

---

### Step 4 — Detail pages

- Build place detail page
- Build event detail page
- Show vibe tags, description, location, price, hours/time, and similar items

Definition of done:

- User can click result and see a useful detail page

---

### Step 5 — User profile/preferences

- Add basic user model
- Add onboarding form
- Store preferences
- Use preferences in recommendation ranking

Definition of done:

- User can onboard
- App remembers preferences
- Recommendations change based on preferences

---

### Step 6 — Saves

- Add `saved_items`
- Add save/unsave button
- Add saved items page
- Make save idempotent

Definition of done:

- User can save something and return to it later

---

### Step 7 — Recommendations

- Build basic recommendation endpoint
- Rank by preferences + vibe match + location + popularity/manual score
- Add recommendation feed

Definition of done:

- User gets personalized results without typing a search

---

### Step 8 — Natural-language search

- Add endpoint that parses a query into filters
- Use AI only to structure the query, not to invent results
- Retrieve candidates from internal store/search index
- Optionally use AI to explain why results match

Definition of done:

- User can type a natural-language request and get sensible structured results

---

### Step 9 — Plans

- Add plans, plan options, members, and votes
- Let user create a plan from saved/search results
- Let members vote on options

Definition of done:

- User can create a simple group plan and vote on options

---

### Step 10 — Background jobs

- Add basic queue/worker pattern
- Add async vibe classification job
- Add async analytics event write or recommendation update job
- Add scheduled refresh job placeholder

Definition of done:

- Slow work is separate from user-facing requests

---

## 9. Environment variables

Create `.env.example` early.

```txt
DATABASE_URL=
API_BASE_URL=
WEB_BASE_URL=
AUTH_SECRET=
OPENAI_API_KEY=
MAPS_API_KEY=
SEARCH_SERVICE_URL=
QUEUE_URL=
```

Add provider-specific values only when you actually integrate them.

---

## 10. Development rules

### Keep the first version simple

Build the simplest version that proves the product experience.

Good first version:

- Curated catalog
- Manual vibe tags
- Simple ranking
- Basic user preferences
- Basic saves
- Basic plan flow

Bad first version:

- Complex ML pipeline before you have users
- Too many external API integrations
- Full social network
- Real-time everything
- Overbuilt microservices

---

### Do not put slow work in request handlers

Avoid doing this during a user search:

- Scraping
- Large external API chains
- Heavy LLM classification
- Full recommendation model training
- Batch imports

Do those in background jobs.

---

### Make writes idempotent

Especially:

- Save item
- Unsave item
- Create plan
- Send invite
- Submit vote
- Import external event
- Process background job

Use unique constraints and idempotency keys where appropriate.

---

### Track events from the beginning

Even if you do not build ML yet, log user actions.

Track:

- Search submitted
- Result viewed
- Result clicked
- Item saved
- Recommendation shown
- Recommendation clicked
- Plan created
- Vote submitted
- Review submitted

This data becomes the foundation for personalization later.

---

## 11. AI usage rules

Use AI for:

- Natural-language query parsing
- Vibe classification
- Review summarization
- Recommendation explanations
- Digest generation

Do not use AI as the only source of truth for:

- Whether an event exists
- Whether a venue is open
- Ticket availability
- Prices
- Addresses
- Location distance

The database/search layer should be the source of truth. AI should help interpret and explain.

---

## 12. First sprint plan

### Sprint 1 goal

Get a local app running with seeded Chicago experience data and basic search.

### Tasks

- Initialize repo
- Create README and docs folder
- Choose stack
- Create frontend shell
- Create backend shell
- Add database
- Create first tables
- Add seed data
- Build `/health`
- Build `/places`
- Build `/events`
- Build `/search`
- Build simple search UI

### Demo at end of sprint

A user can open the app, search for a vibe/category/neighborhood, and see matching places/events from seeded data.

---

## 13. Definition of done for MVP

The MVP is done when:

- A user can onboard with preferences
- A user can search by vibe, category, location, date, and price
- A user can view useful place/event detail pages
- A user can save places/events
- A user can see basic personalized recommendations
- A user can create a simple plan from saved/search results
- The app stores user behavior events
- The app has at least one background worker/job pattern
- The app does not rely on live external calls for every search

---

## 14. North-star technical principle

> Keep discovery fast, make enrichment async, and let user behavior improve the system over time.
