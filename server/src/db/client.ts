import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema";

// In-memory for tests; persisted to a directory in production (PGLITE_DATA).
const dataDir = process.env.PGLITE_DATA;
const pg = new PGlite(dataDir);
export const db = drizzle(pg, { schema });

/** Idempotent schema bootstrap — runs the fixed DDL for the POC. */
export async function migrate(): Promise<void> {
  await pg.exec(`
    CREATE TABLE IF NOT EXISTS reservations (
      id text PRIMARY KEY,
      daybed_id text NOT NULL,
      name text NOT NULL,
      created_at timestamp NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS orders (
      id text PRIMARY KEY,
      daybed_id text NOT NULL,
      lines jsonb NOT NULL,
      total_chf integer NOT NULL,
      status text NOT NULL DEFAULT 'new',
      created_at timestamp NOT NULL DEFAULT now()
    );
  `);
}
