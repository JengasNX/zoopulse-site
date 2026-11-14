import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { memoryAdapter } from "better-auth/adapters/memory";
import { createAuth } from "../backend/auth.ts";
import { readConfig } from "../backend/config.ts";

const baseURL = "http://localhost:3004";
function fixture(allowRegistration = true, url = baseURL) {
  const store = { auth_user: [], auth_account: [], auth_session: [], auth_verification: [], auth_rate_limit: [] };
  const mail = [];
  const auth = createAuth({
    database: memoryAdapter(store),
    baseURL: url, secret: randomBytes(48).toString("base64"), allowRegistration,
    sendMail: async message => { mail.push(message); },
  });
  const request = (path, body, extraHeaders = {}) => auth.handler(new Request(`${url}/api/auth${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { Origin: url, "Content-Type": "application/json", "x-zoopulse-client-ip": "127.0.0.1", ...extraHeaders },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  }));
  return { auth, store, mail, request };
}
const mailURL = mail => mail.text.match(/https?:\/\/[^\s]+/)[0];
const cookies = response => response.headers.getSetCookie().map(cookie => cookie.split(";")[0]).join("; ");

test("real Better Auth verification, session and password-reset lifecycle (memory adapter)", async t => {
  const f = fixture();
  const email = "test@example.invalid";
  const password = "Only-a-test-password-1!";
  let cookie;
  await t.test("signup ignores client privilege and verification fields", async () => {
    const response = await f.request("/sign-up/email", {
      name: "Test person", email, password, role: "admin", emailVerified: true,
    });
    assert.equal(response.status, 200);
    assert.equal(f.store.auth_user.length, 1);
    assert.equal(f.store.auth_user[0].emailVerified, false);
    assert.equal(f.store.auth_user[0].role, undefined);
    assert.equal(f.mail.length, 1);
    assert.ok(!JSON.stringify(await response.json()).includes(password));
    assert.ok(!cookies(response).includes("session_token"));
  });
  await t.test("unverified account cannot sign in", async () => {
    assert.equal((await f.request("/sign-in/email", { email, password })).status, 403);
  });
  await t.test("verification link confirms email; no automatic session", async () => {
    const response = await f.auth.handler(new Request(mailURL(f.mail[0])));
    assert.ok(response.status >= 200 && response.status < 400);
    assert.equal(f.store.auth_user[0].emailVerified, true);
    assert.equal(f.store.auth_session.length, 0);
  });
  await t.test("wrong password rejected; correct password sets HttpOnly SameSite cookie", async () => {
    assert.equal((await f.request("/sign-in/email", { email, password: "Wrong-test-password!" })).status, 401);
    const response = await f.request("/sign-in/email", { email, password });
    assert.equal(response.status, 200);
    const header = response.headers.get("set-cookie");
    assert.match(header, /HttpOnly/i);
    assert.match(header, /SameSite=Lax/i);
    cookie = cookies(response);
    assert.equal((await (await f.request("/get-session", undefined, { Cookie: cookie })).json()).user.email, email);
  });
  await t.test("tampered cookie is not a session", async () => {
    assert.equal(await (await f.request("/get-session", undefined, { Cookie: "better-auth.session_token=forged" })).json(), null);
  });
  await t.test("reset changes password, revokes session and consumes token", async () => {
    assert.equal((await f.request("/request-password-reset", { email, redirectTo: `${baseURL}/reset-password` })).status, 200);
    const resetURL = new URL(mailURL(f.mail.at(-1)));
    const token = resetURL.pathname.split("/").at(-1);
    const body = { token, newPassword: "Different-test-password-2!" };
    assert.equal((await f.request("/reset-password", body)).status, 200);
    assert.equal(await (await f.request("/get-session", undefined, { Cookie: cookie })).json(), null);
    assert.ok((await f.request("/reset-password", body)).status >= 400);
    const login = await f.request("/sign-in/email", { email, password: body.newPassword });
    assert.equal(login.status, 200);
    cookie = cookies(login);
  });
  await t.test("signout revokes the persisted session", async () => {
    assert.equal((await f.request("/sign-out", {}, { Cookie: cookie })).status, 200);
    assert.equal(await (await f.request("/get-session", undefined, { Cookie: cookie })).json(), null);
  });
  await t.test("expired persisted session cannot be used", async () => {
    const login = await f.request("/sign-in/email", { email, password: "Different-test-password-2!" });
    assert.equal(login.status, 200);
    cookie = cookies(login);
    for (const session of f.store.auth_session) session.expiresAt = new Date("2000-01-01");
    assert.equal(await (await f.request("/get-session", undefined, { Cookie: cookie })).json(), null);
  });
});

test("HTTPS auth sets Secure session cookies", async () => {
  const f = fixture(true, "https://auth.example.invalid");
  const body = { name: "Test", email: "secure@example.invalid", password: "Only-a-test-password-1!" };
  assert.equal((await f.request("/sign-up/email", body)).status, 200);
  await f.auth.handler(new Request(mailURL(f.mail[0])));
  const login = await f.request("/sign-in/email", { email: body.email, password: body.password });
  assert.equal(login.status, 200);
  assert.match(login.headers.get("set-cookie"), /;\s*Secure/i);
});

test("auth rejects hostile origins, short passwords and disabled signup", async () => {
  const f = fixture();
  const body = { email: "test@example.invalid", name: "Test", password: "Only-test-password-1!" };
  assert.equal((await f.request("/sign-up/email", body, { Origin: "https://attacker.invalid" })).status, 403);
  assert.equal((await f.request("/sign-up/email", { ...body, password: "short" })).status, 400);
  assert.equal((await fixture(false).request("/sign-up/email", body)).status, 400);
});

test("auth rate limit persists across requests", async () => {
  const f = fixture();
  for (let i = 0; i < 5; i++) {
    assert.equal((await f.request("/sign-in/email", { email: "missing@example.invalid", password: "Only-test-password-1!" })).status, 401);
  }
  assert.equal((await f.request("/sign-in/email", { email: "missing@example.invalid", password: "Only-test-password-1!" })).status, 429);
});

test("server is disabled by default and fails closed on incomplete configuration", () => {
  assert.equal(readConfig({}).enabled, false);
  assert.throws(() => readConfig({ AUTH_ENABLED: "true" }), /Missing/);
  assert.throws(() => readConfig({ BETTER_AUTH_URL: "http://public.example.invalid" }), /Invalid/);
  assert.throws(() => readConfig({ BETTER_AUTH_URL: "https://example.invalid/other" }), /Invalid/);
  assert.throws(() => readConfig({ BACKEND_PORT: "not-a-port" }), /Invalid/);
});
