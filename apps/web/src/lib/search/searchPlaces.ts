import type {
  ParsedIntent,
  ScoredResult,
  SearchQuery,
  SearchResponse,
} from "@moves/shared";
import { MOCK_PLACES } from "@/data/mockPlaces";
import { filterPlaces } from "./filterPlaces";

/**
 * The single entry point for "given a SearchQuery, give me a SearchResponse."
 * Used by `/api/search` and by the server-rendered `/search` page. Lets the
 * page render results without fetching its own API over HTTP.
 *
 * What's stubbed here, what's real:
 *   - `intent` mirrors the query 1:1 — step 6's LLM parser will produce a
 *     richer intent when `q` is set, distinct from the raw query.
 *   - every ScoredResult has score 0 and reasons [] — step 5's scorer fills
 *     these in. The wrapping stays; only the values change.
 */

const PAGE_CAP = 50;

export function searchPlaces(query: SearchQuery): SearchResponse {
  const matched = filterPlaces(query, MOCK_PLACES);
  const limited = matched.slice(0, PAGE_CAP);

  const results: ScoredResult[] = limited.map((place) => ({
    itemType: "place",
    item: place,
    score: 0,
    reasons: [],
  }));

  const intent: ParsedIntent = {
    rawQuery: query.q ?? "",
    vibes: query.vibes,
    musicStyles: query.musicStyles,
    categories: query.categories,
    neighborhoods: query.neighborhoods,
    pricePreference: query.pricePreference,
  };

  return {
    results,
    intent,
    totalCount: matched.length,
  };
}
