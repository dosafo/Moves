import { PrismaClient } from "@prisma/client";
import type { Place } from "@moves/shared";
import { SEED_PLACES } from "./seedData";

/**
 * Idempotent catalog seed. Upserts each curated Place by id so re-running
 * is safe and edits to seedData.ts propagate to the DB on next run.
 *
 * The shared `Place` shape and the DB row shape don't match 1:1
 * (`externalSource` is a nested object in shared, two flat columns in DB) —
 * the small shaper at the bottom encapsulates the difference so the upsert
 * call stays readable.
 */
const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log(`Seeding ${SEED_PLACES.length} places...`);

  for (const place of SEED_PLACES) {
    const data = toRow(place);
    await prisma.place.upsert({
      where: { id: place.id },
      create: { id: place.id, ...data },
      update: data,
    });
  }

  const total = await prisma.place.count();
  console.log(`Done. ${total} places in DB.`);
}

function toRow(place: Place) {
  return {
    name: place.name,
    description: place.description,
    category: place.category,
    neighborhood: place.neighborhood,
    city: place.city,
    address: place.address,
    lat: place.lat,
    lng: place.lng,
    priceLevel: place.priceLevel,
    vibes: [...place.vibes],
    musicStyles: [...place.musicStyles],
    websiteUrl: place.websiteUrl ?? null,
    photoUrls: place.photoUrls ?? [],
    externalSource: place.externalSource?.source ?? null,
    externalId: place.externalSource?.externalId ?? null,
  };
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
