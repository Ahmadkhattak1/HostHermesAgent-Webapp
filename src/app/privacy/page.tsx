import type { Metadata } from "next";
import { LegalPage } from "@/app/_legal/legal-page";
import { SUPPORT_EMAIL } from "@/lib/site-config";

const effectiveDate = "April 24, 2026";

const sections = [
  {
    title: "1. Our approach to privacy",
    paragraphs: [
      "Host Hermes Agent is built around the idea that hosting your agent should increase reliability without turning privacy into an afterthought. We collect the minimum information we reasonably need to authenticate you, provision infrastructure, manage billing, secure the platform, and support your account.",
      "We do not sell personal information. We do not run an advertising business. When we process your data, it is to operate the hosted service you asked us to provide, to keep it secure, or to meet legal obligations.",
    ],
  },
  {
    title: "2. Information we collect",
    paragraphs: [
      "The specific data we handle depends on how you use the service, but it generally falls into a few categories:",
    ],
    items: [
      "Account and identity information, such as your name, email address, profile photo, and authentication identifiers when you sign in with Google through Firebase Authentication.",
      "Billing and subscription information, such as your billing email, subscription status, Stripe customer identifiers, checkout session identifiers, and billing portal activity needed to manage your plan.",
      "Service and infrastructure information, such as deployment region, instance size, server status, host information, terminal session metadata, and operational logs or output needed to provision, maintain, and troubleshoot your hosted environment.",
      "Usage and diagnostic information, such as basic product analytics from Vercel Analytics, browser diagnostics relevant to authentication or support, and session-related technical signals used to keep the app functioning securely.",
      "Communications you send us, including support emails and account or billing requests.",
    ],
    note:
      "Payment card details are processed by Stripe, not stored directly by the web application.",
  },
  {
    title: "3. How we use information",
    items: [
      "Authenticate users and maintain secure sessions.",
      "Provision, configure, monitor, and manage hosted Hermes Agent instances.",
      "Process subscriptions, billing operations, and account recovery workflows.",
      "Investigate incidents, prevent abuse, detect fraud, and protect the service.",
      "Respond to support requests and communicate important account or service notices.",
      "Improve product reliability and user experience using aggregated or service-level analytics.",
    ],
  },
  {
    title: "4. How information is shared",
    paragraphs: [
      "We share data only where it is necessary to operate the service or required by law. This may include service providers that help us deliver the product, including Firebase Authentication for sign-in, Stripe for billing workflows, Vercel for analytics and hosting-related services, and infrastructure vendors such as DigitalOcean for VPS provisioning and instance operations.",
      "We may also disclose information if we believe it is reasonably necessary to comply with law, enforce our terms, protect users, or investigate security incidents. If ownership of the service changes, relevant account data may be transferred as part of that transaction subject to applicable law.",
    ],
  },
  {
    title: "5. Data retention",
    paragraphs: [
      "We retain account, billing, and service records for as long as they are needed to operate your account, provide support, resolve disputes, maintain security, or satisfy legal and tax obligations.",
      "Operational logs, diagnostics, and infrastructure records are kept only for as long as they serve a legitimate operational or security purpose. When data is no longer needed, we aim to delete it, anonymize it, or securely de-identify it where practical.",
    ],
  },
  {
    title: "6. Security",
    paragraphs: [
      "We use reasonable administrative, technical, and organizational safeguards designed to protect account and service data. Those measures include authenticated access controls, provider-managed security features, and protections intended to reduce unauthorized access, misuse, or disclosure.",
      "No online system is perfectly secure, and we cannot guarantee absolute security. You are responsible for protecting your own account credentials and for using the service in a way that does not expose sensitive data unnecessarily.",
    ],
  },
  {
    title: "7. Your choices and requests",
    items: [
      "You can update core account details through the authentication provider and manage subscription settings through the billing portal.",
      `You can request account deletion, data access, or privacy-related support by emailing ${SUPPORT_EMAIL}.`,
      "You can choose what information you place into your hosted workflows, prompts, or connected systems. Please avoid uploading highly sensitive information unless you have reviewed the operational and compliance requirements for your own use case.",
    ],
  },
  {
    title: "8. International processing",
    paragraphs: [
      "Our service providers and infrastructure partners may process data in jurisdictions outside your home country. By using the service, you understand that data may be transferred to and processed in locations where we or our providers operate, subject to applicable safeguards and contractual protections.",
    ],
  },
  {
    title: "9. Changes to this policy",
    paragraphs: [
      "We may update this Privacy Policy as the product evolves, especially if our infrastructure, billing, or support workflows change. When we make material changes, we will update the effective date on this page and may provide additional notice when appropriate.",
    ],
  },
] as const;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Host Hermes Agent handles account data, billing records, infrastructure metadata, analytics, and support requests.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy",
    description:
      "How Host Hermes Agent handles account data, billing records, infrastructure metadata, analytics, and support requests.",
    url: "/privacy",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy",
    description:
      "How Host Hermes Agent handles account data, billing records, infrastructure metadata, analytics, and support requests.",
  },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      description="This policy explains what we collect, why we collect it, and how we handle it when you use Host Hermes Agent. It is written to reflect the hosted product and operational stack currently used by the service."
      effectiveDate={effectiveDate}
      eyebrow="Privacy Policy"
      sections={sections}
      title="Privacy built into the hosting layer."
    />
  );
}
