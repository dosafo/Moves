/**
 * Vibes describe the *feel* of a place or event — the thing users actually
 * search for ("chill date spot", "energetic dance floor").
 *
 * Kept short and curated on purpose: a fixed taxonomy is easier to score
 * against, easier to display in UI, and easier for the LLM intent parser to
 * target. Expand only when a vibe is genuinely missing — overlap kills ranking.
 */
export const VIBES = [
  "chill",
  "lowkey",
  "energetic",
  "social",
  "romantic",
  "lounge",
  "dancing",
  "upscale",
  "divey",
  "outdoorsy",
  "intimate",
  "loud",
  "quiet",
] as const;

export type Vibe = (typeof VIBES)[number];
