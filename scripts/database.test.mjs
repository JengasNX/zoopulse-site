import test from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { loadMigrations, migrate } from "../db/migrate.mjs";

test("PostgreSQL schema, history and tenant integrity", async t => {
  const db = new PGlite();
  try {
    const migrations = await loadMigrations();
    await t.test("apply both migrations and keep an idempotent journal", async () => {
      assert.deepEqual(await migrate(db, migrations), migrations.map(m => m.name));
      assert.deepEqual(await migrate(db, migrations), []);
    });
    await t.test("reject changed, missing and out-of-order history", async () => {
      await assert.rejects(migrate(db, [{ ...migrations[0], checksum: "changed" }, ...migrations.slice(1)]), /history/);
      await assert.rejects(migrate(db, migrations.slice(1)), /history/);
    });
    const user = (await db.query("INSERT INTO app_user(email, display_name) VALUES ('owner@example.invalid','Owner') RETURNING id")).rows[0].id;
    const otherUser = (await db.query("INSERT INTO app_user(email, display_name) VALUES ('other@example.invalid','Other') RETURNING id")).rows[0].id;
    const org = (await db.query("INSERT INTO organization(name, kind, city, created_by) VALUES ('Test shelter','shelter','Test',$1) RETURNING id", [user])).rows[0].id;
    const otherOrg = (await db.query("INSERT INTO organization(name, kind, city, created_by) VALUES ('Other shelter','shelter','Test',$1) RETURNING id", [otherUser])).rows[0].id;
    const animal = (await db.query("INSERT INTO animal(organization_id,name,species,description) VALUES ($1,'Test animal','dog','Test only') RETURNING id", [org])).rows[0].id;

    await t.test("unknown health data remains NULL, not false", async () => {
      const row = (await db.query("SELECT vaccinated, sterilized FROM animal WHERE id=$1", [animal])).rows[0];
      assert.deepEqual(row, { vaccinated: null, sterilized: null });
    });
    await t.test("email uniqueness ignores case", async () => {
      await assert.rejects(db.query("INSERT INTO app_user(email, display_name) VALUES ('OWNER@example.invalid','Duplicate')"), e => e.code === "23505");
    });
    await t.test("reject an image attached across organizations", async () => {
      const sql = "INSERT INTO asset(organization_id,animal_id,storage_key,mime_type,byte_size,width,height,alt_text,license_note) VALUES ($1,$2,$3,'image/webp',100,10,10,'Test photo','Test license')";
      await assert.rejects(db.query(sql, [otherOrg, animal, "cross-tenant"]), e => e.code === "23503");
      await db.query(sql, [org, animal, "same-tenant"]);
    });
    const requestKey = "00000000-0000-4000-8000-000000000001";
    const requestSQL = "INSERT INTO adoption_request(animal_id,applicant_id,contact_name,contact_phone,idempotency_key) VALUES ($1,$2,'Test applicant','0000000000',$3) RETURNING id";
    const request = (await db.query(requestSQL, [animal, otherUser, requestKey])).rows[0].id;
    await t.test("reject duplicate request keys for one applicant", async () => {
      await assert.rejects(db.query(requestSQL, [animal, otherUser, requestKey]), e => e.code === "23505");
    });
    await t.test("consent must match the request applicant", async () => {
      const sql = "INSERT INTO consent_record(user_id,request_id,purpose,document_version) VALUES ($1,$2,'adoption','draft-test')";
      await assert.rejects(db.query(sql, [user, request]), e => e.code === "23503");
      await db.query(sql, [otherUser, request]);
    });
    await t.test("reject empty names, invalid status and out-of-range age", async () => {
      await assert.rejects(db.query("UPDATE animal SET name='  ' WHERE id=$1", [animal]), e => e.code === "23514");
      await assert.rejects(db.query("UPDATE animal SET status='unknown' WHERE id=$1", [animal]), e => e.code === "23514");
      await assert.rejects(db.query("UPDATE animal SET age_months=-1 WHERE id=$1", [animal]), e => e.code === "23514");
    });
    await t.test("updated_at is maintained by the database", async () => {
      const row = (await db.query("UPDATE animal SET updated_at='2000-01-01' WHERE id=$1 RETURNING updated_at", [animal])).rows[0];
      assert.ok(new Date(row.updated_at).getFullYear() > 2000);
    });
    await t.test("failed migration rolls back DDL and journal together", async () => {
      await assert.rejects(migrate(db, [...migrations, {
        name: "003_failure.sql", checksum: "test-only",
        sql: "CREATE TABLE must_rollback(id integer); INSERT INTO table_does_not_exist VALUES (1);",
      }]));
      assert.equal((await db.query("SELECT to_regclass('must_rollback') AS name")).rows[0].name, null);
      assert.equal((await db.query("SELECT count(*)::int AS count FROM schema_migration")).rows[0].count, migrations.length);
    });
  } finally {
    await db.close();
  }
});
