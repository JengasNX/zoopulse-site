import { betterAuth, type BetterAuthOptions } from "better-auth";

export type AuthMail = { to: string; subject: string; text: string };
export function createAuth(options: {
  database: BetterAuthOptions["database"];
  baseURL: string;
  secret: string;
  sendMail: (mail: AuthMail) => Promise<void>;
  allowRegistration: boolean;
}) {
  if (!options.database) throw new Error("A persistent auth adapter is required");
  return betterAuth({
    appName: "Зоопульс",
    database: options.database,
    baseURL: options.baseURL,
    secret: options.secret,
    trustedOrigins: [new URL(options.baseURL).origin],
    logger: { disabled: true },
    user: { modelName: "auth_user" },
    account: { modelName: "auth_account", accountLinking: { enabled: false } },
    verification: { modelName: "auth_verification" },
    session: {
      modelName: "auth_session",
      expiresIn: 60 * 60 * 24,
      updateAge: 60 * 60,
      cookieCache: { enabled: false },
    },
    emailAndPassword: {
      enabled: true,
      disableSignUp: !options.allowRegistration,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      autoSignIn: false,
      requireEmailVerification: true,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: ({ user, url }) => options.sendMail({
        to: user.email, subject: "Зоопульс — восстановление доступа",
        text: `Если вы запросили смену пароля, откройте ссылку:\n${url}\nЕсли нет — ничего не делайте.`,
      }),
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: false,
      expiresIn: 60 * 60,
      sendVerificationEmail: ({ user, url }) => options.sendMail({
        to: user.email, subject: "Зоопульс — подтвердите почту",
        text: `Подтвердите адрес по ссылке:\n${url}\nСсылка действует один час. Если вы не регистрировались — ничего не делайте.`,
      }),
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      modelName: "auth_rate_limit",
      window: 60,
      max: 30,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/sign-up/email": { window: 60, max: 3 },
        "/request-password-reset": { window: 60, max: 3 },
        "/send-verification-email": { window: 60, max: 3 },
      },
    },
    advanced: {
      useSecureCookies: new URL(options.baseURL).protocol === "https:",
      ipAddress: { ipAddressHeaders: ["x-zoopulse-client-ip"] },
      defaultCookieAttributes: { httpOnly: true, sameSite: "lax", path: "/" },
    },
  });
}
export type Auth = ReturnType<typeof createAuth>;
