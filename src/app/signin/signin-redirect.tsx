"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "@/app/console.module.css";
import {
  clearPendingGoogleSignInPath,
  continueToProtectedPathWithGoogleSignIn,
  getGoogleSignInErrorMessage,
  readPendingGoogleSignInPath,
  resolveExistingGoogleSession,
  shouldPreferGooglePopupSignIn,
} from "@/lib/firebase/google-sign-in";
import { clearFirebaseIdTokenCookie } from "@/lib/firebase/client-session";
import { logClientError, logClientInfo } from "@/lib/logging/client";

type SignInRedirectContentProps = {
  nextPath: string;
};

export function SignInRedirectContent({ nextPath }: SignInRedirectContentProps) {
  const initRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(true);
  const [requiresUserAction, setRequiresUserAction] = useState(false);

  useEffect(() => {
    if (initRef.current) {
      return;
    }

    initRef.current = true;
    let cancelled = false;

    queueMicrotask(() => {
      void (async () => {
        try {
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

          if (shouldPreferGooglePopupSignIn()) {
            clearPendingGoogleSignInPath();
            logClientInfo("auth", "signin.awaiting_popup_user_action", {
              nextPath,
            });
            setRequiresUserAction(true);
            setIsBusy(false);
            return;
          }

          if (readPendingGoogleSignInPath()) {
            const restoreError = new Error(
              "Google sign-in returned without restoring a Firebase session.",
            );

            logClientError(
              "auth",
              "signin.redirect_restore_missing_user",
              restoreError,
              {
                nextPath,
              },
            );
            setError(getGoogleSignInErrorMessage(restoreError));
            setIsBusy(false);
            return;
          }

          logClientInfo("auth", "signin.auto_starting_google", {
            nextPath,
          });
          await continueToProtectedPathWithGoogleSignIn(nextPath, "replace", {
            skipExistingSessionResolution: true,
          });
        } catch (caughtError: unknown) {
          if (cancelled) {
            return;
          }

          clearFirebaseIdTokenCookie();
          logClientError("auth", "signin.auto_start_failed", caughtError, {
            nextPath,
          });
          setError(getGoogleSignInErrorMessage(caughtError));
          setRequiresUserAction(true);
        } finally {
          if (!cancelled) {
            setIsBusy(false);
          }
        }
      })();
    });

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
      setRequiresUserAction(true);
      setIsBusy(false);
    }
  }

  const title = requiresUserAction ? "Sign in to continue" : "Continuing";
  const copy = requiresUserAction
    ? "Continue with Google to access your dashboard."
    : "Please wait while we verify your access.";

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
            <h1 className={styles.redirectTitle}>{title}</h1>
            <p className={styles.redirectCopy}>{copy}</p>
          </div>
          {error ? (
            <>
              <p className={`${styles.error} ${styles.redirectError}`}>{error}</p>
            </>
          ) : null}
          {!isBusy || error ? (
            <div className={styles.redirectActions}>
              <button
                className={styles.redirectPrimaryLink}
                type="button"
                onClick={() => {
                  void handleContinueWithGoogle();
                }}
                disabled={isBusy}
              >
                Continue with Google
              </button>
              <Link className={styles.redirectSecondaryLink} href="/">
                Return home
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
