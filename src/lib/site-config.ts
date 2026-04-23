import type { MetadataRoute } from "next";

const DEFAULT_SITE_URL = "https://hosthermesagent.com";

type SitemapEntry = {
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  path: string;
  priority: number;
};

export const SITEMAP_ENTRIES: SitemapEntry[] = [
  {
    path: "/",
    changeFrequency: "daily",
    priority: 1,
  },
  {
    path: "/docs/api",
    changeFrequency: "monthly",
    priority: 0.4,
  },
];

export const ROBOTS_ALLOW_PATHS = [
  "/",
  "/signin",
  "/docs/api",
  "/.well-known/",
] as const;

export const ROBOTS_DISALLOW_PATHS = [
  "/api/",
  "/agent-markdown/",
  "/dashboard/",
  "/ws/",
] as const;

export const AGENT_DISCOVERY_LINKS = [
  {
    path: "/.well-known/api-catalog",
    rel: "api-catalog",
  },
  {
    path: "/docs/api",
    rel: "service-doc",
  },
] as const;

export function getSiteUrl() {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;

  try {
    return new URL(configuredSiteUrl);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

export function buildAbsoluteUrl(path: string) {
  return new URL(path, getSiteUrl()).toString();
}

export function buildAgentDiscoveryLinkHeader() {
  return AGENT_DISCOVERY_LINKS.map(
    ({ path, rel }) => `<${path}>; rel="${rel}"`,
  ).join(", ");
}
