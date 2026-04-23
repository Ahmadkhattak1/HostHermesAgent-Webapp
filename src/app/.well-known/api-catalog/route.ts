import { NextResponse } from "next/server";
import {
  buildAbsoluteUrl,
  buildAgentDiscoveryLinkHeader,
} from "@/lib/site-config";
import {
  getApiCatalogUrl,
  getApiDocumentationUrl,
  getOpenApiDocumentUrl,
  getProtectedResourceIdentifier,
} from "@/lib/discovery";

const contentType =
  'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"';

function getCatalogDocument() {
  return {
    linkset: [
      {
        anchor: getProtectedResourceIdentifier(),
        "service-desc": [
          {
            href: getOpenApiDocumentUrl(),
            type: "application/vnd.oai.openapi+json;version=3.1",
          },
        ],
        "service-doc": [
          {
            href: getApiDocumentationUrl(),
            type: "text/html",
          },
        ],
        status: [
          {
            href: buildAbsoluteUrl("/health"),
          },
        ],
      },
      {
        anchor: getApiCatalogUrl(),
        item: [
          {
            href: getProtectedResourceIdentifier(),
          },
        ],
      },
    ],
  };
}

export function GET() {
  return new NextResponse(JSON.stringify(getCatalogDocument(), null, 2), {
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
