import type { PlaceRow } from "@moves/db";
import {
  CATEGORIES,
  MUSIC_STYLES,
  NEIGHBORHOODS,
  VIBES,
  type Category,
  type MusicStyle,
  type Neighborhood,
  type Place,
  type PriceLevel,
  type Vibe,
} from "@moves/shared";

/**
 * DB row → shared `Place`. The two shapes differ in three ways:
 *   1. DB columns are scalar `string` / `int` — shared types are unions
 *   2. DB has `externalSource` + `externalId` as flat columns; shared
 *      wraps them in a nested object
 *   3. DB carries `createdAt` / `updatedAt`; shared doesn't expose those
 *
 * Trust assumption: the seed inserts validated values. When external
 * ingestion arrives, we'll add a row-level validation pass *before* this
 * mapper runs. For now, defensive filters on the tag arrays (drop unknowns
 * silently) and hard throws on required-but-invalid scalars (fail loud).
 */

const VALID_SOURCES = ["manual", "google-places", "foursquare"] as const;
type ExternalSourceName = (typeof VALID_SOURCES)[number];

export function mapDbPlace(row: PlaceRow): Place {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: expectCategory(row.category, row.id),
    neighborhood: expectNeighborhood(row.neighborhood, row.id),
    city: row.city,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    priceLevel: expectPriceLevel(row.priceLevel, row.id),
    vibes: row.vibes.filter(isVibe),
    musicStyles: row.musicStyles.filter(isMusicStyle),
    websiteUrl: row.websiteUrl ?? undefined,
    photoUrls: row.photoUrls.length > 0 ? row.photoUrls : undefined,
    externalSource:
      row.externalSource && row.externalId && isExternalSource(row.externalSource)
        ? { source: row.externalSource, externalId: row.externalId }
        : undefined,
  };
}

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
function isPriceLevel(n: number): n is PriceLevel {
  return n === 1 || n === 2 || n === 3 || n === 4;
}
function isExternalSource(s: string): s is ExternalSourceName {
  return (VALID_SOURCES as readonly string[]).includes(s);
}

function expectCategory(s: string, id: string): Category {
  if (!isCategory(s)) throw new Error(`Place ${id} has unknown category "${s}"`);
  return s;
}
function expectNeighborhood(s: string, id: string): Neighborhood {
  if (!isNeighborhood(s)) {
    throw new Error(`Place ${id} has unknown neighborhood "${s}"`);
  }
  return s;
}
function expectPriceLevel(n: number, id: string): PriceLevel {
  if (!isPriceLevel(n)) {
    throw new Error(`Place ${id} has invalid priceLevel ${n}`);
  }
  return n;
}
