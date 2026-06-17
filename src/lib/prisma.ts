import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// ─── Prisma Client Singleton ───────────────────────────────
// Lazy initialization — only connects when db is actually used.
// Prevents crashes during module load if DATABASE_URL is not set.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDbClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
      "Add it to your Vercel Environment Variables or .env.local file."
    );
  }

  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 10000,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });
  const adapter = new PrismaPg(pool);

  const client = new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

// Lazy proxy — db.user.findMany() etc. only triggers connection on first use
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getDbClient();
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
