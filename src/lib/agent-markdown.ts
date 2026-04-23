import { buildAbsoluteUrl } from "@/lib/site-config";

type MarkdownEndpoint = {
  path: string;
  purpose: string;
};

const API_ENDPOINTS: MarkdownEndpoint[] = [
  {
    path: "/api/*",
    purpose: "HTTP requests proxied to the Host Hermes Agent control plane.",
  },
  {
    path: "/health",
    purpose: "Health-check endpoint for uptime and deployment verification.",
  },
  {
    path: "/ws/*",
    purpose: "WebSocket traffic forwarded to the control plane for live sessions.",
  },
];

function estimateMarkdownTokens(markdown: string) {
  // Lightweight estimate so agents can budget context size without a tokenizer dependency.
  return Math.max(1, Math.ceil(markdown.length / 4));
}

function createMarkdownHeaders(markdown: string) {
  return {
    "Content-Type": "text/markdown; charset=utf-8",
    Vary: "Accept",
    "x-markdown-tokens": String(estimateMarkdownTokens(markdown)),
  };
}

export function createMarkdownResponse(markdown: string) {
  return new Response(markdown, {
    headers: createMarkdownHeaders(markdown),
  });
}

export function createMarkdownHeadResponse(markdown: string) {
  return new Response(null, {
    headers: createMarkdownHeaders(markdown),
  });
}

export function getHomePageMarkdown() {
  return `---
title: Host Hermes Agent
description: Deploy Hermes Agent in the cloud with fast setup, reliable uptime, and a cleaner user experience.
canonical: ${buildAbsoluteUrl("/")}
---

# Host Hermes Agent

Deploy Hermes Agent in the cloud with fast setup, reliable uptime, and a cleaner user experience.

## Product summary

Host Hermes Agent helps teams run Hermes Agent as an always-available cloud deployment instead of managing local setup friction.

## Core capabilities

- Persistent memory: retains context across sessions for long-running workflows.
- Task decomposition: breaks down high-level goals into executable steps automatically.
- Model agnostic: connects to various LLM backends via standardized APIs.

## Common use cases

- Research and analysis: automate deep-dive research, synthesize documentation, and monitor industry trends autonomously.
- Recurring tasks: schedule data extraction, report generation, and system health checks on a persistent basis.
- Team workflows: integrate as a silent team member that responds to specific triggers in Slack or Discord.
- Technical work: assist with code review, refactoring suggestions, and automated pull request analysis.

## Deployment benefits

- Always on
- Secure isolated environment
- One-click deployment
- Instant integration support for WhatsApp, Telegram, Slack, Discord, and more

## Key links

- Home: ${buildAbsoluteUrl("/")}
- Sign in: ${buildAbsoluteUrl("/signin")}
- Dashboard: ${buildAbsoluteUrl("/dashboard")}
- API documentation: ${buildAbsoluteUrl("/docs/api")}
- API catalog: ${buildAbsoluteUrl("/.well-known/api-catalog")}
- GitHub: https://github.com/NousResearch/hermes-agent
`;
}

export function getApiDocsMarkdown() {
  const endpointList = API_ENDPOINTS.map(
    ({ path, purpose }) => `- \`${path}\`: ${purpose}`,
  ).join("\n");

  return `---
title: API Documentation | Host Hermes Agent
description: Service documentation for the Host Hermes Agent webapp entrypoints and proxied control plane endpoints.
canonical: ${buildAbsoluteUrl("/docs/api")}
---

# Host Hermes Agent API docs

This site exposes a small set of public entrypoints that route traffic to the Host Hermes Agent control plane.

## Discovery

- API catalog: ${buildAbsoluteUrl("/.well-known/api-catalog")}
- Base site URL: ${buildAbsoluteUrl("/")}

## Available entrypoints

${endpointList}
`;
}
