/**
 * Categories are *what* the place is, in the broadest sense. Mutually
 * exclusive within a single place (a venue is a bar OR a restaurant, not
 * both — overlap goes in `vibes` instead).
 */
export const CATEGORIES = [
  "bar",
  "club",
  "lounge",
  "restaurant",
  "cafe",
  "live-music-venue",
  "rooftop",
  "activity",
  "event-space",
] as const;

export type Category = (typeof CATEGORIES)[number];
