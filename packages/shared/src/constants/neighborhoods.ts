/**
 * Chicago neighborhoods for MVP. The README says start with Chicago — when
 * we expand cities we'll generalize this into `{ city, neighborhood }` pairs
 * or pull from a geo source. For now a flat list keeps types simple.
 */
export const NEIGHBORHOODS = [
  "Logan Square",
  "Wicker Park",
  "West Loop",
  "River North",
  "Pilsen",
  "Hyde Park",
  "Lincoln Park",
  "Lakeview",
  "Andersonville",
  "Bucktown",
  "Fulton Market",
  "South Loop",
  "Uptown",
] as const;

export type Neighborhood = (typeof NEIGHBORHOODS)[number];
