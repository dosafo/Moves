import {
  CATEGORIES,
  MUSIC_STYLES,
  NEIGHBORHOODS,
  VIBES,
  type Category,
  type MusicStyle,
  type Neighborhood,
  type PricePreference,
  type SearchQuery,
  type Vibe,
} from "@moves/shared";

/**
 * Turn untrusted URL params into a validated `SearchQuery`. Used by both
 * `/api/search` (gets a `URLSearchParams` from `request.url`) and the
 * server-rendered `/search` page (converts its `searchParams` prop first).
 *
 * Invalid values are silently dropped, not rejected — the URL is untrusted
 * input and we'd rather show partial results than 400 on a typo.
 */

const PRICE_PREFERENCES = [
  "free",
  "cheap",
  "moderate",
  "splurge",
  "any",
] as const satisfies readonly PricePreference[];

function isVibe(s: string): s is Vibe {
  return (VIBES as readonly string[]).includes(s);
}
function isMusicStyle(s: string): s is MusicStyle {
  return (MUSIC_STYLES as readonly string[]).includes(s);
}
function isCategory(s: string): s is Category {
  return (CATEGORIES as readonly string[]).includes(s);
}
function isNeighborhood(s: string): s is Neighborhood {
  return (NEIGHBORHOODS as readonly string[]).includes(s);
}
function isPricePreference(s: string): s is PricePreference {
  return (PRICE_PREFERENCES as readonly string[]).includes(s);
}

export function parseSearchQuery(params: URLSearchParams): SearchQuery {
  const rawQ = params.get("q");
  const q =
    rawQ !== null && rawQ.trim() !== "" ? rawQ.trim() : undefined;

  const vibes = params.getAll("vibe").filter(isVibe);
  const musicStyles = params.getAll("music").filter(isMusicStyle);
  const categories = params.getAll("category").filter(isCategory);
  const neighborhoods = params.getAll("neighborhood").filter(isNeighborhood);

  const rawPrice = params.get("pricePreference");
  const pricePreference =
    rawPrice !== null && isPricePreference(rawPrice) ? rawPrice : undefined;

  return {
    q,
    vibes,
    musicStyles,
    categories,
    neighborhoods,
    pricePreference,
  };
}

/**
 * Adapter for Next.js page props. `searchParams` on a Page is delivered as
 * `Record<string, string | string[] | undefined>`, not `URLSearchParams`.
 * Normalize so `parseSearchQuery` only ever has one input shape.
 */
export function searchParamsToURLSearchParams(
  input: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const out = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) out.append(key, v);
    } else {
      out.append(key, value);
    }
  }
  return out;
}
