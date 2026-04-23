import { NextResponse } from "next/server";
import {
  ROBOTS_ALLOW_PATHS,
  ROBOTS_DISALLOW_PATHS,
  buildAbsoluteUrl,
  buildAgentDiscoveryLinkHeader,
} from "@/lib/site-config";

function getRobotsTxt() {
  const lines = [
    "User-Agent: *",
    ...ROBOTS_ALLOW_PATHS.map((path) => `Allow: ${path}`),
    ...ROBOTS_DISALLOW_PATHS.map((path) => `Disallow: ${path}`),
    'Content-Signal: ai-train=no, search=yes, ai-input=yes',
    "",
    "User-Agent: Googlebot",
    "User-Agent: Bingbot",
    ...ROBOTS_ALLOW_PATHS.map((path) => `Allow: ${path}`),
    ...ROBOTS_DISALLOW_PATHS.map((path) => `Disallow: ${path}`),
    'Content-Signal: ai-train=no, search=yes, ai-input=yes',
    "",
    `Host: ${buildAbsoluteUrl("/")}`,
    `Sitemap: ${buildAbsoluteUrl("/sitemap.xml")}`,
    "",
  ];

  return lines.join("\n");
}

export function GET() {
  return new NextResponse(getRobotsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      Link: buildAgentDiscoveryLinkHeader(),
    },
  });
}

export function HEAD() {
  return new NextResponse(null, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      Link: buildAgentDiscoveryLinkHeader(),
    },
  });
}
