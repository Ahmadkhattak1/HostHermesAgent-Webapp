"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logClientError, logClientInfo } from "@/lib/logging/client";

export function ClientLogBridge() {
  const pathname = usePathname();

  useEffect(() => {
    logClientInfo("navigation", "route.changed", {
      pathname,
    });
  }, [pathname]);

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

