import type { NextConfig } from "next";

const pages = process.env.GITHUB_PAGES === "true";
const nextConfig: NextConfig = {
  ...(pages ? {
    output: "export" as const,
    basePath: "/zoopulse-site",
    trailingSlash: true,
    images: { unoptimized: true },
  } : {}),
  env: { NEXT_PUBLIC_BASE_PATH: pages ? "/zoopulse-site" : "" },
  poweredByHeader: false,
  async headers() {
    return pages ? [] : [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ] }];
  },
  /* config options here */
  cacheComponents: !pages,
  partialPrefetching: !pages,
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        condition: { not: { path: "*.module.css" } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
