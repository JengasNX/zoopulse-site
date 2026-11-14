import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";

export async function loadMigrations(directory = new URL("./migrations/", import.meta.url)) {
  const names = (await readdir(directory)).filter(name => name.endsWith(".sql")).sort();
  if (!names.length || names.some(name => !/^\d{3}_[a-z0-9_]+\.sql$/.test(name))) {
    throw new Error("Invalid migration filenames");
  }
  if (new Set(names.map(name => name.slice(0, 3))).size !== names.length) {
    throw new Error("Duplicate migration number");
  }
  return Promise.all(names.map(async name => {
    const sql = await readFile(new URL(name, directory), "utf8");
    return { name, sql, checksum: createHash("sha256").update(sql.replace(/\r\n/g, "\n")).digest("hex") };
  }));
}

// Adapter: query(text, parameters?) and exec(text). Caller must hold an exclusive
// migration lock on a dedicated connection. SQL files must NOT contain outer
// transaction commands; the runner owns the journal + DDL transaction.
export async function migrate(database, migrations) {
  await database.exec(`CREATE TABLE IF NOT EXISTS schema_migration (
    name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now()
  )`);
  const { rows } = await database.query("SELECT name, checksum FROM schema_migration ORDER BY name");
  if (rows.some((row, index) => row.name !== migrations[index]?.name || row.checksum !== migrations[index]?.checksum)) {
    throw new Error("Migration history differs from source; refusing to continue");
  }
  const applied = [];
  for (const migration of migrations.slice(rows.length)) {
    await database.exec("BEGIN");
    try {
      await database.exec(migration.sql);
      await database.query("INSERT INTO schema_migration (name, checksum) VALUES ($1, $2)", [migration.name, migration.checksum]);
      await database.exec("COMMIT");
      applied.push(migration.name);
    } catch (error) {
      await database.exec("ROLLBACK");
      throw error;
    }
  }
  return applied;
}
