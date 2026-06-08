import type { Category } from "../constants/categories";
import type { MusicStyle } from "../constants/music";
import type { Neighborhood } from "../constants/neighborhoods";
import type { Vibe } from "../constants/vibes";

/**
 * Coarse-grained budget buckets. We deliberately don't take a raw dollar
 * amount from the LLM — humans say "cheap" or "not too expensive" more
 * often than "$40". The scorer maps these to `PriceLevel` ranges.
 */
export type PricePreference =
  | "free"
  | "cheap"
  | "moderate"
  | "splurge"
  | "any";

/**
 * Group context affects ranking (a club is great for "small-group", awful
 * for "date"). Comes from onboarding or per-query LLM extraction.
 */
export type GroupContext =
  | "solo"
  | "date"
  | "small-group"
  | "large-group";

/**
 * When the user wants to go out. Either a named bucket the scorer knows
 * how to interpret against "now", or an explicit window the caller has
 * already resolved.
 */
export type Timeframe =
  | { kind: "tonight" }
  | { kind: "tomorrow" }
  | { kind: "this-weekend" }
  | { kind: "next-weekend" }
  | { kind: "specific-date"; date: string /* YYYY-MM-DD */ }
  | { kind: "window"; startsAt: string; endsAt: string /* ISO 8601 */ };

/**
 * THE central contract of this codebase.
 *
 * The LLM intent parser produces a `ParsedIntent`. The deterministic
 * recommendation engine consumes it. As long as both sides agree on this
 * shape, we can swap LLMs, add a manual filter UI that builds one of
 * these directly, or A/B test parsers — without touching scoring.
 *
 * Every field is optional except `rawQuery`. The LLM should only fill in
 * fields it's confident about; the scorer treats absent fields as
 * "user didn't care".
 */
export interface ParsedIntent {
  /** The original NL string. Kept for logging, debugging, and explanations. */
  rawQuery: string;

  vibes?: Vibe[];
  musicStyles?: MusicStyle[];
  categories?: Category[];
  neighborhoods?: Neighborhood[];

  pricePreference?: PricePreference;
  timeframe?: Timeframe;
  groupContext?: GroupContext;

  /**
   * Free-text leftovers the parser couldn't structure. Useful as a fallback
   * for keyword search and for debugging parser gaps.
   */
  freeTextResidue?: string;
}
