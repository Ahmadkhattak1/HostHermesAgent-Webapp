"use client";

import { useEffect, useState } from "react";
import styles from "@/app/console.module.css";
import { controlPlaneFetch } from "@/lib/control-plane/client";
import {
  clearClientLogs,
  getClientLogs,
  logClientError,
  type LogEntry,
} from "@/lib/logging/client";

type DebugLogsEnvelope = {
  requestId?: string;
  serverLogs: LogEntry[];
};

function formatLogValue(value: unknown) {
  if (value === undefined) {
    return null;
  }

  return JSON.stringify(value, null, 2);
}

function DebugLogCard({ entry }: { entry: LogEntry }) {
  const data = formatLogValue(entry.data);
  const error = formatLogValue(entry.error);

  return (
    <article className={styles.debugLogCard}>
      <div className={styles.debugLogHeader}>
        <div className={styles.debugLogHeaderText}>
          <p className={styles.debugLogEvent}>{entry.event}</p>
          <p className={styles.debugLogMeta}>
            {entry.origin} · {entry.scope}
            {entry.requestId ? ` · req ${entry.requestId}` : ""}
          </p>
        </div>
        <div className={styles.debugLogMetaBlock}>
          <span className={styles.debugLogLevel}>{entry.level}</span>
          <span className={styles.debugLogTimestamp}>
            {new Date(entry.timestamp).toLocaleString()}
          </span>
        </div>
      </div>

      {data ? <pre className={styles.debugLogPre}>{data}</pre> : null}
      {error ? <pre className={styles.debugLogPre}>{error}</pre> : null}
    </article>
  );
}

export function DebugLogsConsole() {
  const [clientLogs, setClientLogs] = useState<LogEntry[]>([]);
  const [serverLogs, setServerLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);

  async function refreshLogs() {
    setError(null);
    setIsRefreshing(true);

    try {
      const payload = await controlPlaneFetch<DebugLogsEnvelope>("/api/v1/debug/logs");
      setServerLogs(payload.serverLogs);
      setClientLogs(getClientLogs());
      setLastRefreshedAt(new Date().toISOString());
    } catch (caughtError) {
      logClientError("debug", "logs.refresh_failed", caughtError);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not load debug logs right now.",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  async function clearLogs() {
    setError(null);
    setIsClearing(true);

    try {
      await controlPlaneFetch<{ ok: true }>("/api/v1/debug/logs", {
        method: "DELETE",
      });
      clearClientLogs();
      setServerLogs([]);
      setClientLogs([]);
      setLastRefreshedAt(new Date().toISOString());
    } catch (caughtError) {
      logClientError("debug", "logs.clear_failed", caughtError);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not clear debug logs right now.",
      );
    } finally {
      setIsClearing(false);
    }
  }

  useEffect(() => {
    void refreshLogs();
  }, []);

  return (
    <div className={styles.debugLogsPanel}>
      <div className={styles.debugLogsIntro}>
        <h1 className={styles.debugLogsTitle}>Debug Logs</h1>
        <p className={styles.debugLogsCopy}>
          Reproduce the issue in the terminal, then refresh here. Client logs come from
          your browser session; server logs come from the control plane.
        </p>
      </div>

      <section className={styles.settingsSection}>
        <div className={styles.debugLogsToolbar}>
          <p className={styles.debugLogsToolbarNote}>
            {lastRefreshedAt
              ? `Last refreshed ${new Date(lastRefreshedAt).toLocaleString()}.`
              : "Logs have not been refreshed yet."}
          </p>
          <div className={styles.debugLogsActionRow}>
            <button
              className={styles.debugLogsButton}
              type="button"
              disabled={isRefreshing || isClearing}
              onClick={() => {
                void refreshLogs();
              }}
            >
              {isRefreshing ? "Refreshing..." : "Refresh logs"}
            </button>
            <button
              className={styles.debugLogsButton}
              type="button"
              disabled={isRefreshing || isClearing}
              onClick={() => {
                void clearLogs();
              }}
            >
              {isClearing ? "Clearing..." : "Clear logs"}
            </button>
          </div>
        </div>
        {error ? <p className={styles.error}>{error}</p> : null}
      </section>

      <div className={styles.debugLogsGrid}>
        <section className={styles.debugLogsSection}>
          <div className={styles.debugLogsSectionHeader}>
            <div>
              <p className={styles.settingsSectionLabel}>Browser</p>
              <p className={styles.debugLogsSectionTitle}>Client logs</p>
            </div>
            <span className={styles.debugLogsCount}>{clientLogs.length}</span>
          </div>

          <div className={styles.debugLogsList}>
            {clientLogs.length === 0 && !isLoading ? (
              <p className={styles.note}>No client logs captured yet.</p>
            ) : null}
            {clientLogs.map((entry) => (
              <DebugLogCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>

        <section className={styles.debugLogsSection}>
          <div className={styles.debugLogsSectionHeader}>
            <div>
              <p className={styles.settingsSectionLabel}>Control Plane</p>
              <p className={styles.debugLogsSectionTitle}>Server logs</p>
            </div>
            <span className={styles.debugLogsCount}>{serverLogs.length}</span>
          </div>

          <div className={styles.debugLogsList}>
            {serverLogs.length === 0 && !isLoading ? (
              <p className={styles.note}>No server logs captured yet.</p>
            ) : null}
            {serverLogs.map((entry) => (
              <DebugLogCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
