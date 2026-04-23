import type { MetadataRoute } from "next";
import {
  ROBOTS_ALLOW_PATHS,
  ROBOTS_DISALLOW_PATHS,
  buildAbsoluteUrl,
} from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const sharedRules = {
    allow: [...ROBOTS_ALLOW_PATHS],
    disallow: [...ROBOTS_DISALLOW_PATHS],
  };

  return {
    rules: [
      {
        userAgent: "*",
        ...sharedRules,
      },
      {
        userAgent: ["Googlebot", "Bingbot"],
        ...sharedRules,
      },
    ],
    sitemap: buildAbsoluteUrl("/sitemap.xml"),
  };
}
