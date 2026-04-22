"use client";

import type { Auth, User } from "firebase/auth";
import {
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { writeFirebaseIdTokenCookie } from "@/lib/firebase/client-session";
import {
  createGoogleProvider,
  ensureFirebaseAuth,
  getResolvedFirebaseUser,
} from "@/lib/firebase/client";
import { logClientError, logClientInfo } from "@/lib/logging/client";
import { getDefaultProtectedPath, sanitizeNextPath } from "@/lib/routing";

const PENDING_GOOGLE_SIGN_IN_STORAGE_KEY =
  "host-hermes-agent.pending-google-sign-in";
const PENDING_GOOGLE_SIGN_IN_MAX_AGE_MS = 15 * 60 * 1000;
const FIREBASE_REDIRECT_RESULT_TIMEOUT_MS = 15000;

type PendingGoogleSignInState = {
  createdAt: number;
  nextPath: string;
};

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function getSanitizedPendingNextPath(nextPath: string) {
  return sanitizeNextPath(nextPath, getDefaultProtectedPath());
}

export function shouldPreferGooglePopupSignIn() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.location.protocol !== "https:";
}

export function clearPendingGoogleSignInPath() {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.removeItem(PENDING_GOOGLE_SIGN_IN_STORAGE_KEY);
}

export function storePendingGoogleSignInPath(nextPath: string) {
  if (!canUseSessionStorage()) {
    return;
  }

  const pendingState: PendingGoogleSignInState = {
    createdAt: Date.now(),
    nextPath: getSanitizedPendingNextPath(nextPath),
  };

  window.sessionStorage.setItem(
    PENDING_GOOGLE_SIGN_IN_STORAGE_KEY,
    JSON.stringify(pendingState),
  );
}

export function readPendingGoogleSignInPath() {
  if (!canUseSessionStorage()) {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(PENDING_GOOGLE_SIGN_IN_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const pendingState = JSON.parse(rawValue) as Partial<PendingGoogleSignInState>;

    if (
      typeof pendingState.createdAt !== "number" ||
      typeof pendingState.nextPath !== "string"
    ) {
      clearPendingGoogleSignInPath();
      return null;
    }

    if (Date.now() - pendingState.createdAt > PENDING_GOOGLE_SIGN_IN_MAX_AGE_MS) {
      clearPendingGoogleSignInPath();
      return null;
    }

    return getSanitizedPendingNextPath(pendingState.nextPath);
  } catch {
    clearPendingGoogleSignInPath();
    return null;
  }
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

export function getGoogleSignInErrorMessage(error: unknown) {
  const code = getFirebaseAuthErrorCode(error);

  switch (code) {
    case "auth/operation-not-allowed":
      return "Google sign-in is not enabled for this Firebase project.";
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
  logClientInfo("auth", "session.synced_from_user", {
    userId: user.uid,
  });

  return token;
}

function resolveWithTimeout<T>(promise: Promise<T>, fallback: T, timeoutMs: number) {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      resolve(fallback);
    }, timeoutMs);

    promise.then(
      (value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

async function getRedirectResultWithTimeout(auth: Auth) {
  return resolveWithTimeout(
    getRedirectResult(auth),
    null,
    FIREBASE_REDIRECT_RESULT_TIMEOUT_MS,
  );
}

export async function resolveExistingGoogleSession() {
  const auth = await ensureFirebaseAuth();
  const redirectResult = await getRedirectResultWithTimeout(auth);
  const user = redirectResult?.user ?? auth.currentUser ?? (await getResolvedFirebaseUser());

  if (!user) {
    return null;
  }

  await syncFirebaseSession(user);
  return user;
}

async function continueWithGooglePopup(
  auth: Auth,
  nextPath: string,
  navigationMode: "assign" | "replace",
) {
  const result = await signInWithPopup(auth, createGoogleProvider());
  const user = result.user ?? auth.currentUser ?? (await getResolvedFirebaseUser());

  if (!user) {
    throw new Error("Google sign-in completed without returning a Firebase user.");
  }

  await syncFirebaseSession(user);
  clearPendingGoogleSignInPath();
  logClientInfo("auth", "google_popup_completed", {
    nextPath,
    userId: user.uid,
  });
  window.location[navigationMode](nextPath);

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
    const shouldUsePopup = shouldPreferGooglePopupSignIn();
    const existingUser = options?.skipExistingSessionResolution
      ? auth.currentUser
      : shouldUsePopup
        ? auth.currentUser ?? (await getResolvedFirebaseUser())
        : await resolveExistingGoogleSession();

    if (existingUser) {
      clearPendingGoogleSignInPath();
      logClientInfo("auth", "protected_navigation_authenticated", {
        nextPath: sanitizedNextPath,
        userId: existingUser.uid,
      });
      window.location[navigationMode](sanitizedNextPath);
      return existingUser;
    }

    if (shouldUsePopup) {
      logClientInfo("auth", "google_popup_started", {
        nextPath: sanitizedNextPath,
      });

      return await continueWithGooglePopup(
        auth,
        sanitizedNextPath,
        navigationMode,
      );
    }

    storePendingGoogleSignInPath(sanitizedNextPath);
    logClientInfo("auth", "google_redirect_started", {
      nextPath: sanitizedNextPath,
    });
    await signInWithRedirect(auth, createGoogleProvider());
    return null;
  } catch (error) {
    clearPendingGoogleSignInPath();
    logClientError("auth", "google_redirect_failed", error, {
      nextPath: sanitizedNextPath,
    });
    throw error;
  }
}
