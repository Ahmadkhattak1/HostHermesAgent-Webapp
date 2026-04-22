"use client";

import { useState } from "react";
import styles from "@/app/console.module.css";
import { controlPlaneJsonRequest } from "@/lib/control-plane/client";
import type { PortalSessionEnvelope } from "@/lib/control-plane/types";
import { logClientError, logClientInfo } from "@/lib/logging/client";

type ManageSubscriptionButtonProps = {
  nextPath?: string;
};

export function ManageSubscriptionButton({
  nextPath = "/dashboard/settings",
}: ManageSubscriptionButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  async function openBillingPortal() {
    setError(null);
    setIsWorking(true);

    try {
      const payload = await controlPlaneJsonRequest<PortalSessionEnvelope>(
        "/api/v1/billing/stripe/portal/session",
        "POST",
        {
          nextPath,
        },
      );

      logClientInfo("billing", "portal.opened_from_settings", {
        nextPath,
      });
      window.location.assign(payload.url);
    } catch (caughtError: unknown) {
      logClientError("billing", "portal.open_failed_from_settings", caughtError, {
        nextPath,
      });
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not open subscription management right now.",
      );
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <div className={styles.settingsActionGroup}>
      <button
        className={styles.settingsBackLink}
        disabled={isWorking}
        onClick={() => void openBillingPortal()}
        type="button"
      >
        {isWorking ? "Opening Stripe..." : "Manage subscription"}
      </button>
      {error ? <p className={styles.settingsActionError}>{error}</p> : null}
    </div>
  );
}
