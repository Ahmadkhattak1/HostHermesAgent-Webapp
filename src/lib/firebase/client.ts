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

function getBrowserAuthDomain() {
  if (typeof window === "undefined") {
    return null;
  }

  const { host, protocol } = window.location;

  if (protocol !== "https:") {
    return null;
  }

  // Same-origin Firebase auth helpers require the app origin itself to be HTTPS.
  return host || null;
}

function getFirebaseConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain =
    getBrowserAuthDomain() ?? process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
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

    persistencePromise = setPersistence(auth, browserLocalPersistence).then(
      () => auth,
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

  return new Promise<User | null>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      unsubscribe();
      resolve(auth.currentUser ?? null);
    }, 4000);

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        window.clearTimeout(timeoutId);
        unsubscribe();
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
