"use client";

import { getResolvedFirebaseUser } from "@/lib/firebase/client";
import { getControlPlaneRequestError } from "@/lib/control-plane/shared";
import type { ControlPlaneErrorPayload } from "@/lib/control-plane/types";

function getBrowserControlPlaneBaseUrl() {
  const value = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL;

  if (!value) {
    throw new Error("Missing NEXT_PUBLIC_CONTROL_PLANE_URL in the web app environment.");
  }

  return value.replace(/\/+$/, "");
}

async function getBrowserAccessToken() {
  const user = await getResolvedFirebaseUser();

  if (!user) {
    throw new Error("No active Firebase session exists.");
  }

  return user.getIdToken();
}

export async function controlPlaneFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const accessToken = await getBrowserAccessToken();
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
