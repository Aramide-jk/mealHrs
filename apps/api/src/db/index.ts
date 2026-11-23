import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";
import * as schema from "./schema";
import path from "node:path";

const { Pool } = pg;

let cachedDb: any = null;
let underlyingPglite: PGlite | null = null;

export function getDb() {
  if (cachedDb) return cachedDb;

  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl && !dbUrl.includes("localhost:5432/postgres")) {
    const pool = new Pool({ connectionString: dbUrl });
    cachedDb = drizzlePg(pool, { schema });
    return cachedDb;
  }

  // Use embedded PostgreSQL engine for reliable zero-dependency local dev/tests
  // In tests, use memory-isolated PGlite to prevent disk-lock contention across parallel test workers
  if (process.env.NODE_ENV === "test") {
    underlyingPglite = new PGlite();
  } else {
    const dataDir = path.resolve(process.cwd(), ".pgdata");
    underlyingPglite = new PGlite(dataDir);
  }
  cachedDb = drizzlePglite(underlyingPglite, { schema });
  return cachedDb;
}

export function getUnderlyingPglite(): PGlite | null {
  return underlyingPglite;
}

export * from "./schema";
