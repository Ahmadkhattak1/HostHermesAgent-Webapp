import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClientLogBridge } from "@/app/client-log-bridge";
import { FirebaseAuthBridge } from "@/app/firebase-auth-bridge";
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
  title: "Host Hermes Agent",
  description:
    "Deploy Hermes Agent in the cloud with fast setup, reliable uptime, and a cleaner user experience.",
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
      </body>
    </html>
  );
}
