import { prisma } from "@moves/db";
import type {
  ParsedIntent,
  ScoredResult,
  SearchQuery,
  SearchResponse,
} from "@moves/shared";
import { buildPlaceWhere } from "./buildPlaceWhere";
import { mapDbPlace } from "./mapDbPlace";

/**
 * Single entry point for "given a SearchQuery, give me a SearchResponse."
 * Step 4 swapped the in-memory MOCK_PLACES filter for a real Prisma query;
 * the function's signature only changed from sync to async.
 *
 * What's still stubbed:
 *   - score 0 / reasons [] on every ScoredResult (step 5 fills these)
 *   - intent mirrors the query (step 6's LLM parser fills this when q is set)
 */

const PAGE_CAP = 50;

export async function searchPlaces(
  query: SearchQuery,
): Promise<SearchResponse> {
  const where = buildPlaceWhere(query);

  const [rows, totalCount] = await Promise.all([
    prisma.place.findMany({
      where,
      take: PAGE_CAP,
      orderBy: { name: "asc" },
    }),
    prisma.place.count({ where }),
  ]);

  const results: ScoredResult[] = rows.map((row) => ({
    itemType: "place",
    item: mapDbPlace(row),
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

  return { results, intent, totalCount };
}
