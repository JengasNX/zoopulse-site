import pg from "pg";
import { loadMigrations, migrate } from "../db/migrate.mjs";

// No default connection and no production inference from NODE_ENV.
if (!process.env.MIGRATION_DATABASE_URL || process.env.CONFIRM_DATABASE_MIGRATION !== "yes") {
  console.error("Set MIGRATION_DATABASE_URL and CONFIRM_DATABASE_MIGRATION=yes for the dedicated target database.");
  process.exitCode = 1;
} else {
  const client = new pg.Client({ connectionString: process.env.MIGRATION_DATABASE_URL, connectionTimeoutMillis: 10000 });
  let locked = false;
  try {
    await client.connect();
    const result = await client.query("SELECT pg_try_advisory_lock(726001, 1) AS locked");
    locked = result.rows[0].locked;
    if (!locked) throw new Error("Another migration is running");
    const applied = await migrate({
      query: (text, values) => client.query(text, values),
      exec: text => client.query(text),
    }, await loadMigrations());
    console.log(applied.length ? `Applied: ${applied.join(", ")}` : "Database is up to date.");
  } catch {
    // Driver messages can contain connection strings, SQL or sensitive values.
    console.error("Migration failed. Check the target, connection and migration history locally. No credentials logged.");
    process.exitCode = 1;
  } finally {
    if (locked) await client.query("SELECT pg_advisory_unlock(726001, 1)").catch(() => {});
    await client.end().catch(() => {});
  }
}
