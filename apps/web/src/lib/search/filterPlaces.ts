import type {
  Place,
  PriceLevel,
  PricePreference,
  SearchQuery,
} from "@moves/shared";

/**
 * Pure include/exclude filter — no ranking, no I/O. Step 5 introduces a
 * scorer that runs *after* this and orders the survivors.
 *
 * Match rules:
 *   - AND across different fields    (vibe AND neighborhood AND price)
 *   - OR within a single multi-value field  (vibe ∈ {energetic, social})
 *   - missing or empty field on the query = "user didn't care", skip filter
 *   - empty array on a Place = that Place has no signal there; it will NOT
 *     match a query that filters on it
 */

/**
 * Encodes the only opinion in this file: what coarse human budget buckets
 * mean against the numeric `PriceLevel`. The LLM parser will emit one of
 * these; the scorer reads them through this same table.
 */
const PRICE_PREFERENCE_TO_LEVELS: Record<PricePreference, readonly PriceLevel[]> = {
  free: [1],
  cheap: [1, 2],
  moderate: [2, 3],
  splurge: [3, 4],
  any: [1, 2, 3, 4],
};

export function filterPlaces(
  query: SearchQuery,
  places: readonly Place[],
): Place[] {
  let result: Place[] = [...places];

  if (query.q !== undefined && query.q.trim() !== "") {
    const needle = query.q.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.description.toLowerCase().includes(needle),
    );
  }

  if (query.vibes && query.vibes.length > 0) {
    const wanted = query.vibes;
    result = result.filter((p) => intersects(p.vibes, wanted));
  }

  if (query.musicStyles && query.musicStyles.length > 0) {
    const wanted = query.musicStyles;
    result = result.filter((p) => intersects(p.musicStyles, wanted));
  }

  if (query.categories && query.categories.length > 0) {
    const wanted = query.categories;
    result = result.filter((p) => wanted.includes(p.category));
  }

  if (query.neighborhoods && query.neighborhoods.length > 0) {
    const wanted = query.neighborhoods;
    result = result.filter((p) => wanted.includes(p.neighborhood));
  }

  if (query.pricePreference && query.pricePreference !== "any") {
    const allowed = PRICE_PREFERENCE_TO_LEVELS[query.pricePreference];
    result = result.filter((p) => allowed.includes(p.priceLevel));
  }

  return result;
}

function intersects<T>(a: readonly T[], b: readonly T[]): boolean {
  return a.some((x) => b.includes(x));
}
