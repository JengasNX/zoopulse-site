import "server-only";
import { Pool, type PoolClient } from "pg";

let pool: Pool | undefined;

// Not imported by public demo pages. Credentials never use NEXT_PUBLIC_*.
function getPool() {
  if (process.env.GITHUB_PAGES === "true") throw new Error("Database unavailable in static demo");
  if (!process.env.DATABASE_URL) throw new Error("Server database is not configured");
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      statement_timeout: 10000,
      application_name: "zoopulse",
    });
    pool.on("error", () => console.error("Database idle connection failed"));
  }
  return pool;
}

export async function withTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  let discardConnection: Error | undefined;
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      discardConnection = new Error("Database rollback failed");
    }
    throw error;
  } finally {
    client.release(discardConnection);
  }
}
