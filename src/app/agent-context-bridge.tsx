"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { buildSubscriptionPath } from "@/lib/routing";

type WebMcpTool = {
  annotations?: {
    readOnlyHint?: boolean;
  };
  description: string;
  execute: (
    input: Record<string, unknown>,
    agent?: {
      requestUserInteraction?: <T>(callback: () => Promise<T>) => Promise<T>;
    },
  ) => Promise<unknown> | unknown;
  inputSchema?: Record<string, unknown>;
  name: string;
  title?: string;
};

type WebMcpApi = {
  provideContext?: (context: { tools: WebMcpTool[] }) => void;
  registerTool?: (
    tool: WebMcpTool,
    options?: {
      signal?: AbortSignal;
    },
  ) => void;
};

function getWebMcpApi() {
  if (typeof navigator === "undefined") {
    return null;
  }

  return (navigator as Navigator & { modelContext?: WebMcpApi }).modelContext ?? null;
}

function hasFirebaseSessionCookie() {
  if (typeof document === "undefined") {
    return false;
  }

  return document.cookie.split(";").some((item) =>
    item.trim().startsWith("host_hermes_firebase_id_token="),
  );
}

async function confirmAction(
  agent:
    | {
        requestUserInteraction?: <T>(callback: () => Promise<T>) => Promise<T>;
      }
    | undefined,
  message: string,
) {
  if (!agent?.requestUserInteraction) {
    return true;
  }

  return agent.requestUserInteraction(async () => window.confirm(message));
}

function navigate(path: string) {
  window.location.assign(path);
  return {
    navigatedTo: path,
    ok: true,
  };
}

function buildTools(pathname: string): WebMcpTool[] {
  const signedIn = hasFirebaseSessionCookie();
  const trialPath = buildSubscriptionPath("/dashboard");

  return [
    {
      name: "get-host-hermes-context",
      title: "Get Host Hermes context",
      description:
        "Read the current Host Hermes Agent page context, discovery URLs, and whether a browser session appears signed in.",
      annotations: {
        readOnlyHint: true,
      },
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {},
      },
      execute: () => ({
        apiCatalog: "/.well-known/api-catalog",
        apiDocs: "/docs/api",
        currentPath: pathname,
        signedIn,
        signInPath: "/signin",
        skillsIndex: "/.well-known/agent-skills/index.json",
        trialPath,
      }),
    },
    {
      name: "start-host-hermes-sign-in",
      title: "Start sign in",
      description:
        "Navigate to the Host Hermes Agent sign-in flow in the browser so the user can authenticate with Google.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {},
      },
      execute: async (_input, agent) => {
        const confirmed = await confirmAction(
          agent,
          "Open the Host Hermes Agent sign-in flow?",
        );

        if (!confirmed) {
          return {
            ok: false,
            reason: "User declined sign-in navigation.",
          };
        }

        return navigate("/signin");
      },
    },
    {
      name: "start-host-hermes-trial",
      title: "Start free trial",
      description:
        "Navigate to the Host Hermes Agent free-trial and billing flow in the browser.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          nextPath: {
            description: "Optional in-app path to open after checkout completes.",
            type: "string",
          },
        },
      },
      execute: async (input, agent) => {
        const requestedNextPath =
          typeof input.nextPath === "string" && input.nextPath.startsWith("/")
            ? input.nextPath
            : "/dashboard";
        const target = buildSubscriptionPath(requestedNextPath);
        const confirmed = await confirmAction(
          agent,
          "Open the Host Hermes Agent free-trial and billing flow?",
        );

        if (!confirmed) {
          return {
            ok: false,
            reason: "User declined trial navigation.",
          };
        }

        return navigate(target);
      },
    },
  ];
}

export function AgentContextBridge() {
  const pathname = usePathname();

  useEffect(() => {
    const api = getWebMcpApi();

    if (!api) {
      return;
    }

    const tools = buildTools(pathname);

    if (typeof api.provideContext === "function") {
      api.provideContext({ tools });
      return;
    }

    if (typeof api.registerTool === "function") {
      const abortControllers = tools.map(() => new AbortController());

      tools.forEach((tool, index) => {
        api.registerTool?.(tool, {
          signal: abortControllers[index]?.signal,
        });
      });

      return () => {
        abortControllers.forEach((controller) => controller.abort());
      };
    }
  }, [pathname]);

  return null;
}
