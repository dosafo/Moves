import type { Category } from "../constants/categories";
import type { MusicStyle } from "../constants/music";
import type { Neighborhood } from "../constants/neighborhoods";
import type { Vibe } from "../constants/vibes";

/**
 * Price level mirrors the universal $/$$/$$$/$$$$ convention. We use a
 * numeric literal type instead of a string union so it sorts/compares
 * naturally in the scoring engine.
 */
export type PriceLevel = 1 | 2 | 3 | 4;

/**
 * A venue in the catalog. This is the durable, slow-changing record —
 * events that happen *at* a place reference it by id (see Event).
 *
 * IDs are plain strings for now. If we ever start passing place ids and
 * event ids through the same functions and confusing them, we can promote
 * to branded types (`type PlaceId = string & { readonly brand: unique symbol }`).
 */
export interface Place {
  id: string;
  name: string;
  description: string;

  category: Category;
  neighborhood: Neighborhood;
  city: string;
  address: string;
  lat: number;
  lng: number;

  priceLevel: PriceLevel;

  /** Tags. Multiple allowed — a rooftop can be both "upscale" and "social". */
  vibes: Vibe[];

  /** Empty array means "no specific music identity" (e.g., a cafe). */
  musicStyles: MusicStyle[];

  websiteUrl?: string;
  photoUrls?: string[];

  /**
   * Where this record came from. Useful when we start ingesting from
   * Google Places / Foursquare and need to dedupe.
   */
  externalSource?: {
    source: "manual" | "google-places" | "foursquare";
    externalId: string;
  };
}
