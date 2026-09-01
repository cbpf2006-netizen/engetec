import type { MetadataRoute } from "next";

import { empresa } from "@/lib/empresa";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${empresa.site}/sitemap.xml`,
  };
}
