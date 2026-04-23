import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClientLogBridge } from "@/app/client-log-bridge";
import { FirebaseAuthBridge } from "@/app/firebase-auth-bridge";
import { getSiteUrl } from "@/lib/site-config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: "Host Hermes Agent",
  description:
    "Deploy Hermes Agent in the cloud with fast setup, reliable uptime, and a cleaner user experience.",
  openGraph: {
    title: "Host Hermes Agent",
    description:
      "Deploy Hermes Agent in the cloud with fast setup, reliable uptime, and a cleaner user experience.",
    siteName: "Host Hermes Agent",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Host Hermes Agent",
    description:
      "Deploy Hermes Agent in the cloud with fast setup, reliable uptime, and a cleaner user experience.",
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ClientLogBridge />
        <FirebaseAuthBridge />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
