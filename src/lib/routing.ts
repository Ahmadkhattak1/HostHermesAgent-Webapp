const DEFAULT_PROTECTED_PATH = "/dashboard";

export function getDefaultProtectedPath() {
  return DEFAULT_PROTECTED_PATH;
}

export function sanitizeNextPath(
  value: string | null | undefined,
  fallback = DEFAULT_PROTECTED_PATH,
) {
  if (!value) {
    return fallback;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  try {
    const parsed = new URL(value, "http://localhost");
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function buildSignInPath(nextPath: string) {
  const params = new URLSearchParams({
    next: sanitizeNextPath(nextPath),
  });

  return `/signin?${params.toString()}`;
}

export function buildSubscriptionPath(nextPath: string) {
  const params = new URLSearchParams({
    required: "1",
    next: sanitizeNextPath(nextPath),
  });

  return `/dashboard/settings/subscription?${params.toString()}`;
}

export function isProtectedPath(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

export function getRequestOrigin(request: Request) {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return url.origin;
}
