/* eslint-disable @typescript-eslint/dot-notation */

import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// =========================================================
// GLOBAL PRISMA SINGLETON
// =========================================================

// Hot-reload-safe singleton.
//
// In development, `tsx watch` reloads modules on every save.
// Without this guard, multiple PrismaClient instances would
// be created and eventually exhaust the DB connection pool.
//
// In production, exactly one PrismaClient is created.

const globalForPrisma = globalThis as unknown as {
  prismaInstance?: PrismaClient;
};

// =========================================================
// CREATE CLIENT
// =========================================================

const buildPrismaClient = (): PrismaClient => {
  const isProduction =
    process.env['NODE_ENV'] === 'production';

  // Prisma v7 client engine requires an explicit driver adapter.
  // PrismaBetterSqlite3 takes a config object { url } and opens the
  // Database connection internally.
  const dbUrl = process.env['DATABASE_URL'] ?? 'file:./dev.db';
  const adapter = new PrismaBetterSqlite3({ url: dbUrl });

  return new PrismaClient({
    adapter,
    log: isProduction
      ? ['warn', 'error']
      : ['warn', 'error'],

    errorFormat: isProduction
      ? 'minimal'
      : 'pretty',
  });
};

// =========================================================
// SINGLETON EXPORT
// =========================================================

export const prisma: PrismaClient =
  globalForPrisma.prismaInstance ??
  buildPrismaClient();

// Store instance globally in development only
if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prismaInstance = prisma;
}

// =========================================================
// DISCONNECT HELPER
// =========================================================

export const disconnectPrisma = async (): Promise<void> => {
  await prisma.$disconnect();
};

// =========================================================
// TYPES
// =========================================================

export type { PrismaClient } from '@prisma/client';