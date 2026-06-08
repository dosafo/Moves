import { PrismaClient } from "@prisma/client";

/**
 * Cached singleton PrismaClient.
 *
 * Why: Next.js dev mode reloads modules on every change. A naive
 * `export const prisma = new PrismaClient()` would leak a new client
 * (and a new connection pool) on every reload until the process restarts.
 * Caching on `globalThis` survives module reload but stays scoped to one
 * Node process.
 *
 * In production we want a fresh client per process — no caching.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/** Re-exports so consumers don't depend on `@prisma/client` directly. */
export { Prisma } from "@prisma/client";
export type { Place as PlaceRow, Event as EventRow } from "@prisma/client";
