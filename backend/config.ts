export function readConfig(env: NodeJS.ProcessEnv = process.env) {
  const enabled = env.AUTH_ENABLED === "true";
  const baseURL = env.BETTER_AUTH_URL ?? "http://localhost:3004";
  const url = new URL(baseURL);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.username || url.password || url.search || url.hash || url.pathname !== "/" ||
      (url.protocol !== "https:" && !(local && url.protocol === "http:"))) throw new Error("Invalid auth URL");
  const port = Number(env.BACKEND_PORT ?? "3004");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid port");
  if (enabled) {
    for (const key of ["DATABASE_URL", "BETTER_AUTH_SECRET", "SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "MAIL_FROM"]) {
      if (!env[key]) throw new Error(`Missing server configuration: ${key}`);
    }
    if (env.BETTER_AUTH_SECRET!.length < 32) throw new Error("Auth secret too short");
    if (/[\r\n]/.test(env.MAIL_FROM!) || !env.MAIL_FROM!.includes("@")) throw new Error("Invalid sender");
  }
  return {
    enabled, baseURL: url.origin, port,
    allowRegistration: env.AUTH_REGISTRATION_ENABLED === "true",
  };
}
