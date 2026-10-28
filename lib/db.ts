import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as typeof globalThis & { prisma: PrismaClient | undefined };

export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma !== undefined) {
    return globalForPrisma.prisma;
  }
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl() }) });
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
