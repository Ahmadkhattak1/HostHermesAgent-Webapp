import type { MetadataRoute } from "next";

const DEFAULT_SITE_URL = "https://hosthermesagent.com";

export const SITE_NAME = "Host Hermes Agent";
export const SUPPORT_EMAIL = "support@hosthermesagent.com";
export const SITE_DESCRIPTION =
  "Host Hermes Agent on a VPS with fast deployment, private infrastructure, reliable uptime, and a cleaner managed experience for self-hosted AI agents.";
export const HOME_PAGE_TITLE =
  "Host Hermes Agent on a VPS | Private Hermes Agent Hosting";
export const HOME_PAGE_DESCRIPTION =
  "Deploy Hermes Agent on a VPS in minutes with managed hosting built for self-hosted AI agents, private AI agent workflows, and teams looking for an OpenClaw alternative.";
export const SITE_KEYWORDS = [
  "host hermes agent",
  "hermes agent vps",
  "hermes agent hosting",
  "deploy hermes agent on a vps",
  "self-hosted ai agent",
  "private ai agent",
  "openclaw alternative",
] as const;

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
    path: "/privacy",
    changeFrequency: "monthly",
    priority: 0.2,
  },
  {
    path: "/terms",
    changeFrequency: "monthly",
    priority: 0.2,
  },
  {
    path: "/docs/api",
    changeFrequency: "monthly",
    priority: 0.4,
  },
];

export const ROBOTS_ALLOW_PATHS = [
  "/",
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
