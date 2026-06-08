import type { Category } from "../constants/categories";
import type { MusicStyle } from "../constants/music";
import type { Neighborhood } from "../constants/neighborhoods";
import type { Vibe } from "../constants/vibes";
import type { PricePreference, Timeframe } from "./intent";

/**
 * What `/api/search` accepts. Two entry points:
 *   - `q`: free-text NL search (goes through the LLM parser)
 *   - the structured fields: bypass the LLM, used by filter UI
 *
 * Both routes converge on the same `ParsedIntent` before scoring.
 */
export interface SearchQuery {
  q?: string;

  vibes?: Vibe[];
  musicStyles?: MusicStyle[];
  categories?: Category[];
  neighborhoods?: Neighborhood[];
  pricePreference?: PricePreference;
  timeframe?: Timeframe;

  /** Pagination. Default page size lives in the API handler, not here. */
  page?: number;
  pageSize?: number;
}
