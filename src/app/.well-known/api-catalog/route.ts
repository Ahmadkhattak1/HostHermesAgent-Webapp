import { NextResponse } from "next/server";
import {
  AGENT_DISCOVERY_LINKS,
  buildAbsoluteUrl,
  buildAgentDiscoveryLinkHeader,
} from "@/lib/site-config";

const contentType = "application/json; charset=utf-8";

function getCatalogDocument() {
  return {
    title: "Host Hermes Agent API Catalog",
    publisher: {
      name: "Host Hermes Agent",
      url: buildAbsoluteUrl("/"),
    },
    links: AGENT_DISCOVERY_LINKS.map(({ path, rel }) => ({
      href: buildAbsoluteUrl(path),
      rel,
    })),
    apis: [
      {
        name: "Control Plane API",
        baseUrl: buildAbsoluteUrl("/api/"),
        docs: buildAbsoluteUrl("/docs/api"),
        health: buildAbsoluteUrl("/health"),
        websocket: buildAbsoluteUrl("/ws/"),
      },
    ],
  };
}

export function GET() {
  return NextResponse.json(getCatalogDocument(), {
    headers: {
      Link: buildAgentDiscoveryLinkHeader(),
      "Content-Type": contentType,
    },
  });
}

export function HEAD() {
  return new NextResponse(null, {
    headers: {
      Link: buildAgentDiscoveryLinkHeader(),
      "Content-Type": contentType,
    },
  });
}
