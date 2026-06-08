import type { MatchReason, ParsedIntent, Place } from "@moves/shared";

/**
 * Pure, deterministic scoring of one Place against one ParsedIntent.
 *
 * Returns the total score and a list of `MatchReason`s — one per signal
 * that contributed. The same reasons are surfaced in the UI as
 * "why this matched" chips, so the user can read the ranking instead of
 * trusting a black box.
 *
 * Weights are intentionally simple integers. Tune by editing one constant
 * and re-running the tests; don't sprinkle scoring constants across the
 * codebase.
 *
 * Free-text `rawQuery` is deliberately not scored here. Step 6's LLM
 * intent parser will translate "afrobeats" into `musicStyles: ["afrobeats"]`,
 * and that structured signal will drive ranking. Until then, the DB-side
 * `q` filter already handles free-text matching.
 */
const WEIGHTS = {
  vibe: 3,
  music: 5,
  category: 2,
  neighborhood: 2,
  price: 1,
} as const;

export type Scored = {
  score: number;
  reasons: MatchReason[];
};

export function scorePlace(intent: ParsedIntent, place: Place): Scored {
  const reasons: MatchReason[] = [];

  for (const wanted of intent.vibes ?? []) {
    if (place.vibes.includes(wanted)) {
      reasons.push({
        factor: "vibe",
        detail: `${wanted} vibe`,
        weight: WEIGHTS.vibe,
      });
    }
  }

  for (const wanted of intent.musicStyles ?? []) {
    if (place.musicStyles.includes(wanted)) {
      reasons.push({
        factor: "music",
        detail: `plays ${wanted}`,
        weight: WEIGHTS.music,
      });
    }
  }

  if (intent.categories && intent.categories.includes(place.category)) {
    reasons.push({
      factor: "category",
      detail: place.category.replace(/-/g, " "),
      weight: WEIGHTS.category,
    });
  }

  if (intent.neighborhoods && intent.neighborhoods.includes(place.neighborhood)) {
    reasons.push({
      factor: "neighborhood",
      detail: `in ${place.neighborhood}`,
      weight: WEIGHTS.neighborhood,
    });
  }

  if (intent.pricePreference && intent.pricePreference !== "any") {
    reasons.push({
      factor: "price",
      detail: `fits ${intent.pricePreference}`,
      weight: WEIGHTS.price,
    });
  }

  const score = reasons.reduce((sum, r) => sum + r.weight, 0);
  return { score, reasons };
}
