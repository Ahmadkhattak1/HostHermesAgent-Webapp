import "server-only";

import { redirect } from "next/navigation";
import { buildSignInPath, buildSubscriptionPath, sanitizeNextPath } from "@/lib/routing";
import {
  getAuthenticatedSession,
  getBillingStateFromControlPlane,
} from "@/lib/control-plane/server";

export async function requireAuthenticatedSession(nextPath: string) {
  const session = await getAuthenticatedSession();

  if (!session) {
    redirect(buildSignInPath(nextPath));
  }

  return session;
}

export async function requirePaidSubscriber(nextPath: string) {
  const sanitizedNextPath = sanitizeNextPath(nextPath);
  const session = await requireAuthenticatedSession(sanitizedNextPath);
  const billingState = await getBillingStateFromControlPlane(session.accessToken);

  if (!billingState.hasActiveSubscription) {
    redirect(buildSubscriptionPath(sanitizedNextPath));
  }

  return {
    ...session,
    profile: billingState.profile,
  };
}
