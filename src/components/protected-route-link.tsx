"use client";

import type { MouseEvent, ReactNode } from "react";
import { useState } from "react";
import { continueToProtectedPathWithGoogleSignIn } from "@/lib/firebase/google-sign-in";
import { buildSignInPath, sanitizeNextPath } from "@/lib/routing";

type ProtectedRouteLinkProps = {
  children: ReactNode;
  className?: string;
  href: string;
};

export function ProtectedRouteLink({
  children,
  className,
  href,
}: ProtectedRouteLinkProps) {
  const nextPath = sanitizeNextPath(href);
  const signInPath = buildSignInPath(nextPath);
  const [isRedirecting, setIsRedirecting] = useState(false);

  async function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();

    if (isRedirecting) {
      return;
    }

    setIsRedirecting(true);

    try {
      await continueToProtectedPathWithGoogleSignIn(nextPath);
    } catch {
      setIsRedirecting(false);
      window.location.assign(signInPath);
    }
  }

  return (
    <a
      aria-busy={isRedirecting || undefined}
      className={className}
      href={signInPath}
      onClick={(event) => {
        void handleClick(event);
      }}
    >
      {children}
    </a>
  );
}
