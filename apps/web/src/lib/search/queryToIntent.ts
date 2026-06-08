import type { ParsedIntent, SearchQuery } from "@moves/shared";

/**
 * Convert a structured `SearchQuery` into the `ParsedIntent` the scorer
 * consumes. Trivial today — fields map 1:1.
 *
 * Step 6 promotes this to async and adds LLM parsing of `query.q`,
 * merging extracted tags with explicitly-passed structured filters. The
 * SearchResponse contract doesn't change; only this file does.
 */
export function queryToIntent(query: SearchQuery): ParsedIntent {
  return {
    rawQuery: query.q ?? "",
    vibes: query.vibes,
    musicStyles: query.musicStyles,
    categories: query.categories,
    neighborhoods: query.neighborhoods,
    pricePreference: query.pricePreference,
  };
}
