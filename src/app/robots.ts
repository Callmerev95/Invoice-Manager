import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/app-meta";

export default function robots(): MetadataRoute.Robots {
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
