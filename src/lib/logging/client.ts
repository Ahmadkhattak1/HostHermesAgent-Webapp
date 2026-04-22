"use client";

import {
  createLogId,
  sanitizeLogValue,
  serializeError,
  type LogEntry,
  type LogLevel,
} from "@/lib/logging/shared";

const CLIENT_LOG_STORAGE_KEY = "hostHermesClientLogs";
const MAX_CLIENT_LOGS = 400;

function getClientStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function consoleMethod(level: LogLevel) {
  switch (level) {
    case "debug":
      return console.debug;
    case "info":
      return console.info;
    case "warn":
      return console.warn;
    case "error":
      return console.error;
    default:
      return console.log;
  }
}

function readStoredLogs() {
  const storage = getClientStorage();

  if (!storage) {
    return [];
  }

  try {
    const raw = storage.getItem(CLIENT_LOG_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    return JSON.parse(raw) as LogEntry[];
  } catch {
    return [];
  }
}

function writeStoredLogs(logs: LogEntry[]) {
  const storage = getClientStorage();

  if (!storage) {
    return;
  }

  storage.setItem(CLIENT_LOG_STORAGE_KEY, JSON.stringify(logs));
}

export function logClient(
  level: LogLevel,
  scope: string,
  event: string,
  data?: unknown,
  error?: unknown,
) {
  const entry: LogEntry = {
    data: data === undefined ? undefined : sanitizeLogValue(data),
    error: error === undefined ? undefined : serializeError(error),
    event,
    id: createLogId(),
    level,
    origin: "client",
    scope,
    timestamp: new Date().toISOString(),
  };
  const logs = readStoredLogs();

  logs.push(entry);

  if (logs.length > MAX_CLIENT_LOGS) {
    logs.splice(0, logs.length - MAX_CLIENT_LOGS);
  }

  writeStoredLogs(logs);
  consoleMethod(level)(`[hosthermes:${scope}] ${event}`, entry.data, entry.error);

  return entry;
}

export function getClientLogs() {
  return [...readStoredLogs()].reverse();
}

export function clearClientLogs() {
  writeStoredLogs([]);
}

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

