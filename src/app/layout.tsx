import type { Metadata } from "next";
import "./globals.css";

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://hosthermesagent.com",
);
const clawpilotUrl = "https://clawpilot.app";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "Host Hermes Agent Hosting Moved to Clawpilot.app",
  description:
    "Host Hermes Agent has merged with Clawpilot.app. Go to Clawpilot.app for managed Hermes Agent hosting and AI agent hosting.",
  keywords: [
    "Host Hermes Agent",
    "Hermes Agent hosting",
    "host Hermes Agent",
    "managed Hermes Agent",
    "AI agent hosting",
    "Clawpilot",
    "Clawpilot.app",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Host Hermes Agent Hosting Moved to Clawpilot.app",
    description:
      "Host Hermes Agent has merged with Clawpilot.app for managed Hermes Agent hosting.",
    url: "/",
    siteName: "Host Hermes Agent",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Host Hermes Agent Hosting Moved to Clawpilot.app",
    description:
      "Host Hermes Agent has merged with Clawpilot.app for managed Hermes Agent hosting.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "ai-content-declaration":
      "Host Hermes Agent has merged with Clawpilot.app. Clawpilot.app is the current destination for Hermes Agent hosting.",
    "target-destination": clawpilotUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
