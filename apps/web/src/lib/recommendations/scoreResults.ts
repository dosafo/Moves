import type { ParsedIntent, Place, ScoredResult } from "@moves/shared";
import { scorePlace } from "./scorePlace";

/**
 * Score every candidate Place and return a sorted ScoredResult[].
 *
 * Pure: takes filtered candidates in, returns ranked results out. The DB
 * has already done filtering via `buildPlaceWhere` — here we apply the
 * domain-specific weights Postgres doesn't know.
 *
 * In-memory sort is fine while the catalog fits comfortably in memory.
 * When we outgrow it, the move is either a materialized score column
 * (refresh in the background worker) or hand the ranking to a search
 * index. The signature stays the same.
 */
export function scoreResults(
  intent: ParsedIntent,
  places: readonly Place[],
): ScoredResult[] {
  return places
    .map((place): ScoredResult => {
      const { score, reasons } = scorePlace(intent, place);
      return {
        itemType: "place",
        item: place,
        score,
        reasons,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Stable, deterministic tie-break. When events join the union,
      // the comparator gains a per-type name accessor.
      if (a.itemType === "place" && b.itemType === "place") {
        return a.item.name.localeCompare(b.item.name);
      }
      return 0;
    });
}
