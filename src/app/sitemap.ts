import type { MetadataRoute } from "next";
import { SITEMAP_ENTRIES, buildAbsoluteUrl } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return SITEMAP_ENTRIES.map(({ changeFrequency, path, priority }) => ({
    url: buildAbsoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
  }));
}
