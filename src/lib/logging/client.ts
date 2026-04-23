"use client";

import { createLogId, type LogEntry, type LogLevel } from "@/lib/logging/shared";

export function logClient(
  level: LogLevel,
  scope: string,
  event: string,
  data?: unknown,
  error?: unknown,
) {
  const entry: LogEntry = {
    data,
    error,
    event,
    id: createLogId(),
    level,
    origin: "client",
    scope,
    timestamp: new Date().toISOString(),
  };

  return entry;
}

export function getClientLogs() {
  return [];
}

export function clearClientLogs() {}

export function logClientInfo(scope: string, event: string, data?: unknown) {
  return logClient("info", scope, event, data);
}

export function logClientWarn(scope: string, event: string, data?: unknown) {
  return logClient("warn", scope, event, data);
}

export function logClientError(
  scope: string,
  event: string,
  error: unknown,
  data?: unknown,
) {
  return logClient("error", scope, event, data, error);
}
