import type { Event } from "./event";
import type { Place } from "./place";

/**
 * Why a result was ranked where it was. Surfaced to the user as
 * explanation chips ("matches your love of Afrobeats", "in Logan Square").
 *
 * `factor` is a closed union so the UI can render per-factor icons
 * without a fallback case for unknown values.
 */
export type MatchFactor =
  | "vibe"
  | "music"
  | "category"
  | "neighborhood"
  | "price"
  | "time"
  | "group"
  | "popularity";

export interface MatchReason {
  factor: MatchFactor;
  detail: string;
  /** Contribution to the final score. Sum of `weight` across reasons = score. */
  weight: number;
}

/**
 * Discriminated union on `itemType` so consumers can narrow:
 *   if (result.itemType === "place") { result.item.priceLevel ... }
 * Cleaner than a generic with a separate `itemType` tag.
 */
export type ScoredResult =
  | {
      itemType: "place";
      item: Place;
      score: number;
      reasons: MatchReason[];
    }
  | {
      itemType: "event";
      item: Event;
      score: number;
      reasons: MatchReason[];
    };

/**
 * The full response from `/api/search`. Wraps the results with the
 * `ParsedIntent` so the frontend can render "we interpreted your search as ..."
 * and let the user correct it.
 */
export interface SearchResponse {
  results: ScoredResult[];
  intent: import("./intent").ParsedIntent;
  totalCount: number;
}
