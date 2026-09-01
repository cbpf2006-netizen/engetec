import type { MetadataRoute } from "next";

import { empresa } from "@/lib/empresa";

export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date();

  return [
    { url: empresa.site, lastModified: agora, changeFrequency: "monthly", priority: 1 },
    {
      url: `${empresa.site}/servicos`,
      lastModified: agora,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${empresa.site}/sobre`,
      lastModified: agora,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${empresa.site}/contato`,
      lastModified: agora,
      changeFrequency: "yearly",
      priority: 0.8,
    },
  ];
}
