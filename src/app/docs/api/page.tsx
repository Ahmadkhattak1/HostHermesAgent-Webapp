import type { Metadata } from "next";
import { buildAbsoluteUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "API Documentation | Host Hermes Agent",
  description:
    "Service documentation for the Host Hermes Agent webapp entrypoints and proxied control plane endpoints.",
};

const endpointRows = [
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
        catalog at <code>{buildAbsoluteUrl("/.well-known/api-catalog")}</code>.
      </p>
      <p style={{ fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "2rem" }}>
        Base site URL: <code>{buildAbsoluteUrl("/")}</code>
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
    </main>
  );
}
