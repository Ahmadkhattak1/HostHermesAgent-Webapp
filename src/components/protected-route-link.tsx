import type { ReactNode } from "react";
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

  return (
    <a className={className} href={buildSignInPath(nextPath)}>
      {children}
    </a>
  );
}
