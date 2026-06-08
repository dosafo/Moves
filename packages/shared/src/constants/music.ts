/**
 * Music styles users explicitly search by. Pulled from the user flows doc
 * (flow 31). Distinct from `Vibe` because music is a hard filter — if the
 * user wants Afrobeats, "energetic but plays house" isn't a substitute.
 */
export const MUSIC_STYLES = [
  "afrobeats",
  "house",
  "techno",
  "rnb",
  "hiphop",
  "latin",
  "reggaeton",
  "disco",
  "funk",
  "jazz",
  "live-band",
  "dj-mix",
  "top-40",
] as const;

export type MusicStyle = (typeof MUSIC_STYLES)[number];
