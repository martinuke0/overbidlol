import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_APP_URL || "https://overbid.lol";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/rules`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
