"use client";

import { useEffect } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { clearFirebaseIdTokenCookie, writeFirebaseIdTokenCookie } from "@/lib/firebase/client-session";
import { ensureFirebaseAuth } from "@/lib/firebase/client";
import {
  clearPendingGoogleSignInPath,
  readPendingGoogleSignInPath,
  resolveExistingGoogleSession,
} from "@/lib/firebase/google-sign-in";
import { logClientError, logClientInfo } from "@/lib/logging/client";

export function FirebaseAuthBridge() {
  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void ensureFirebaseAuth()
      .then(async (auth) => {
        unsubscribe = onIdTokenChanged(auth, async (user) => {
          if (!user) {
            clearFirebaseIdTokenCookie();
            logClientInfo("auth", "session.cleared");
            return;
          }

          try {
            const token = await user.getIdToken();
            writeFirebaseIdTokenCookie(token);
            logClientInfo("auth", "session.synced", {
              userId: user.uid,
            });
          } catch (error) {
            clearFirebaseIdTokenCookie();
            logClientError("auth", "session.sync_failed", error, {
              userId: user.uid,
            });
          }
        });

        const pendingNextPath = readPendingGoogleSignInPath();

        if (!pendingNextPath || cancelled) {
          return;
        }

        try {
          const restoredUser = await resolveExistingGoogleSession();

          if (!restoredUser || cancelled) {
            return;
          }

          clearPendingGoogleSignInPath();
          logClientInfo("auth", "signin.redirect_completed", {
            nextPath: pendingNextPath,
            userId: restoredUser.uid,
          });
          window.location.replace(pendingNextPath);
        } catch (error) {
          clearPendingGoogleSignInPath();
          logClientError("auth", "signin.redirect_completion_failed", error, {
            nextPath: pendingNextPath,
          });
        }
      })
      .catch((error) => {
        logClientError("auth", "session.bridge_init_failed", error);
      });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return null;
}
