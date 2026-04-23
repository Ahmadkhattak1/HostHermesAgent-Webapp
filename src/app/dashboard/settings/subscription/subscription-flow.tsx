"use client";

import Link from "next/link";
import { startTransition, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/console.module.css";
import { controlPlaneJsonRequest } from "@/lib/control-plane/client";
import type {
  CheckoutConfirmEnvelope,
  CheckoutSessionEnvelope,
} from "@/lib/control-plane/types";
import { logClientError, logClientInfo } from "@/lib/logging/client";

type SubscriptionFlowProps = {
  cancelled: boolean;
  hasActiveSubscription: boolean;
  nextPath: string;
  sessionId: string | null;
};

export function SubscriptionFlow({
  cancelled,
  hasActiveSubscription,
  nextPath,
  sessionId,
}: SubscriptionFlowProps) {
  const router = useRouter();
  const autoRunRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    logClientInfo("billing", "view.loaded", {
      hasActiveSubscription,
      sessionId,
      cancelled,
    });
  }, [
    hasActiveSubscription,
    sessionId,
    cancelled,
  ]);

  useEffect(() => {
    if (autoRunRef.current) {
      return;
    }

    if (sessionId) {
      autoRunRef.current = true;
      queueMicrotask(() => {
        void (async () => {
          try {
            const data = await controlPlaneJsonRequest<CheckoutConfirmEnvelope>(
              "/api/v1/billing/stripe/checkout/confirm",
              "POST",
              {
                nextPath,
                sessionId,
              },
            );

            if (!data.active) {
              throw new Error(
                "Stripe returned successfully, but the subscription is not active yet.",
              );
            }

            logClientInfo("billing", "checkout.confirmed", {
              nextPath: data.nextPath,
            });
            startTransition(() => {
              router.replace(data.nextPath);
            });
          } catch (caughtError: unknown) {
            logClientError("billing", "checkout.confirm_failed", caughtError, {
              nextPath,
              sessionId,
            });
            setError(
              caughtError instanceof Error
                ? caughtError.message
                : "Could not confirm the Stripe checkout session.",
            );
          }
        })();
      });
      return;
    }

    if (hasActiveSubscription) {
      autoRunRef.current = true;
      startTransition(() => {
        router.replace(nextPath);
      });
      return;
    }

    if (!cancelled && !hasActiveSubscription) {
      autoRunRef.current = true;
      queueMicrotask(() => {
        void (async () => {
          try {
            const data = await controlPlaneJsonRequest<CheckoutSessionEnvelope>(
              "/api/v1/billing/stripe/checkout/session",
              "POST",
              {
                nextPath,
              },
            );

            logClientInfo("billing", "checkout.auto_redirected", {
              nextPath,
            });
            window.location.assign(data.url);
          } catch (caughtError: unknown) {
            logClientError("billing", "checkout.auto_redirect_failed", caughtError, {
              nextPath,
            });
            setError(
              caughtError instanceof Error
                ? caughtError.message
                : "Could not create a Stripe checkout session.",
            );
          }
        })();
      });
    }
  }, [
    cancelled,
    hasActiveSubscription,
    nextPath,
    router,
    sessionId,
  ]);

  const shouldShowLoader = !cancelled && !error;

  return (
    <div className={styles.redirectShell}>
      <div className={styles.redirectContent}>
        {shouldShowLoader ? (
          <div className={styles.redirectLoader} aria-hidden="true">
            <span className={styles.redirectDot} />
            <span className={styles.redirectDot} />
            <span className={styles.redirectDot} />
          </div>
        ) : null}
        <div className={styles.redirectTextBlock}>
          <h1 className={styles.redirectTitle}>
            {cancelled
              ? "Checkout cancelled"
              : sessionId
                ? "Finalizing checkout"
                : "Redirecting to checkout"}
          </h1>
          <p className={styles.redirectCopy}>
            {cancelled
              ? "Your checkout was cancelled, so the 3-day trial did not start. Return and try checkout again when ready."
              : sessionId
                ? "Please wait while we confirm your 3-day trial and subscription."
                : "Please wait while we securely transfer you to Stripe to start your 3-day trial."}
          </p>
        </div>
        {error ? <p className={`${styles.error} ${styles.redirectError}`}>{error}</p> : null}
        {cancelled || error ? (
          <div className={styles.redirectActions}>
            <Link className={styles.redirectPrimaryLink} href="/dashboard/deploy">
              Retry
            </Link>
            <Link className={styles.redirectSecondaryLink} href="/">
              Return home
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
