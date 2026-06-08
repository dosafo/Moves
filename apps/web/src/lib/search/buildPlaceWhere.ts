import { Prisma } from "@moves/db";
import type {
  PriceLevel,
  PricePreference,
  SearchQuery,
} from "@moves/shared";

/**
 * Translate a `SearchQuery` into a Prisma `PlaceWhereInput`.
 *
 * Replaces the in-memory `filterPlaces` from step 3. Same semantics
 * (AND across fields, OR within multi-value fields, missing = skip) but
 * now expressed as a database condition so we can scale beyond 15 rows
 * and use the GIN indexes on `vibes` / `musicStyles`.
 *
 * Kept pure: takes a query, returns a plain object. Trivially unit-testable
 * without touching the DB.
 */

const PRICE_PREFERENCE_TO_LEVELS: Record<PricePreference, readonly PriceLevel[]> = {
  free: [1],
  cheap: [1, 2],
  moderate: [2, 3],
  splurge: [3, 4],
  any: [1, 2, 3, 4],
};

export function buildPlaceWhere(query: SearchQuery): Prisma.PlaceWhereInput {
  const ands: Prisma.PlaceWhereInput[] = [];

  if (query.q && query.q.trim() !== "") {
    const needle = query.q.trim();
    ands.push({
      OR: [
        { name: { contains: needle, mode: "insensitive" } },
        { description: { contains: needle, mode: "insensitive" } },
      ],
    });
  }

  if (query.vibes && query.vibes.length > 0) {
    ands.push({ vibes: { hasSome: [...query.vibes] } });
  }

  if (query.musicStyles && query.musicStyles.length > 0) {
    ands.push({ musicStyles: { hasSome: [...query.musicStyles] } });
  }

  if (query.categories && query.categories.length > 0) {
    ands.push({ category: { in: [...query.categories] } });
  }

  if (query.neighborhoods && query.neighborhoods.length > 0) {
    ands.push({ neighborhood: { in: [...query.neighborhoods] } });
  }

  if (query.pricePreference && query.pricePreference !== "any") {
    const allowed = PRICE_PREFERENCE_TO_LEVELS[query.pricePreference];
    ands.push({ priceLevel: { in: [...allowed] } });
  }

  return ands.length === 0 ? {} : { AND: ands };
}
