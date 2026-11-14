import test from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { getAuthTables } from "better-auth/db";
import { memoryAdapter } from "better-auth/adapters/memory";
import { randomBytes } from "node:crypto";
import { loadMigrations, migrate } from "../db/migrate.mjs";
import { createApp } from "../backend/app.ts";
import { createAuth } from "../backend/auth.ts";

const origin = "http://localhost:3004";
test("server routes enforce DAL authorization against PostgreSQL (session validator stub)", async t => {
  const db = new PGlite();
  try {
    await migrate(db, await loadMigrations());
    await db.query(`INSERT INTO auth_user (id,name,email,"emailVerified") VALUES
      ('owner-auth','Owner','owner@example.invalid',true),
      ('other-auth','Other','other@example.invalid',true),
      ('unverified-auth','Pending','pending@example.invalid',false)`);
    // Auth crypto/session behavior is tested separately in auth.test.mjs.
    const auth = {
      api: { getSession: async ({ headers }) => {
        const id = { owner: "owner-auth", other: "other-auth", unverified: "unverified-auth" }[headers.get("cookie")];
        return id ? { user: { id } } : null;
      } },
      handler: async request => new Response(request.headers.get("x-zoopulse-client-ip")),
    };
    const transaction = work => db.transaction(tx => work(tx));
    const app = createApp({ auth, database: db, transaction, origin, enabled: true, getClientIp: () => "127.0.0.1" });
    const request = (path, user, body, headers = {}) => app.request(`${origin}${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: { Origin: origin, Cookie: user ?? "", "Content-Type": "application/json", ...headers },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    let org;
    await t.test("no session is unauthorized; unverified actor is forbidden", async () => {
      assert.equal((await request("/api/me")).status, 401);
      assert.equal((await request("/api/me", "unverified")).status, 403);
      assert.equal((await request("/api/me", "owner")).status, 200);
    });
    await t.test("create draft, membership and audit atomically", async () => {
      const response = await request("/api/organizations", "owner", { name: "Test shelter", city: "Test", kind: "shelter" });
      assert.equal(response.status, 201);
      org = (await response.json()).organization;
      assert.equal(org.status, "draft");
      assert.equal((await db.query("SELECT role FROM organization_membership WHERE organization_id=$1", [org.id])).rows[0].role, "owner");
      assert.equal((await db.query("SELECT count(*)::int AS count FROM audit_event WHERE entity_id=$1", [org.id])).rows[0].count, 1);
    });
    await t.test("own draft readable; guest and other organization denied without existence leak", async () => {
      assert.equal((await request(`/api/organizations/${org.id}`, "owner")).status, 200);
      assert.equal((await request(`/api/organizations/${org.id}`, "other")).status, 404);
      assert.equal((await request(`/api/organizations/${org.id}`)).status, 404);
      assert.equal((await request("/api/organizations/not-a-uuid", "owner")).status, 404);
    });
    await t.test("client cannot choose role, owner or approved status", async () => {
      for (const key of ["role", "createdBy", "status", "id", "memberships"]) {
        assert.equal((await request("/api/organizations", "other", { name: "Injected", city: "Test", kind: "shelter", [key]: "admin" })).status, 400);
      }
      const identity = (await (await request("/api/me", "other")).json()).user;
      assert.equal(identity.role, "user");
      assert.deepEqual(Object.keys(identity).sort(), ["emailVerified", "id", "role"]);
    });
    await t.test("approved organization returns public DTO only", async () => {
      await db.query("UPDATE organization SET status='approved', public_email='public@example.invalid' WHERE id=$1", [org.id]);
      const response = await request(`/api/organizations/${org.id}`);
      assert.equal(response.status, 200);
      const dto = (await response.json()).organization;
      assert.deepEqual(Object.keys(dto).sort(), ["city", "description", "id", "kind", "name", "status"]);
      assert.equal(response.headers.get("Cache-Control"), "no-store");
    });
    await t.test("deleted user cannot act; verified email alone cannot take over an old business account", async () => {
      await db.query("UPDATE app_user SET deleted_at=now() WHERE auth_user_id='owner-auth'");
      assert.equal((await request("/api/me", "owner")).status, 403);
      assert.equal((await request("/api/organizations", "owner", { name: "Denied", city: "Test", kind: "shelter" })).status, 403);
      await db.query("INSERT INTO app_user(email,display_name) VALUES ('pending@example.invalid','Legacy')");
      await db.query(`UPDATE auth_user SET "emailVerified"=true WHERE id='unverified-auth'`);
      assert.equal((await request("/api/me", "unverified")).status, 403);
    });
    await t.test("CSRF, invalid JSON and oversized body rejected", async () => {
      assert.equal((await request("/api/organizations", "other", {}, { Origin: "https://attacker.invalid" })).status, 403);
      assert.equal((await app.request(`${origin}/api/organizations`, {
        method: "POST", headers: { Origin: origin, Cookie: "other", "Content-Type": "application/json" }, body: "{",
      })).status, 400);
      assert.equal((await request("/api/organizations", "other", { description: "x".repeat(21000) })).status, 413);
    });
    await t.test("client cannot spoof the IP used for auth rate limits", async () => {
      const response = await request("/api/auth/probe", "", undefined, { "x-zoopulse-client-ip": "evil", "x-forwarded-for": "evil" });
      assert.equal(await response.text(), "127.0.0.1");
    });
    await t.test("failure of audit rolls back organization and membership without leaking details", async () => {
      const before = (await db.query("SELECT count(*)::int AS count FROM organization")).rows[0].count;
      const failingApp = createApp({
        auth, database: db, origin, enabled: true, getClientIp: () => "127.0.0.1",
        transaction: work => db.transaction(tx => work({
          query: (sql, values) => {
            if (sql.includes("INSERT INTO audit_event")) throw new Error("private-test-value-must-not-leak");
            return tx.query(sql, values);
          },
        })),
      });
      const response = await failingApp.request(`${origin}/api/organizations`, {
        method: "POST", headers: { Origin: origin, Cookie: "other", "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Must roll back", kind: "shelter", city: "Test" }),
      });
      assert.equal(response.status, 500);
      assert.deepEqual(await response.json(), { error: "internal_error" });
      assert.equal((await db.query("SELECT count(*)::int AS count FROM organization")).rows[0].count, before);
      assert.equal((await db.query(`SELECT count(*)::int AS count FROM organization_membership m
        JOIN organization o ON o.id=m.organization_id WHERE o.name='Must roll back'`)).rows[0].count, 0);
    });
    await t.test("disabled service does not expose auth or private routes", async () => {
      const disabled = createApp({ database: db, transaction, origin, enabled: false, getClientIp: () => "unknown" });
      assert.equal((await disabled.request("/health")).status, 200);
      assert.equal((await disabled.request("/api/me")).status, 503);
      assert.equal((await disabled.request("/api/auth/get-session")).status, 503);
    });
    await t.test("committed auth schema contains every library-required column", async () => {
      const auth = createAuth({
        database: memoryAdapter({}), baseURL: origin, secret: randomBytes(48).toString("hex"),
        allowRegistration: false, sendMail: async () => {},
      });
      const tables = getAuthTables(auth.options);
      for (const table of Object.values(tables)) {
        const columns = (await db.query(`SELECT column_name FROM information_schema.columns
          WHERE table_schema='public' AND table_name=$1`, [table.modelName])).rows.map(row => row.column_name);
        assert.ok(columns.includes("id"), `${table.modelName}.id`);
        for (const [name, field] of Object.entries(table.fields)) {
          assert.ok(columns.includes(field.fieldName ?? name), `${table.modelName}.${name}`);
        }
      }
    });
  } finally { await db.close(); }
});
