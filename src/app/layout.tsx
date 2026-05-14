import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Host Hermes Agent",
  description: "Go to Clawpilot.app for hosting hermes agent",
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
