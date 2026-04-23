"use client";

import type { User } from "firebase/auth";
import { signInWithPopup } from "firebase/auth";
import {
  hasFirebaseIdTokenCookie,
  writeFirebaseIdTokenCookie,
} from "@/lib/firebase/client-session";
import {
  createGoogleProvider,
  ensureFirebaseAuth,
  getFirebaseRuntimeDiagnostics,
  getResolvedFirebaseUser,
} from "@/lib/firebase/client";
import { logClientError, logClientInfo } from "@/lib/logging/client";
import { getDefaultProtectedPath, sanitizeNextPath } from "@/lib/routing";

function getSanitizedPendingNextPath(nextPath: string) {
  return sanitizeNextPath(nextPath, getDefaultProtectedPath());
}

export function clearPendingGoogleSignInPath() {
  logClientInfo("auth", "signin.pending_path_cleared_noop", {
    ...getFirebaseRuntimeDiagnostics(),
  });
}

export function storePendingGoogleSignInPath(nextPath: string) {
  logClientInfo("auth", "signin.pending_path_stored_noop", {
    ...getFirebaseRuntimeDiagnostics(),
    nextPath: getSanitizedPendingNextPath(nextPath),
  });
}

export function readPendingGoogleSignInPath() {
  return null;
}

function getFirebaseAuthErrorCode(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return null;
}

async function flushClientSessionCookie() {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 50);
  });
}

export function getGoogleSignInErrorMessage(error: unknown) {
  const code = getFirebaseAuthErrorCode(error);

  switch (code) {
    case "auth/operation-not-allowed":
      return "Google sign-in is not enabled for this Firebase project.";
    case "auth/popup-blocked":
      return "The Google sign-in popup was blocked by the browser.";
    case "auth/popup-closed-by-user":
      return "The Google sign-in popup was closed before sign-in completed.";
    case "auth/unauthorized-domain":
      return "This site domain is not authorized for Google sign-in yet.";
    default:
      return error instanceof Error
        ? error.message
        : "Could not complete Google sign-in with Firebase.";
  }
}

export async function syncFirebaseSession(user: User) {
  const token = await user.getIdToken();
  writeFirebaseIdTokenCookie(token);
  await flushClientSessionCookie();
  logClientInfo("auth", "session.synced_from_user", {
    ...getFirebaseRuntimeDiagnostics(),
    hasFirebaseCookie: hasFirebaseIdTokenCookie(),
    userId: user.uid,
  });

  return token;
}

export async function resolveExistingGoogleSession() {
  const auth = await ensureFirebaseAuth();
  const user = auth.currentUser ?? (await getResolvedFirebaseUser());

  logClientInfo("auth", "signin.popup_session_resolved", {
    ...getFirebaseRuntimeDiagnostics(),
    authCurrentUserId: auth.currentUser?.uid ?? null,
    hasFirebaseCookie: hasFirebaseIdTokenCookie(),
    resolvedUserId: user?.uid ?? null,
  });

  if (!user) {
    return null;
  }

  await syncFirebaseSession(user);
  return user;
}

export async function continueToProtectedPathWithGoogleSignIn(
  nextPath: string,
  navigationMode: "assign" | "replace" = "assign",
  options?: {
    skipExistingSessionResolution?: boolean;
  },
) {
  const sanitizedNextPath = getSanitizedPendingNextPath(nextPath);

  try {
    const auth = await ensureFirebaseAuth();
    logClientInfo("auth", "signin.continue_requested", {
      ...getFirebaseRuntimeDiagnostics(),
      currentUserId: auth.currentUser?.uid ?? null,
      hasFirebaseCookie: hasFirebaseIdTokenCookie(),
      navigationMode,
      nextPath: sanitizedNextPath,
      skipExistingSessionResolution: Boolean(options?.skipExistingSessionResolution),
    });
    const existingUser =
      auth.currentUser ??
      (options?.skipExistingSessionResolution ? null : await getResolvedFirebaseUser());

    if (existingUser) {
      await syncFirebaseSession(existingUser);
      logClientInfo("auth", "protected_navigation_authenticated", {
        ...getFirebaseRuntimeDiagnostics(),
        hasFirebaseCookie: hasFirebaseIdTokenCookie(),
        nextPath: sanitizedNextPath,
        userId: existingUser.uid,
      });
      window.location[navigationMode](sanitizedNextPath);
      return existingUser;
    }

    logClientInfo("auth", "google_popup_started", {
      ...getFirebaseRuntimeDiagnostics(),
      hasFirebaseCookie: hasFirebaseIdTokenCookie(),
      nextPath: sanitizedNextPath,
    });
    const result = await signInWithPopup(auth, createGoogleProvider());
    const popupUser =
      result.user ?? auth.currentUser ?? (await getResolvedFirebaseUser());

    if (!popupUser) {
      throw new Error("Google sign-in completed without returning a Firebase user.");
    }

    await syncFirebaseSession(popupUser);
    logClientInfo("auth", "google_popup_completed", {
      ...getFirebaseRuntimeDiagnostics(),
      hasFirebaseCookie: hasFirebaseIdTokenCookie(),
      nextPath: sanitizedNextPath,
      userId: popupUser.uid,
    });
    window.location[navigationMode](sanitizedNextPath);
    return popupUser;
  } catch (error) {
    logClientError("auth", "google_popup_failed", error, {
      nextPath: sanitizedNextPath,
    });
    throw error;
  }
}
