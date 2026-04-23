import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const MARKDOWN_REWRITES: Record<string, string> = {
  "/": "/agent-markdown/home",
  "/docs/api": "/agent-markdown/docs-api",
};

function requestWantsMarkdown(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return false;
  }

  const accept = request.headers.get("accept")?.toLowerCase() ?? "";
  return accept.includes("text/markdown");
}

export function proxy(request: NextRequest) {
  const rewriteTarget = MARKDOWN_REWRITES[request.nextUrl.pathname];

  if (!rewriteTarget || !requestWantsMarkdown(request)) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL(rewriteTarget, request.url));
}

export const config = {
  matcher: ["/", "/docs/api"],
};
