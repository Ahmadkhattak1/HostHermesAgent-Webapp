import styles from "@/app/console.module.css";
import { requireAuthenticatedSession } from "@/lib/auth";
import { getBillingStateFromControlPlane } from "@/lib/control-plane/server";
import { getDefaultProtectedPath, sanitizeNextPath } from "@/lib/routing";
import { SubscriptionFlow } from "@/app/dashboard/settings/subscription/subscription-flow";

type SubscriptionPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SubscriptionPage({
  searchParams,
}: SubscriptionPageProps) {
  const params = await searchParams;
  const nextParam = readParam(params.next);
  const nextPath = sanitizeNextPath(
    nextParam,
    getDefaultProtectedPath(),
  );
  const cancelled = readParam(params.cancelled) === "1";
  const sessionId = readParam(params.session_id) ?? null;
  const subscriptionQuery = new URLSearchParams();

  if (cancelled) {
    subscriptionQuery.set("cancelled", "1");
  }

  if (sessionId) {
    subscriptionQuery.set("session_id", sessionId);
  }

  if (nextParam) {
    subscriptionQuery.set("next", nextParam);
  }

  const subscriptionPath = subscriptionQuery.size
    ? `/dashboard/settings/subscription?${subscriptionQuery.toString()}`
    : "/dashboard/settings/subscription";
  const { accessToken } = await requireAuthenticatedSession(
    subscriptionPath,
  );
  const { hasActiveSubscription } =
    await getBillingStateFromControlPlane(accessToken);

  return (
    <main className={`${styles.screen} ${styles.subscriptionScreen}`}>
      <SubscriptionFlow
        cancelled={cancelled}
        hasActiveSubscription={hasActiveSubscription}
        nextPath={nextPath}
        sessionId={sessionId}
      />
    </main>
  );
}
