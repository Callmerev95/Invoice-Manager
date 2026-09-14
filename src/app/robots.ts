import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/app-meta";

/** true hanya di deployment live demo — blok semua crawler. */
const NO_INDEX = process.env.NEXT_PUBLIC_NO_INDEX === "true";

export default function robots(): MetadataRoute.Robots {
  if (NO_INDEX) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/invoices",
        "/templates",
        "/settings",
        "/dev",
        "/auth/",
        "/v/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
