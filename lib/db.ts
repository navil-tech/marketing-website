import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const CONNECTION_TIMEOUT_MS = 3_000;

const STATEMENT_TIMEOUT_MS = 5_000;

const globalForPrisma = globalThis as typeof globalThis & { prisma: PrismaClient | undefined };

export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma !== undefined) {
    return globalForPrisma.prisma;
  }
  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: databaseUrl(),
      connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
      statement_timeout: STATEMENT_TIMEOUT_MS,
    }),
  });
  globalForPrisma.prisma = prisma;
  return prisma;
}

function databaseUrl(): string {
  const url = process.env["DATABASE_URL"];
  if (url === undefined || url === "") {
    throw new Error("DATABASE_URL is not set");
  }
  return url;
}
