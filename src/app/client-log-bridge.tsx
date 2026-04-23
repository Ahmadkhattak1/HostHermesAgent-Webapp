"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logClientError, logClientInfo, logClientWarn } from "@/lib/logging/client";

export function ClientLogBridge() {
  const pathname = usePathname();

  useEffect(() => {
    logClientInfo("navigation", "route.changed", {
      pathname,
    });
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (
      window.location.hostname === "localhost" &&
      window.location.protocol !== "https:"
    ) {
      logClientWarn("runtime", "localhost.insecure_origin", {
        href: window.location.href,
        note: "Redirect auth state can be lost if sign-in starts on http://localhost and returns to https://localhost.",
      });
    }
  }, []);

  useEffect(() => {
    function handleError(event: ErrorEvent) {
      logClientError("runtime", "window.error", event.error ?? event.message, {
        column: event.colno,
        filename: event.filename,
        line: event.lineno,
        message: event.message,
      });
    }

    function handleRejection(event: PromiseRejectionEvent) {
      logClientError("runtime", "window.unhandledrejection", event.reason);
    }

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
