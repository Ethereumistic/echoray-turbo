import 'server-only';

import { PrismaClient } from '@prisma/client';
import { env } from '@repo/env';

declare global {
  var cachedPrisma: PrismaClient | undefined;
}

// Initialize PrismaClient
export const database = 
  global.cachedPrisma || 
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// Cache the PrismaClient in development to prevent too many connections
if (env.NODE_ENV !== "production") {
  global.cachedPrisma = database;
}

export * from '@prisma/client'