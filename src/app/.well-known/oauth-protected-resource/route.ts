import { NextResponse } from "next/server";
import {
  getApiDocumentationUrl,
  getFirebaseIssuer,
  getProtectedResourceIdentifier,
} from "@/lib/discovery";

function getProtectedResourceMetadata() {
  return {
    resource: getProtectedResourceIdentifier(),
    authorization_servers: [getFirebaseIssuer()],
    scopes_supported: [],
    bearer_methods_supported: ["header"],
    resource_name: "Host Hermes Agent Control Plane API",
    resource_documentation: getApiDocumentationUrl(),
  };
}

export function GET() {
  return NextResponse.json(getProtectedResourceMetadata());
}

export function HEAD() {
  return new NextResponse(null, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
