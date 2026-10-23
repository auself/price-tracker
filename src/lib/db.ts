import "server-only";

import { neon } from "@neondatabase/serverless";

/**
 * Return a Neon SQL client on the server.
 * Keep DATABASE_URL in server-side environment variables only.
 */
export function getDb() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured. Add the Neon connection string to the server environment.");
  }

  return neon(connectionString);
}
