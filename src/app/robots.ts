import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Демо с вымышленными данными не должно попадать в поиск.
  return { rules: { userAgent: "*", disallow: "/" } };
}
