"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "@/app/console.module.css";
import {
  clearFirebaseIdTokenCookie,
  hasFirebaseIdTokenCookie,
} from "@/lib/firebase/client-session";
import {
  continueToProtectedPathWithGoogleSignIn,
  getGoogleSignInErrorMessage,
  resolveExistingGoogleSession,
} from "@/lib/firebase/google-sign-in";
import { logClientError, logClientInfo } from "@/lib/logging/client";

type SignInRedirectContentProps = {
  nextPath: string;
};

export function SignInRedirectContent({ nextPath }: SignInRedirectContentProps) {
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setIsBusy(true);

        if (hasFirebaseIdTokenCookie()) {
          logClientInfo("auth", "signin.cookie_short_circuit", {
            nextPath,
          });
          window.location.replace(nextPath);
          return;
        }

        const restoredUser = await resolveExistingGoogleSession();

        if (cancelled) {
          return;
        }

        if (restoredUser) {
          logClientInfo("auth", "signin.restored_existing_session", {
            nextPath,
            userId: restoredUser.uid,
          });
          window.location.replace(nextPath);
          return;
        }

        await continueToProtectedPathWithGoogleSignIn(
          nextPath,
          "replace",
          {
            skipExistingSessionResolution: true,
          },
        );
      } catch (caughtError: unknown) {
        if (cancelled) {
          return;
        }

        clearFirebaseIdTokenCookie();
        logClientError("auth", "signin.restore_failed", caughtError, {
          nextPath,
        });
        setError(getGoogleSignInErrorMessage(caughtError));
      } finally {
        if (!cancelled) {
          setIsBusy(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [nextPath]);

  async function handleContinueWithGoogle() {
    setError(null);
    setIsBusy(true);

    try {
      await continueToProtectedPathWithGoogleSignIn(nextPath, "replace");
    } catch (caughtError: unknown) {
      clearFirebaseIdTokenCookie();
      logClientError("auth", "signin.manual_start_failed", caughtError, {
        nextPath,
      });
      setError(getGoogleSignInErrorMessage(caughtError));
      setIsBusy(false);
    }
  }

  if (isBusy && !error) {
    return null;
  }

  return (
    <main className={`${styles.screen} ${styles.subscriptionScreen}`}>
      <div className={styles.redirectShell}>
        <div className={styles.redirectContent}>
          {isBusy ? (
            <div className={styles.redirectLoader} aria-hidden="true">
              <span className={styles.redirectDot} />
              <span className={styles.redirectDot} />
              <span className={styles.redirectDot} />
            </div>
          ) : null}
          <div className={styles.redirectTextBlock}>
            <h1 className={styles.redirectTitle}>
              {error ? "Sign in to continue" : "Continue with Google"}
            </h1>
            <p className={styles.redirectCopy}>
              {error
                ? "Continue with Google to access your Host Hermes account."
                : "Use the Google popup to access your Host Hermes account."}
            </p>
          </div>
          {error ? <p className={`${styles.error} ${styles.redirectError}`}>{error}</p> : null}
          <div className={styles.redirectActions}>
            <button
              className={styles.redirectPrimaryLink}
              type="button"
              onClick={() => {
                void handleContinueWithGoogle();
              }}
              disabled={isBusy}
            >
              {isBusy ? "Opening Google..." : "Continue with Google"}
            </button>
            <Link className={styles.redirectSecondaryLink} href="/">
              Return home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
