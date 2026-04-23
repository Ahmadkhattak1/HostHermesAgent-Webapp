import type { Metadata } from "next";
import {
  getAgentSkillsIndexUrl,
  getApiCatalogUrl,
  getOpenApiDocumentUrl,
  getProtectedResourceIdentifier,
} from "@/lib/discovery";
import { SITE_NAME, buildAbsoluteUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "API Documentation",
  description:
    "Service documentation for the Host Hermes Agent webapp entrypoints and proxied control plane endpoints.",
  alternates: {
    canonical: "/docs/api",
  },
  openGraph: {
    title: `API Documentation | ${SITE_NAME}`,
    description:
      "Service documentation for the Host Hermes Agent webapp entrypoints and proxied control plane endpoints.",
    url: "/docs/api",
    siteName: SITE_NAME,
    type: "website",
  },
};

const endpointRows = [
  {
    path: "/api/*",
    purpose:
      "Authenticated first-party HTTP requests proxied to the Host Hermes Agent control plane.",
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

const discoveryRows = [
  {
    path: "/.well-known/api-catalog",
    purpose: "RFC 9727 API catalog in Linkset JSON format.",
  },
  {
    path: "/.well-known/openapi.json",
    purpose: "OpenAPI 3.1 machine-readable API description.",
  },
  {
    path: "/.well-known/oauth-protected-resource",
    purpose: "OAuth protected resource metadata for the proxied API.",
  },
  {
    path: "/.well-known/agent-skills/index.json",
    purpose: "Agent Skills discovery index for browser-first usage guidance.",
  },
];

export default function ApiDocsPage() {
  return (
    <main
      style={{
        margin: "0 auto",
        maxWidth: "880px",
        padding: "96px 24px",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", lineHeight: 1.1, marginBottom: "1rem" }}>
        Host Hermes Agent API docs
      </h1>
      <p style={{ fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
        This site exposes a small set of public entrypoints that route traffic to the
        Host Hermes Agent control plane. Agents can discover the machine-readable API
        catalog at <code>{getApiCatalogUrl()}</code>.
      </p>
      <p style={{ fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "2rem" }}>
        Base site URL: <code>{buildAbsoluteUrl("/")}</code>
      </p>
      <p style={{ fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "2rem" }}>
        Preferred agent path: use the website UI and browser WebMCP tools for sign-in,
        trial start, and checkout flows. The raw control-plane API at{" "}
        <code>{getProtectedResourceIdentifier()}</code> is protected and intended for
        first-party webapp traffic.
      </p>

      <section>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Available entrypoints</h2>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
          }}
        >
          <thead>
            <tr>
              <th
                align="left"
                style={{ borderBottom: "1px solid currentColor", padding: "0.75rem 0" }}
              >
                Path
              </th>
              <th
                align="left"
                style={{ borderBottom: "1px solid currentColor", padding: "0.75rem 0" }}
              >
                Purpose
              </th>
            </tr>
          </thead>
          <tbody>
            {endpointRows.map((endpoint) => (
              <tr key={endpoint.path}>
                <td style={{ borderBottom: "1px solid rgba(255,255,255,0.12)", padding: "1rem 0" }}>
                  <code>{endpoint.path}</code>
                </td>
                <td style={{ borderBottom: "1px solid rgba(255,255,255,0.12)", padding: "1rem 0" }}>
                  {endpoint.purpose}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginTop: "3rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Discovery documents</h2>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
          Machine-readable discovery is available at{" "}
          <code>{getOpenApiDocumentUrl()}</code>, <code>{getApiCatalogUrl()}</code>, and{" "}
          <code>{getAgentSkillsIndexUrl()}</code>.
        </p>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
          }}
        >
          <thead>
            <tr>
              <th
                align="left"
                style={{ borderBottom: "1px solid currentColor", padding: "0.75rem 0" }}
              >
                Path
              </th>
              <th
                align="left"
                style={{ borderBottom: "1px solid currentColor", padding: "0.75rem 0" }}
              >
                Purpose
              </th>
            </tr>
          </thead>
          <tbody>
            {discoveryRows.map((entry) => (
              <tr key={entry.path}>
                <td style={{ borderBottom: "1px solid rgba(255,255,255,0.12)", padding: "1rem 0" }}>
                  <code>{entry.path}</code>
                </td>
                <td style={{ borderBottom: "1px solid rgba(255,255,255,0.12)", padding: "1rem 0" }}>
                  {entry.purpose}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
