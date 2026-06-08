import { prisma } from "@moves/db";
import type { SearchQuery, SearchResponse } from "@moves/shared";
import { scoreResults } from "@/lib/recommendations/scoreResults";
import { buildPlaceWhere } from "./buildPlaceWhere";
import { mapDbPlace } from "./mapDbPlace";
import { queryToIntent } from "./queryToIntent";

/**
 * Given a SearchQuery, give me a SearchResponse.
 *
 * Step 5 plugs the real scorer between the DB query and the response.
 * Order of operations:
 *   1. Build a Prisma WHERE from the query
 *   2. Fetch all matching rows (up to a safety cap)
 *   3. Map DB rows → shared Place
 *   4. Translate query → ParsedIntent (step 6 makes this an LLM call)
 *   5. Score and sort
 *   6. Trim to the page
 *
 * The DB still does the *filtering* — Postgres + GIN indexes are way better
 * at that than we are. Scoring stays in-process because our weights aren't
 * something the DB can know about.
 */

const PAGE_CAP = 50;

/**
 * Hard cap on candidates we'll score in-memory. Above this, scoring needs
 * to move into a materialized column or a search index — but we won't see
 * that pressure for thousands of rows.
 */
const SAFETY_CAP = 500;

export async function searchPlaces(
  query: SearchQuery,
): Promise<SearchResponse> {
  const where = buildPlaceWhere(query);

  const [rows, totalCount] = await Promise.all([
    prisma.place.findMany({ where, take: SAFETY_CAP }),
    prisma.place.count({ where }),
  ]);

  const intent = queryToIntent(query);
  const places = rows.map(mapDbPlace);
  const ranked = scoreResults(intent, places);
  const results = ranked.slice(0, PAGE_CAP);

  return { results, intent, totalCount };
}
