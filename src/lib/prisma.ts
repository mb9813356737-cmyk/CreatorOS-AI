import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// ─── Prisma Client Singleton ───────────────────────────────
// IMPORTANT: On Vercel (serverless), each cold start is a fresh Node process.
// We must cache the PrismaClient on `globalThis` so that warm invocations
// reuse the same pool instead of opening new Postgres connections on every
// request (which exhausts Supabase/PgBouncer limits and causes timeouts).

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createDbClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "[Prisma] DATABASE_URL is not set. " +
      "Add it to Vercel → Settings → Environment Variables, then redeploy."
    );
  }

  console.log("[Prisma] Creating new PrismaClient (cold start or first use)");

  // Use a conservative pool size for serverless — Vercel functions are
  // short-lived and run in parallel, so we intentionally limit connections.
  const pool = new Pool({
    connectionString,
    max: 1,                          // 1 connection per serverless function instance
    connectionTimeoutMillis: 8000,   // fail fast before Vercel's 10s limit
    idleTimeoutMillis: 30000,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

  // Surface the real Postgres error immediately in Vercel runtime logs
  pool.on("error", (err) => {
    console.error("[Prisma Pool] Unexpected idle client error:", err.message, err.stack);
  });

  pool.on("connect", () => {
    console.log("[Prisma Pool] New client connected to Postgres");
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
  });
}

function getDbClient(): PrismaClient {
  // Always cache on globalThis — in production this persists across warm
  // invocations within the same Vercel function instance.
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createDbClient();
  }
  return globalForPrisma.prisma;
}

// Lazy proxy — db.user.findMany() etc. only triggers client creation on first use
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getDbClient();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
