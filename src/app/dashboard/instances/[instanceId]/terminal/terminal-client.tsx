"use client";

import "@xterm/xterm/css/xterm.css";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
import { Terminal } from "@xterm/xterm";
import styles from "@/app/console.module.css";
import { SupportContactButton } from "@/components/support-contact-button";
import { useAnimatedPresence } from "@/components/use-animated-presence";
import {
  getBrowserControlPlaneBaseUrl,
  controlPlaneFetch,
  controlPlaneJsonRequest,
} from "@/lib/control-plane/client";
import type {
  PublicInstanceRecord,
  TerminalMutationEnvelope,
  TerminalSessionEnvelope,
} from "@/lib/control-plane/types";
import { clearFirebaseIdTokenCookie } from "@/lib/firebase/client-session";
import { clearPendingGoogleSignInPath } from "@/lib/firebase/google-sign-in";
import { signOutFirebaseUser } from "@/lib/firebase/client";
import { logClientError, logClientInfo, logClientWarn } from "@/lib/logging/client";
import { sanitizeUserFacingErrorMessage } from "@/lib/user-facing-errors";

type TerminalClientProps = {
  instance: PublicInstanceRecord;
  viewerDisplayName: string | null;
  viewerEmail: string | null;
  viewerPhotoUrl: string | null;
};

type ConnectionState = "connecting" | "connected" | "error";
type TerminalAction = "open" | "reset" | "update";

type TerminalSocketServerMessage =
  | {
      cursor: number;
      type: "ready";
    }
  | {
      cursor: number;
      output: string;
      reset: boolean;
      type: "output";
    }
  | {
      type: "closed";
    }
  | {
      message: string;
      type: "error";
    }
  | {
      type: "pong";
    };

type TerminalSocketPayload = Record<string, number | string>;

function getTerminalSocketBaseUrl() {
  const url = new URL(getBrowserControlPlaneBaseUrl());
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/+$/, "");
}

function getLatencyLabel(instance: PublicInstanceRecord) {
  if (typeof instance.latencyMs === "number") {
    return `${instance.latencyMs}ms Latency`;
  }

  return "Checking Latency";
}

function getHostLabel(instance: PublicInstanceRecord) {
  return instance.host ?? instance.dropletName;
}

function getTerminalPromptLabel(instance: PublicInstanceRecord) {
  return `${instance.sshUser}@${getHostLabel(instance)}:~`;
}

function getViewerInitial(displayName: string | null, email: string | null) {
  const source = displayName?.trim() || email?.trim();

  if (!source) {
    return "H";
  }

  return source.charAt(0).toUpperCase() || "H";
}

function TerminalSidebarIcon() {
  return (
    <svg width="15" height="12" viewBox="0 0 15 12" fill="none" aria-hidden="true">
      <path
        d="M1.25 2.25C1.25 1.69772 1.69772 1.25 2.25 1.25H12.75C13.3023 1.25 13.75 1.69772 13.75 2.25V9.75C13.75 10.3023 13.3023 10.75 12.75 10.75H2.25C1.69772 10.75 1.25 10.3023 1.25 9.75V2.25Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M4 8L6 6L4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 8H10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg width="13" height="15" viewBox="0 0 13 15" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M4.9 5.35C4.9 4.46634 5.61634 3.75 6.5 3.75C7.38366 3.75 8.1 4.46634 8.1 5.35C8.1 6.55 6.5 6.8 6.5 7.8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="6.5" cy="10.35" r="0.6" fill="currentColor" />
    </svg>
  );
}

function OpenHermesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2.25 2.75C2.25 2.19772 2.69772 1.75 3.25 1.75H10.75C11.3023 1.75 11.75 2.19772 11.75 2.75V11.25C11.75 11.8023 11.3023 12.25 10.75 12.25H3.25C2.69772 12.25 2.25 11.8023 2.25 11.25V2.75Z"
        stroke="currentColor"
        strokeWidth="1.15"
      />
      <path
        d="M4.5 5.25L6.25 7L4.5 8.75"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7.5 8.75H9.5" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
    </svg>
  );
}

function UpdateHermesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M10.75 5.5A3.75 3.75 0 1 0 11 7"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <path
        d="M9.75 2.75H11.75V4.75"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.75 2.75L8.75 5.75"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InstallHermesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 2.25V8.25"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <path
        d="M4.75 6L7 8.25L9.25 6"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 10.5C2.5 9.94772 2.94772 9.5 3.5 9.5H10.5C11.0523 9.5 11.5 9.94772 11.5 10.5C11.5 11.0523 11.0523 11.5 10.5 11.5H3.5C2.94772 11.5 2.5 11.0523 2.5 10.5Z"
        stroke="currentColor"
        strokeWidth="1.15"
      />
    </svg>
  );
}

function LatencyIcon() {
  return (
    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
      <path
        d="M6 1.25C3.37665 1.25 1.25 3.37665 1.25 6C1.25 8.62335 3.37665 10.75 6 10.75C8.62335 10.75 10.75 8.62335 10.75 6C10.75 3.37665 8.62335 1.25 6 1.25Z"
        stroke="currentColor"
        strokeWidth="1.2"
        transform="translate(0 -1)"
      />
      <path d="M6 2.75V5.75L8 6.75" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PopOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M8.25 1.75H12.25V5.75"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.75 6.25L12.25 1.75"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.25 2.75H2.75C2.19772 2.75 1.75 3.19772 1.75 3.75V11.25C1.75 11.8023 2.19772 12.25 2.75 12.25H10.25C10.8023 12.25 11.25 11.8023 11.25 11.25V7.75"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 1.75L8.16667 2.33333L9.45833 2.125L10.1667 3.20833L11.4583 3.66667V5L12.25 6L11.4583 7V8.33333L10.1667 8.79167L9.45833 9.875L8.16667 9.66667L7 10.25L5.83333 9.66667L4.54167 9.875L3.83333 8.79167L2.54167 8.33333V7L1.75 6L2.54167 5V3.66667L3.83333 3.20833L4.54167 2.125L5.83333 2.33333L7 1.75Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="6" r="1.65" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M5.25 2H3.75C3.19772 2 2.75 2.44772 2.75 3V11C2.75 11.5523 3.19772 12 3.75 12H5.25"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 4.25L11.25 7L8.5 9.75"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 7H11"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SidebarToggleIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 3.5H13.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M2.5 8H9.75"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M2.5 12.5H13.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d={isOpen ? "M12 6.25L9.75 8L12 9.75" : "M10 6.25L12.25 8L10 9.75"}
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TerminalClient({
  instance,
  viewerDisplayName,
  viewerEmail,
  viewerPhotoUrl,
}: TerminalClientProps) {
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const profileTriggerRef = useRef<HTMLButtonElement | null>(null);
  const isPopout = searchParams.get("popout") === "1";
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [pendingTerminalAction, setPendingTerminalAction] = useState<TerminalAction | null>(null);
  const [terminalActionNotice, setTerminalActionNotice] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const {
    isMounted: isProfileMenuMounted,
    state: profileMenuState,
  } = useAnimatedPresence(isProfileMenuOpen, 180);

  useEffect(() => {
    logClientInfo("terminal", "view.loaded", {
      instanceId: instance.id,
      publicIpv4: instance.publicIpv4,
    });
  }, [instance.id, instance.publicIpv4]);

  useEffect(() => {
    if (!isPopout) {
      return;
    }

    try {
      window.moveTo(0, 0);
      window.resizeTo(window.screen.availWidth, window.screen.availHeight);
    } catch {
      // Ignore browser restrictions on popup positioning and sizing.
    }
  }, [isPopout]);

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        (profileMenuRef.current?.contains(target) ||
          profileTriggerRef.current?.contains(target))
      ) {
        return;
      }

      setIsProfileMenuOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      setIsProfileMenuOpen(false);
      profileTriggerRef.current?.focus();
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileMenuOpen]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    let cancelled = false;
    let heartbeatTimer: number | null = null;
    let reconnectTimer: number | null = null;
    let reconnectAttempt = 0;
    let socketMessageErrorLogged = false;
    let manualShutdown = false;
    let sessionId: string | null = null;
    let webSocket: WebSocket | null = null;
    let webglAddon: WebglAddon | null = null;
    let resizeFrame: number | null = null;
    let lastResizeSignature: string | null = null;
    let lastViewportSignature: string | null = null;

    const terminal = new Terminal({
      convertEol: true,
      cursorBlink: true,
      fontFamily: "'Liberation Mono', 'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
      fontSize: 14,
      rows: 36,
      scrollback: 10_000,
      scrollOnEraseInDisplay: true,
      scrollOnUserInput: false,
      smoothScrollDuration: 0,
      theme: {
        background: "#0a0a0a",
        black: "#0a0a0a",
        blue: "#3b82f6",
        brightBlue: "#60a5fa",
        brightGreen: "#34d399",
        cursor: "#d4d4d8",
        foreground: "#e5e5e5",
        green: "#10b981",
      },
    });
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(container);
    terminalRef.current = terminal;
    fitAddon.fit();
    try {
      webglAddon = new WebglAddon();
      webglAddon.onContextLoss(() => {
        webglAddon?.dispose();
        webglAddon = null;
      });
      terminal.loadAddon(webglAddon);
    } catch {
      webglAddon = null;
    }
    terminal.focus();
    terminal.writeln("Connecting to your Hermes instance...");

    function clearHeartbeat() {
      if (heartbeatTimer !== null) {
        window.clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
    }

    async function releaseSession(targetSessionId: string | null) {
      if (!targetSessionId) {
        return;
      }

      try {
        await controlPlaneFetch<TerminalMutationEnvelope>(
          `/api/v1/instances/${instance.id}/terminal/session?sessionId=${encodeURIComponent(targetSessionId)}`,
          {
            method: "DELETE",
          },
        );
      } catch {
        // Ignore release errors. The backend TTL cleanup will eventually reap any orphaned sessions.
      }
    }

    function setTerminalError(message: string, caughtError?: unknown) {
      if (cancelled) {
        return;
      }

      if (caughtError) {
        logClientError("terminal", "socket.failed", caughtError, {
          instanceId: instance.id,
          sessionId,
        });
      }

      setConnectionState("error");
      setError(sanitizeUserFacingErrorMessage(message));
    }

    function sendSocketMessage(payload: TerminalSocketPayload) {
      if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
        return;
      }

      webSocket.send(JSON.stringify(payload));
    }

    function syncTerminalSize(reason: string) {
      fitAddon.fit();
      const nextSignature = `${terminal.cols}x${terminal.rows}`;

      if (nextSignature === lastResizeSignature) {
        return;
      }

      lastResizeSignature = nextSignature;
      logClientInfo("terminal", "resize.sent", {
        instanceId: instance.id,
        reason,
        sessionId,
        size: nextSignature,
      });
      sendSocketMessage({
        cols: terminal.cols,
        rows: terminal.rows,
        type: "resize",
      });
    }

    function scheduleTerminalFit(reason: string) {
      if (resizeFrame !== null) {
        window.cancelAnimationFrame(resizeFrame);
      }

      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = null;
        syncTerminalSize(reason);
      });
    }

    function focusTerminal(reason: string) {
      terminal.focus();
      logClientInfo("terminal", "focus.requested", {
        instanceId: instance.id,
        reason,
      });
    }

    async function connectSocket(existingSessionId: string, existingSocketToken: string) {
      const socketUrl = new URL(
        `/ws/instances/${encodeURIComponent(instance.id)}/terminal`,
        `${getTerminalSocketBaseUrl()}/`,
      );
      socketUrl.searchParams.set("sessionId", existingSessionId);
      socketUrl.searchParams.set("token", existingSocketToken);

      const socket = new WebSocket(socketUrl.toString());
      webSocket = socket;

      socket.addEventListener("open", () => {
        if (cancelled || webSocket !== socket) {
          return;
        }

        reconnectAttempt = 0;
        socketMessageErrorLogged = false;
        logClientInfo("terminal", "socket.opened", {
          instanceId: instance.id,
          sessionId: existingSessionId,
        });
        setConnectionState("connected");
        setError(null);
        scheduleTerminalFit("socket_open");
        focusTerminal("socket_open");
        heartbeatTimer = window.setInterval(() => {
          sendSocketMessage({
            type: "ping",
          });
        }, 20_000);
      });

      socket.addEventListener("message", (event) => {
        if (cancelled || webSocket !== socket) {
          return;
        }

        let payload: TerminalSocketServerMessage;

        try {
          payload = JSON.parse(String(event.data)) as TerminalSocketServerMessage;
        } catch (caughtError) {
          if (!socketMessageErrorLogged) {
            socketMessageErrorLogged = true;
            setTerminalError("Could not read terminal output.", caughtError);
          }
          return;
        }

        if (payload.type === "ready") {
          logClientInfo("terminal", "socket.ready", {
            instanceId: instance.id,
            sessionId: existingSessionId,
          });
          setConnectionState("connected");
          return;
        }

        if (payload.type === "output") {
          if (payload.reset) {
            terminal.clear();
          }

          if (payload.output) {
            terminal.write(payload.output);
          }

          return;
        }

        if (payload.type === "closed") {
          logClientWarn("terminal", "socket.server_closed", {
            instanceId: instance.id,
            sessionId: existingSessionId,
          });
          setConnectionState("connecting");
          terminal.writeln("\r\n[HostHermes] Reconnecting your terminal...\r\n");
          void openTerminalSession(true);
          return;
        }

        if (payload.type === "error") {
          setTerminalError(payload.message);
        }
      });

      socket.addEventListener("close", (event) => {
        if (cancelled || manualShutdown || webSocket !== socket) {
          return;
        }

        clearHeartbeat();
        logClientInfo("terminal", "socket.closed", {
          code: event.code,
          instanceId: instance.id,
          reason: event.reason || null,
          sessionId: existingSessionId,
          wasClean: event.wasClean,
        });

        setConnectionState("connecting");
        terminal.writeln("\r\n[HostHermes] Connection interrupted. Reconnecting...\r\n");
        void openTerminalSession(true);
      });

      socket.addEventListener("error", () => {
        if (cancelled || manualShutdown || webSocket !== socket) {
          return;
        }

        logClientInfo("terminal", "socket.error", {
          instanceId: instance.id,
          sessionId: existingSessionId,
        });
      });
    }

    async function openTerminalSession(isReconnect = false) {
      if (cancelled) {
        return;
      }

      if (reconnectTimer !== null) {
        window.clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      clearHeartbeat();

      if (webSocket) {
        webSocket.close();
        webSocket = null;
      }

      const previousSessionId = sessionId;
      sessionId = null;
      sessionIdRef.current = null;

      if (isReconnect) {
        reconnectAttempt += 1;
        logClientInfo("terminal", "session.reconnect_attempt", {
          attempt: reconnectAttempt,
          instanceId: instance.id,
          previousSessionId,
        });
        await releaseSession(previousSessionId);
      } else {
        logClientInfo("terminal", "session.open_started", {
          instanceId: instance.id,
        });
      }

      try {
        const session = await controlPlaneJsonRequest<TerminalSessionEnvelope>(
          `/api/v1/instances/${instance.id}/terminal/session`,
          "POST",
          {
            cols: terminal.cols,
            rows: terminal.rows,
          },
        );

        if (cancelled) {
          await releaseSession(session.sessionId);
          return;
        }

        sessionId = session.sessionId;
        sessionIdRef.current = session.sessionId;
        if (session.autoInstallStarted) {
          setTerminalActionNotice(
            "Started the Hermes installer automatically for this instance's first terminal session.",
          );
        } else if (!isReconnect) {
          setTerminalActionNotice(null);
        }
        await connectSocket(session.sessionId, session.socketToken);
      } catch (caughtError: unknown) {
        if (cancelled) {
          return;
        }

        logClientError(
          "terminal",
          isReconnect ? "session.reconnect_failed" : "session.open_failed",
          caughtError,
          {
            attempt: isReconnect ? reconnectAttempt : undefined,
            instanceId: instance.id,
          },
        );

        if (reconnectAttempt >= 5) {
          setTerminalError(
            caughtError instanceof Error
              ? caughtError.message
              : "Could not reopen the terminal session.",
          );
          return;
        }

        const delayMs = Math.min(1_000 * reconnectAttempt, 5_000);
        reconnectTimer = window.setTimeout(() => {
          void openTerminalSession(true);
        }, delayMs);
      }
    }

    const disposeInput = terminal.onData((input) => {
      sendSocketMessage({
        input,
        type: "input",
      });
    });

    const resizeObserver = new ResizeObserver(() => {
      const nextViewportSignature = `${container.clientWidth}x${container.clientHeight}`;

      if (nextViewportSignature === lastViewportSignature) {
        return;
      }

      lastViewportSignature = nextViewportSignature;
      scheduleTerminalFit("resize_observer");
    });

    resizeObserver.observe(container);

    const handleWindowFocus = () => {
      focusTerminal("window_focus");
    };

    const handleVisibilityChange = () => {
      logClientInfo("terminal", "visibility.changed", {
        instanceId: instance.id,
        state: document.visibilityState,
      });

      if (document.visibilityState === "visible") {
        focusTerminal("visibility_change");
      }
    };

    const handleWindowResize = () => {
      scheduleTerminalFit("window_resize");
    };

    const handleOrientationChange = () => {
      scheduleTerminalFit("orientation_change");
    };

    const handleViewportResize = () => {
      scheduleTerminalFit("visual_viewport_resize");
    };

    window.addEventListener("resize", handleWindowResize);
    window.addEventListener("orientationchange", handleOrientationChange);
    window.visualViewport?.addEventListener("resize", handleViewportResize);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    void document.fonts?.ready.then(() => {
      scheduleTerminalFit("fonts_ready");
    });
    scheduleTerminalFit("initial_layout");
    window.setTimeout(() => {
      focusTerminal("initial_mount");
    }, 0);
    void openTerminalSession(false);

    return () => {
      cancelled = true;
      manualShutdown = true;

      if (reconnectTimer !== null) {
        window.clearTimeout(reconnectTimer);
      }

      clearHeartbeat();

      if (resizeFrame !== null) {
        window.cancelAnimationFrame(resizeFrame);
      }

      if (webSocket) {
        webSocket.close();
      }

      disposeInput.dispose();
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleWindowResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.visualViewport?.removeEventListener("resize", handleViewportResize);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      terminalRef.current = null;
      sessionIdRef.current = null;
      webglAddon?.dispose();
      terminal.dispose();

      if (sessionId) {
        logClientInfo("terminal", "session.close_requested", {
          instanceId: instance.id,
          sessionId,
        });
        void releaseSession(sessionId);
      }
    };
  }, [instance.id]);

  const promptLabel = getTerminalPromptLabel(instance);
  const hostLabel = getHostLabel(instance);
  const avatarInitial = getViewerInitial(viewerDisplayName, viewerEmail);
  const viewerLabel = viewerDisplayName ?? viewerEmail ?? "Hermes User";
  const showSidebar = !isPopout && !isSidebarCollapsed;
  const connectionLabel =
    connectionState === "connected"
      ? "Connected"
      : connectionState === "connecting"
        ? "Connecting"
        : "Connection issue";

  async function runTerminalAction(action: TerminalAction) {
    const activeSessionId = sessionIdRef.current;

    if (!activeSessionId) {
      setError("Open the terminal connection before running this action.");
      return;
    }

    if (
      !window.confirm(
        action === "open"
          ? "Open Hermes agent in this machine shell?"
          : action === "update"
            ? "Update Hermes Agent on this instance? This will interrupt the current foreground terminal program and run `hermes update` in this machine shell."
            : "Reset and install Hermes agent on this instance? This will interrupt the current foreground terminal program and run `curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash` in this machine shell.",
      )
    ) {
      return;
    }

    setPendingTerminalAction(action);
    setTerminalActionNotice(null);
    setError(null);

    try {
      await controlPlaneJsonRequest<TerminalMutationEnvelope>(
        `/api/v1/instances/${instance.id}/terminal/action`,
        "POST",
        {
          action,
          sessionId: activeSessionId,
        },
      );
      setTerminalActionNotice(
        action === "open"
          ? "Tried to open Hermes agent in the current machine shell."
          : action === "update"
          ? "Sent `hermes update` to the current machine shell."
          : "Sent the Hermes installer command to the current machine shell.",
      );
    } catch (caughtError: unknown) {
      const fallbackMessage =
        action === "open"
          ? "Could not open Hermes Agent in the current shell."
          : action === "update"
            ? "Could not start the Hermes Agent update."
            : "Could not reset the Hermes Agent installation.";

      setError(
        sanitizeUserFacingErrorMessage(
          caughtError instanceof Error ? caughtError.message : fallbackMessage,
        ),
      );
    } finally {
      setPendingTerminalAction(null);
    }
  }

  return (
    <div
      className={`${styles.terminalAppShell} ${
        isPopout ? styles.terminalAppShellPopout : ""
      }`}
    >
      {!isPopout ? (
        <aside
          className={`${styles.terminalSidebar} ${
            showSidebar ? "" : styles.terminalSidebarCollapsed
          }`}
          aria-hidden={!showSidebar}
        >
          <div className={styles.terminalSidebarBrandWrap}>
            <div className={styles.terminalSidebarBrand}>
              <div className={styles.terminalSidebarMark}>
                <Image
                  src="/assets/figma/app-logo.png"
                  alt=""
                  width={40}
                  height={40}
                  priority
                />
              </div>
              <span className={styles.terminalSidebarBrandName}>Hermes Agent</span>
            </div>
          </div>

          <nav className={styles.terminalSidebarNav} aria-label="Terminal">
            <div className={styles.terminalSidebarItemActive}>
              <TerminalSidebarIcon />
              <span>Terminal</span>
            </div>
            <p className={styles.terminalSidebarSubnavLabel}>Commands</p>
            <div className={styles.terminalSidebarSubnav}>
              <button
                className={styles.terminalSidebarSubLink}
                disabled={pendingTerminalAction !== null}
                onClick={() => void runTerminalAction("open")}
                type="button"
              >
                <span className={styles.terminalSidebarCommandIcon}>
                  <OpenHermesIcon />
                </span>
                <span className={styles.terminalSidebarCommandCopy}>
                  <span className={styles.terminalSidebarCommandLabel}>
                    {pendingTerminalAction === "open" ? "Opening Hermes..." : "Open Hermes agent"}
                  </span>
                  <span className={styles.terminalSidebarCommandHint}>`hermes`</span>
                </span>
              </button>
              <button
                className={styles.terminalSidebarSubLink}
                disabled={pendingTerminalAction !== null}
                onClick={() => void runTerminalAction("update")}
                type="button"
              >
                <span className={styles.terminalSidebarCommandIcon}>
                  <UpdateHermesIcon />
                </span>
                <span className={styles.terminalSidebarCommandCopy}>
                  <span className={styles.terminalSidebarCommandLabel}>
                    {pendingTerminalAction === "update" ? "Checking for update..." : "Check for Update"}
                  </span>
                  <span className={styles.terminalSidebarCommandHint}>`hermes update`</span>
                </span>
              </button>
              <button
                className={styles.terminalSidebarSubLink}
                disabled={pendingTerminalAction !== null}
                onClick={() => void runTerminalAction("reset")}
                type="button"
              >
                <span className={styles.terminalSidebarCommandIcon}>
                  <InstallHermesIcon />
                </span>
                <span className={styles.terminalSidebarCommandCopy}>
                  <span className={styles.terminalSidebarCommandLabel}>
                    {pendingTerminalAction === "reset" ? "Resetting and installing..." : "Reset and install Hermes agent"}
                  </span>
                  <span className={styles.terminalSidebarCommandHint}>`curl ... | bash`</span>
                </span>
              </button>
            </div>
          </nav>

          <div className={styles.terminalSidebarFooter}>
            <SupportContactButton buttonClassName={styles.terminalSidebarSupportButton}>
              <SupportIcon />
              <span>Support</span>
            </SupportContactButton>
          </div>
        </aside>
      ) : null}

      <section className={styles.terminalWorkspace}>
        {!isPopout ? (
          <header className={styles.terminalWorkspaceHeader}>
            <div className={styles.terminalWorkspaceHeaderLead}>
              <button
                className={styles.terminalSidebarToggle}
                type="button"
                aria-expanded={showSidebar}
                aria-label={showSidebar ? "Close sidebar" : "Open sidebar"}
                onClick={() => {
                  setIsSidebarCollapsed((current) => !current);
                }}
              >
                <SidebarToggleIcon isOpen={showSidebar} />
              </button>
            </div>
            <div className={styles.terminalWorkspaceProfile}>
              <div className={styles.terminalWorkspaceDivider} />
              <div className={styles.terminalProfileMenuShell}>
                <button
                  ref={profileTriggerRef}
                  className={styles.terminalProfileTrigger}
                  type="button"
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="menu"
                  aria-label="Open account menu"
                  onClick={() => {
                    setProfileError(null);
                    setIsProfileMenuOpen((current) => !current);
                  }}
                >
                  <div className={styles.terminalWorkspaceAvatar}>
                    {viewerPhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={viewerPhotoUrl} alt="" referrerPolicy="no-referrer" />
                    ) : (
                      <span>{avatarInitial}</span>
                    )}
                  </div>
                </button>

                {isProfileMenuMounted ? (
                  <div
                    ref={profileMenuRef}
                    className={styles.terminalProfileMenu}
                    data-state={profileMenuState}
                    role="menu"
                    aria-label="Account menu"
                  >
                    <div className={styles.terminalProfileMenuMeta}>
                      <p className={styles.terminalProfileMenuName}>{viewerLabel}</p>
                      {viewerEmail ? (
                        <p className={styles.terminalProfileMenuEmail}>{viewerEmail}</p>
                      ) : null}
                    </div>

                    <Link
                      className={styles.terminalProfileMenuLink}
                      href="/dashboard/settings"
                      role="menuitem"
                      onClick={() => {
                        setProfileError(null);
                        setIsProfileMenuOpen(false);
                      }}
                    >
                      <SettingsIcon />
                      <span>Settings</span>
                    </Link>

                    <button
                      className={styles.terminalProfileMenuButton}
                      type="button"
                      role="menuitem"
                      disabled={isSigningOut}
                      onClick={() => {
                        void (async () => {
                          try {
                            setProfileError(null);
                            setIsSigningOut(true);
                            logClientInfo("auth", "sign_out_started", {
                              instanceId: instance.id,
                            });
                            await signOutFirebaseUser();
                            clearPendingGoogleSignInPath();
                            clearFirebaseIdTokenCookie();
                            logClientInfo("auth", "sign_out_completed", {
                              instanceId: instance.id,
                            });
                            window.location.assign("/");
                          } catch (caughtError) {
                            logClientError("auth", "sign_out_failed", caughtError, {
                              instanceId: instance.id,
                            });
                            setProfileError("Could not sign out right now. Please try again.");
                            setIsSigningOut(false);
                          }
                        })();
                      }}
                    >
                      <SignOutIcon />
                      <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
                    </button>

                    {profileError ? (
                      <p className={styles.terminalProfileMenuError}>{profileError}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </header>
        ) : null}

        <div
          className={`${styles.terminalWorkspaceCanvas} ${
            isPopout ? styles.terminalWorkspaceCanvasPopout : ""
          }`}
        >
          <div
            className={`${styles.terminalWorkspaceContent} ${
              isPopout ? styles.terminalWorkspaceContentPopout : ""
            }`}
          >
            <div className={styles.terminalShellColumn}>
              {!isPopout ? (
                <div className={styles.terminalOverviewRow}>
                  <div className={styles.terminalOverviewCopy}>
                    <h1 className={styles.terminalOverviewTitle}>Terminal Shell</h1>
                    <p className={styles.terminalOverviewSubtitle}>
                      Direct access to {hostLabel}.
                    </p>
                  </div>

                  <div className={styles.terminalOverviewActions}>
                    <div className={styles.terminalLatencyBadge}>
                      <LatencyIcon />
                      <span>{getLatencyLabel(instance)}</span>
                    </div>
                    <button
                      className={styles.terminalPopoutButton}
                      type="button"
                      onClick={() => {
                        const popupUrl = new URL(window.location.href);
                        popupUrl.searchParams.set("popout", "1");

                        const popup = window.open(
                          popupUrl.toString(),
                          "_blank",
                          [
                            "popup=yes",
                            "noopener",
                            "noreferrer",
                            "menubar=no",
                            "toolbar=no",
                            "location=no",
                            "status=no",
                            "scrollbars=yes",
                            "resizable=yes",
                            "left=0",
                            "top=0",
                            `width=${window.screen.availWidth}`,
                            `height=${window.screen.availHeight}`,
                          ].join(","),
                        );

                        popup?.focus();

                        try {
                          popup?.moveTo(0, 0);
                          popup?.resizeTo(
                            window.screen.availWidth,
                            window.screen.availHeight,
                          );
                        } catch {
                          // Ignore browser restrictions on popup positioning and sizing.
                        }
                      }}
                    >
                      <PopOutIcon />
                      <span>Pop Out</span>
                    </button>
                  </div>
                </div>
              ) : null}

              <div
                className={`${styles.terminalShellViewportFrame} ${
                  isPopout ? styles.terminalShellViewportFramePopout : ""
                }`}
              >
                <div
                  className={`${styles.terminalShellCard} ${
                    isPopout ? styles.terminalShellCardPopout : ""
                  }`}
                  onPointerDown={() => {
                    terminalRef.current?.focus();
                    logClientInfo("terminal", "focus.requested", {
                      instanceId: instance.id,
                      reason: "pointer_down",
                    });
                  }}
                >
                  {!isPopout ? (
                    <div className={styles.terminalShellBar}>
                      <span className={styles.terminalPromptLabel}>{promptLabel}</span>
                    </div>
                  ) : null}
                  <div
                    ref={containerRef}
                    className={`${styles.terminalViewport} ${
                      isPopout ? styles.terminalViewportPopout : ""
                    }`}
                  />
                  {!isPopout ? (
                    <div className={styles.terminalFooterBar}>
                      <span
                        className={`${styles.terminalFooterStatus} ${
                          connectionState === "connected"
                            ? styles.terminalFooterStatusConnected
                            : connectionState === "error"
                              ? styles.terminalFooterStatusError
                              : styles.terminalFooterStatusPending
                        }`}
                      >
                        {connectionLabel}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              {error ? (
                <p className={`${styles.error} ${styles.terminalInlineError}`}>
                  {error} Refresh the page to reopen the terminal session.
                </p>
              ) : null}

              {terminalActionNotice ? (
                <p className={styles.terminalActionNotice}>{terminalActionNotice}</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
