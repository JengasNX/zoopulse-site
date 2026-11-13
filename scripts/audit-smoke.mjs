import { readdirSync } from "node:fs";

const origin = process.env.TEST_BASE_URL || "http://localhost:3000";
const posts = readdirSync(new URL("../src/content/blog/", import.meta.url))
  .filter(file => file.endsWith(".md"))
  .map(file => `/blog/${file.slice(0, -3)}`);
const routes = ["/", "/about", "/search?q=Барон", "/compare", "/animals", "/orgs", "/clinics", "/events",
  "/fundraisers", "/listings", "/favorites", "/blog", "/animals/a1",
  "/orgs/priut-lapa", "/legal/privacy", "/legal/terms", "/legal/refunds",
  "/legal/cookies", ...posts];
let failures = 0;
for (const route of routes) {
  try {
    const response = await fetch(origin + route);
    const html = await response.text();
    const count = (html.match(/<h1(?:\s|>)/g) || []).length;
    const ok = response.status === 200 && count === 1 &&
      response.headers.get("x-content-type-options") === "nosniff";
    if (!ok) failures++;
    console.log(`${ok ? "PASS" : "FAIL"} ${route}: HTTP ${response.status}, H1=${count}`);
  } catch (error) { failures++; console.error("FAIL", route, error.message); }
}
const robots = await fetch(origin + "/robots.txt").then(response => response.text());
if (!robots.includes("Disallow: /")) { failures++; console.error("FAIL robots"); }
const missing = await fetch(origin + "/not-a-real-page-audit");
if (missing.status !== 404) { failures++; console.error("FAIL 404 status", missing.status); }
console.log(`Failures: ${failures}`);
process.exitCode = failures ? 1 : 0;
