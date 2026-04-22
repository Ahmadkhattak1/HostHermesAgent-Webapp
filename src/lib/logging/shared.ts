export type LogLevel = "debug" | "info" | "warn" | "error";
export type LogOrigin = "client" | "server";

export type LogEntry = {
  data?: unknown;
  error?: unknown;
  event: string;
  id: string;
  level: LogLevel;
  origin: LogOrigin;
  requestId?: string;
  scope: string;
  timestamp: string;
};

const REDACTED_FIELD_PATTERN =
  /authorization|cookie|key|pass|private|secret|token/i;
const MAX_DEPTH = 4;
const MAX_STRING_LENGTH = 1_500;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    (Object.getPrototypeOf(value) === Object.prototype ||
      Object.getPrototypeOf(value) === null)
  );
}

export function createLogId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }

  return sanitizeLogValue(error);
}

export function sanitizeLogValue(
  value: unknown,
  depth = 0,
  seen = new WeakSet<object>(),
): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string") {
    return value.length > MAX_STRING_LENGTH
      ? `${value.slice(0, MAX_STRING_LENGTH)}…`
      : value;
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return value;
  }

  if (typeof value === "function") {
    return `[Function ${value.name || "anonymous"}]`;
  }

  if (value instanceof Error) {
    return serializeError(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (depth >= MAX_DEPTH) {
    return "[MaxDepth]";
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLogValue(item, depth + 1, seen));
  }

  if (typeof value === "object") {
    if (seen.has(value)) {
      return "[Circular]";
    }

    seen.add(value);

    if (!isPlainObject(value)) {
      return String(value);
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        REDACTED_FIELD_PATTERN.test(key)
          ? "[REDACTED]"
          : sanitizeLogValue(nestedValue, depth + 1, seen),
      ]),
    );
  }

  return String(value);
}

export function formatLogEntry(entry: LogEntry) {
  return JSON.stringify(entry);
}

