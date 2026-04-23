"use client";

import { getControlPlaneRequestError } from "@/lib/control-plane/shared";
import type { ControlPlaneErrorPayload } from "@/lib/control-plane/types";
import { FIREBASE_ID_TOKEN_COOKIE_NAME } from "@/lib/firebase/session";

export function getBrowserControlPlaneBaseUrl() {
  if (typeof window !== "undefined") {
    // Route browser traffic through Next rewrites so API and websocket calls stay same-origin.
    return window.location.origin;
  }

  const value = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL;

  if (!value) {
    throw new Error("Missing NEXT_PUBLIC_CONTROL_PLANE_URL in the web app environment.");
  }

  const normalizedValue = value.replace(/\/+$/, "");

  return normalizedValue;
}

function getBrowserAccessToken() {
  if (typeof document === "undefined") {
    return null;
  }

  const encodedValue = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${FIREBASE_ID_TOKEN_COOKIE_NAME}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  return encodedValue ? decodeURIComponent(encodedValue) : null;
}

export async function controlPlaneFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const accessToken = getBrowserAccessToken();

  if (!accessToken) {
    throw new Error("No active authenticated session exists.");
  }

  const response = await fetch(`${getBrowserControlPlaneBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(init?.headers ?? {}),
    },
  });
  const payload = (await response.json().catch(() => ({}))) as T &
    ControlPlaneErrorPayload;

  if (!response.ok) {
    throw getControlPlaneRequestError(
      response,
      payload,
      "The request failed.",
    );
  }

  return payload;
}

export function controlPlaneJsonRequest<T>(
  path: string,
  method: "DELETE" | "GET" | "POST",
  body?: Record<string, number | string>,
) {
  return controlPlaneFetch<T>(path, {
    body: body ? JSON.stringify(body) : undefined,
    method,
  });
}
