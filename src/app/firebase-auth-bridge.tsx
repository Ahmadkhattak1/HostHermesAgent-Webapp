"use client";

import { useEffect } from "react";
import { onIdTokenChanged } from "firebase/auth";
import {
  clearFirebaseIdTokenCookie,
  hasFirebaseIdTokenCookie,
  writeFirebaseIdTokenCookie,
} from "@/lib/firebase/client-session";
import {
  ensureFirebaseAuth,
  getFirebaseRuntimeDiagnostics,
  getResolvedFirebaseUser,
} from "@/lib/firebase/client";
import { logClientError, logClientInfo } from "@/lib/logging/client";

export function FirebaseAuthBridge() {
  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void ensureFirebaseAuth()
      .then(async (auth) => {
        logClientInfo("auth", "signin.bridge_bootstrap_started", {
          ...getFirebaseRuntimeDiagnostics(),
          currentUserId: auth.currentUser?.uid ?? null,
          hasFirebaseCookie: hasFirebaseIdTokenCookie(),
        });
        const bootstrappedUser =
          auth.currentUser ?? (await getResolvedFirebaseUser());

        if (cancelled) {
          return;
        }

        unsubscribe = onIdTokenChanged(auth, async (user) => {
          logClientInfo("auth", "session.id_token_changed", {
            ...getFirebaseRuntimeDiagnostics(),
            hasFirebaseCookie: hasFirebaseIdTokenCookie(),
            userId: user?.uid ?? null,
          });

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

        if (bootstrappedUser) {
          try {
            const token = await bootstrappedUser.getIdToken();
            writeFirebaseIdTokenCookie(token);
            logClientInfo("auth", "session.bootstrap_completed", {
              ...getFirebaseRuntimeDiagnostics(),
              hasFirebaseCookie: hasFirebaseIdTokenCookie(),
              userId: bootstrappedUser.uid,
            });
          } catch (error) {
            clearFirebaseIdTokenCookie();
            logClientError("auth", "session.bootstrap_sync_failed", error, {
              userId: bootstrappedUser.uid,
            });
          }
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
