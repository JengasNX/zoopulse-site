import { serve } from "@hono/node-server";
import type { Server } from "node:http";
import { Pool } from "pg";
import nodemailer from "nodemailer";
import { createApp } from "./app";
import { createAuth } from "./auth";
import { readConfig } from "./config";
import type { Database, Transaction } from "./dal";

async function main() {
  const config = readConfig();
  const pool = config.enabled ? new Pool({
    connectionString: process.env.DATABASE_URL, max: 5,
    connectionTimeoutMillis: 10000, statement_timeout: 10000,
  }) : undefined;
  pool?.on("error", () => console.error("Database idle connection failed"));
  const database: Database = {
    async query(text, values) {
      if (!pool) throw new Error("Database disabled");
      return pool.query(text, values);
    },
  };
  const transaction: Transaction = async work => {
    if (!pool) throw new Error("Database disabled");
    const client = await pool.connect();
    let discard: Error | undefined;
    try {
      await client.query("BEGIN");
      const result = await work(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      try { await client.query("ROLLBACK"); } catch { discard = new Error("Rollback failed"); }
      throw error;
    } finally {
      client.release(discard);
    }
  };
  const tasks = new Set<Promise<unknown>>();
  let auth;
  if (config.enabled) {
    // No automatic DDL. Startup requires migrations and a working SMTP service.
    await database.query("SELECT id FROM auth_user LIMIT 0");
    const mailer = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port: 465, secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
      connectionTimeout: 10000, socketTimeout: 15000,
    });
    await mailer.verify();
    auth = createAuth({
      database: pool!,
      baseURL: config.baseURL,
      secret: process.env.BETTER_AUTH_SECRET!,
      allowRegistration: config.allowRegistration,
      sendMail: mail => {
        // Do not await SMTP on the auth HTTP path (email enumeration timing).
        // Process-local delivery only: failure requires explicit resend.
        const task = mailer.sendMail({ from: process.env.MAIL_FROM, ...mail })
          .catch(() => { console.error("Authentication email delivery failed"); })
          .finally(() => { tasks.delete(task); });
        tasks.add(task);
        return Promise.resolve();
      },
    });
  }
  const addresses = new WeakMap<Request, string>();
  const app = createApp({
    auth, database, transaction, enabled: config.enabled,
    origin: config.baseURL,
    getClientIp: request => addresses.get(request) ?? "unknown",
  });
  const server = serve({
    hostname: "127.0.0.1", port: config.port,
    fetch: (request, bindings) => {
      addresses.set(request, bindings.incoming.socket.remoteAddress ?? "unknown");
      return app.fetch(request);
    },
  }, () => console.log(`Zoopulse backend ready on loopback:${config.port}; auth ${config.enabled ? "enabled" : "disabled"}`));
  (server as Server).requestTimeout = 30000;
  (server as Server).headersTimeout = 15000;
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, () => server.close(() => {
      void Promise.allSettled([...tasks]).then(() => pool?.end()).finally(() => process.exit(0));
    }));
  }
}
main().catch(() => {
  console.error("Backend startup failed. Check database, mail and server configuration. No credentials logged.");
  process.exit(1);
});
