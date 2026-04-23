"use client";

import { initializeApp, getApp, getApps } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";
import { logClientInfo, logClientWarn } from "@/lib/logging/client";

function getFirebaseConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!apiKey || !authDomain || !appId || !projectId) {
    throw new Error(
      "Missing Firebase web configuration. Check the NEXT_PUBLIC_FIREBASE_* environment variables.",
    );
  }

  return {
    apiKey,
    appId,
    authDomain,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  };
}

function getStorageAvailability(type: "localStorage" | "sessionStorage") {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return typeof window[type] !== "undefined";
  } catch {
    return false;
  }
}

export function getFirebaseRuntimeDiagnostics() {
  if (typeof window === "undefined") {
    return {
      environment: "server",
    };
  }

  return {
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? null,
    cookieEnabled: navigator.cookieEnabled,
    host: window.location.host,
    href: window.location.href,
    localStorageAvailable: getStorageAvailability("localStorage"),
    origin: window.location.origin,
    protocol: window.location.protocol,
    sessionStorageAvailable: getStorageAvailability("sessionStorage"),
  };
}

function getFirebaseApp() {
  if (!getApps().length) {
    return initializeApp(getFirebaseConfig());
  }

  return getApp();
}

let persistencePromise: Promise<Auth> | null = null;

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function ensureFirebaseAuth() {
  if (!persistencePromise) {
    const auth = getFirebaseAuth();
    logClientInfo("auth", "firebase.ensure_auth_started", {
      ...getFirebaseRuntimeDiagnostics(),
      currentUserId: auth.currentUser?.uid ?? null,
    });
    persistencePromise = setPersistence(auth, browserLocalPersistence).then(
      () => {
        logClientInfo("auth", "firebase.ensure_auth_ready", {
          ...getFirebaseRuntimeDiagnostics(),
          currentUserId: auth.currentUser?.uid ?? null,
          persistence: "browserLocalPersistence",
        });
        return auth;
      },
    );
  }

  return persistencePromise;
}

export function createGoogleProvider() {
  const provider = new GoogleAuthProvider();

  provider.setCustomParameters({
    prompt: "select_account",
  });

  return provider;
}

export async function getResolvedFirebaseUser() {
  const auth = await ensureFirebaseAuth();
  logClientInfo("auth", "firebase.resolve_user_started", {
    ...getFirebaseRuntimeDiagnostics(),
    currentUserId: auth.currentUser?.uid ?? null,
  });

  return new Promise<User | null>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      unsubscribe();
      logClientWarn("auth", "firebase.resolve_user_timed_out", {
        ...getFirebaseRuntimeDiagnostics(),
        currentUserId: auth.currentUser?.uid ?? null,
      });
      resolve(auth.currentUser ?? null);
    }, 4000);

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        window.clearTimeout(timeoutId);
        unsubscribe();
        logClientInfo("auth", "firebase.resolve_user_completed", {
          ...getFirebaseRuntimeDiagnostics(),
          resolvedUserId: user?.uid ?? null,
        });
        resolve(user);
      },
      (error) => {
        window.clearTimeout(timeoutId);
        unsubscribe();
        reject(error);
      },
    );
  });
}

export async function signOutFirebaseUser() {
  const auth = await ensureFirebaseAuth();
  await signOut(auth);
}
