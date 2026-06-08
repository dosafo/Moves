import type { MusicStyle } from "../constants/music";
import type { Vibe } from "../constants/vibes";

/**
 * A time-bounded happening at a Place. We store times as ISO 8601 strings
 * rather than Date objects because:
 *   - they survive JSON serialization (API responses, DB columns)
 *   - they're timezone-explicit when stored with offsets
 * Convert to Date at the edges that need date math.
 */
export interface Event {
  id: string;
  placeId: string;

  title: string;
  description: string;

  /** ISO 8601, e.g. "2026-06-14T22:00:00-05:00" */
  startTime: string;
  endTime: string;

  /** Cover/ticket price range in USD. Both optional because many events are free. */
  priceMin?: number;
  priceMax?: number;

  vibes: Vibe[];
  musicStyles: MusicStyle[];

  ticketUrl?: string;

  externalSource?: {
    source: "manual" | "eventbrite" | "ticketmaster" | "resident-advisor";
    externalId: string;
  };
}
