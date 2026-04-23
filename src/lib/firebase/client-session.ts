"use client";

import {
  FIREBASE_ID_TOKEN_COOKIE_MAX_AGE_SECONDS,
  FIREBASE_ID_TOKEN_COOKIE_NAME,
} from "@/lib/firebase/session";

function getCookieAttributes(maxAgeSeconds: number) {
  const attributes = [
    "Path=/",
    `Max-Age=${maxAgeSeconds}`,
    "SameSite=Lax",
  ];

  if (window.location.protocol === "https:") {
    attributes.push("Secure");
  }

  return attributes.join("; ");
}

export function clearFirebaseIdTokenCookie() {
  document.cookie = `${FIREBASE_ID_TOKEN_COOKIE_NAME}=; ${getCookieAttributes(0)}`;
}

export function writeFirebaseIdTokenCookie(token: string) {
  document.cookie = `${FIREBASE_ID_TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; ${getCookieAttributes(FIREBASE_ID_TOKEN_COOKIE_MAX_AGE_SECONDS)}`;
}

export function hasFirebaseIdTokenCookie() {
  return document.cookie
    .split(";")
    .map((item) => item.trim())
    .some((item) => item.startsWith(`${FIREBASE_ID_TOKEN_COOKIE_NAME}=`));
}
