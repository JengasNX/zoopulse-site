import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { Auth } from "./auth";
import { createOrganization, readOrganization, resolveActor, type Database, type Transaction } from "./dal";

export function createApp(options: {
  auth?: Auth;
  database: Database;
  transaction: Transaction;
  origin: string;
  enabled: boolean;
  getClientIp: (request: Request) => string;
}) {
  const app = new Hono();
  app.use("*", async (c, next) => {
    c.header("Cache-Control", "no-store");
    c.header("X-Content-Type-Options", "nosniff");
    c.header("Referrer-Policy", "no-referrer");
    // Never trust a client-supplied forwarded/IP header.
    c.req.raw.headers.set("x-zoopulse-client-ip", options.getClientIp(c.req.raw));
    if (!["GET", "HEAD", "OPTIONS"].includes(c.req.method) && c.req.header("Origin") !== options.origin) {
      return c.json({ error: "untrusted_origin" }, 403);
    }
    await next();
  });
  app.use("*", bodyLimit({ maxSize: 20 * 1024, onError: c => c.json({ error: "body_too_large" }, 413) }));
  app.get("/health", c => c.json({ status: "ok", authEnabled: options.enabled }));
  app.use("/api/*", async (c, next) => {
    if (!options.enabled || !options.auth) return c.json({ error: "backend_not_enabled" }, 503);
    await next();
  });
  app.on(["GET", "POST"], "/api/auth/*", c => options.auth!.handler(c.req.raw));
  app.get("/api/me", async c => {
    const session = await options.auth!.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json({ error: "unauthorized" }, 401);
    const actor = await resolveActor(options.database, session.user.id);
    if (!actor) return c.json({ error: "forbidden" }, 403);
    return c.json({ user: { id: actor.id, role: actor.role, emailVerified: actor.emailVerified } });
  });
  app.get("/api/organizations/:id", async c => {
    const id = c.req.param("id");
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return c.json({ error: "not_found" }, 404);
    const session = await options.auth!.api.getSession({ headers: c.req.raw.headers });
    const actor = session ? await resolveActor(options.database, session.user.id) : null;
    const organization = await readOrganization(options.database, actor, id);
    return organization ? c.json({ organization }) : c.json({ error: "not_found" }, 404);
  });
  app.post("/api/organizations", async c => {
    const session = await options.auth!.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json({ error: "unauthorized" }, 401);
    if (!c.req.header("Content-Type")?.startsWith("application/json")) return c.json({ error: "invalid_input" }, 400);
    let input: unknown;
    try { input = await c.req.json(); } catch { return c.json({ error: "invalid_input" }, 400); }
    const result = await createOrganization(options.transaction, session.user.id, input);
    if ("error" in result) return c.json({ error: result.error }, result.error === "invalid_input" ? 400 : 403);
    return c.json({ organization: result.organization }, 201);
  });
  app.notFound(c => c.json({ error: "not_found" }, 404));
  app.onError(() => new Response(JSON.stringify({ error: "internal_error" }), {
    status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  }));
  return app;
}
