import { NextResponse } from "next/server";
import {
  buildSignInPath,
  getDefaultProtectedPath,
  sanitizeNextPath,
} from "@/lib/routing";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const nextPath = sanitizeNextPath(
    requestUrl.searchParams.get("next"),
    getDefaultProtectedPath(),
  );

  return NextResponse.redirect(
    new URL(buildSignInPath(nextPath), requestUrl.origin),
  );
}
