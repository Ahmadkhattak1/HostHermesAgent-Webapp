import "server-only";

import { cookies } from "next/headers";
import type {
  AuthSessionEnvelope,
  BillingState,
  ControlPlaneErrorPayload,
  InstanceEnvelope,
  PublicInstanceRecord,
} from "@/lib/control-plane/types";
import {
  ControlPlaneError,
  getControlPlaneRequestError,
} from "@/lib/control-plane/shared";
import { FIREBASE_ID_TOKEN_COOKIE_NAME } from "@/lib/firebase/session";

function getServerControlPlaneBaseUrl() {
  const value =
    process.env.CONTROL_PLANE_URL ?? process.env.NEXT_PUBLIC_CONTROL_PLANE_URL;

  if (!value) {
    throw new Error(
      "Missing CONTROL_PLANE_URL or NEXT_PUBLIC_CONTROL_PLANE_URL in the web app environment.",
    );
  }

  return value.replace(/\/+$/, "");
}

export type AuthenticatedSession = {
  accessToken: string;
  user: AuthSessionEnvelope["user"];
};

export async function getAuthenticatedSession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(FIREBASE_ID_TOKEN_COOKIE_NAME)?.value ?? null;

  if (!accessToken) {
    return null;
  }

  try {
    const payload = await requestControlPlaneFromServer<AuthSessionEnvelope>(
      "/api/v1/auth/session",
      accessToken,
      {
        method: "GET",
      },
    );

    return {
      accessToken,
      user: payload.user,
    } satisfies AuthenticatedSession;
  } catch (error) {
    if (error instanceof ControlPlaneError && error.status === 401) {
      return null;
    }

    throw error;
  }
}

async function requestControlPlaneFromServer<T>(
  path: string,
  accessToken: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${getServerControlPlaneBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
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

export function getBillingStateFromControlPlane(accessToken: string) {
  return requestControlPlaneFromServer<BillingState>(
    "/api/v1/billing/state",
    accessToken,
    {
      method: "GET",
    },
  );
}

export async function getLatestInstanceFromControlPlane(accessToken: string) {
  const payload = await requestControlPlaneFromServer<InstanceEnvelope>(
    "/api/v1/instances",
    accessToken,
    {
      method: "GET",
    },
  );

  return payload.instance;
}

export async function getInstanceFromControlPlane(
  accessToken: string,
  instanceId: string,
) {
  const payload = await requestControlPlaneFromServer<InstanceEnvelope>(
    `/api/v1/instances/${encodeURIComponent(instanceId)}`,
    accessToken,
    {
      method: "GET",
    },
  );

  return payload.instance;
}

export function isReadyInstance(
  instance: PublicInstanceRecord | null,
): instance is PublicInstanceRecord & { host: string; status: "ready" } {
  return Boolean(instance && instance.status === "ready" && instance.host);
}
