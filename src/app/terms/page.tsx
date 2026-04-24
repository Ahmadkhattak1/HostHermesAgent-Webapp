import type { Metadata } from "next";
import { LegalPage } from "@/app/_legal/legal-page";

const effectiveDate = "April 24, 2026";

const sections = [
  {
    title: "1. Scope",
    paragraphs: [
      "These Terms of Service govern your use of Host Hermes Agent, including the website, dashboard, managed billing flows, and hosted Hermes Agent infrastructure we provision for subscribers. By using the service, you agree to these terms.",
      "If you use the service on behalf of a company or other organization, you represent that you have authority to bind that organization to these terms.",
    ],
  },
  {
    title: "2. What the service provides",
    paragraphs: [
      "Host Hermes Agent provides a managed way to deploy and operate Hermes Agent on VPS infrastructure. The service includes account access, hosted deployment workflows, instance management, billing workflows, and related support.",
      "The service may rely on third-party providers for authentication, billing, hosting, infrastructure orchestration, analytics, and other operational functions. Availability of certain features may change as the product evolves.",
    ],
  },
  {
    title: "3. Accounts and access",
    items: [
      "You must provide accurate account information and keep your login credentials secure.",
      "You are responsible for activity that occurs under your account, including activity initiated through connected tools or hosted agent workflows.",
      "You must notify us promptly if you believe your account has been compromised or used without authorization.",
    ],
  },
  {
    title: "4. Billing and subscriptions",
    paragraphs: [
      "Paid access is offered on a subscription basis and may include introductory trial pricing or promotional periods as displayed in the product at the time of purchase. Billing is handled through Stripe-linked checkout and portal flows.",
      "Unless stated otherwise in writing, subscriptions renew automatically until canceled. You authorize us and our payment processor to charge the applicable recurring fees, taxes, and any amounts due for continued service.",
    ],
    note:
      "If payment fails or a subscription lapses, we may suspend account features, restrict hosted resources, or deprovision infrastructure after any grace period we choose to offer.",
  },
  {
    title: "5. Acceptable use",
    items: [
      "Do not use the service for unlawful, fraudulent, abusive, infringing, or harmful activity.",
      "Do not attempt to probe, disrupt, overload, reverse engineer, or bypass service security or infrastructure controls.",
      "Do not use the platform to distribute malware, conduct credential attacks, run unsolicited spam campaigns, or interfere with other users or providers.",
      "Do not use the service in ways that violate third-party provider terms, applicable export controls, sanctions, or data protection laws.",
      "You are responsible for evaluating whether your own workloads are appropriate for a hosted environment and for any regulated or sensitive use cases you choose to run.",
    ],
  },
  {
    title: "6. Your content and hosted workloads",
    paragraphs: [
      "You retain your rights in the prompts, inputs, files, outputs, and other materials you submit to or generate through your use of the service. We do not claim ownership of your content.",
      "You grant us a limited right to host, process, transmit, store, and display your content only as needed to operate, secure, support, and improve the service. You are responsible for ensuring you have the rights and lawful basis needed for any content or personal data you place into the platform.",
    ],
  },
  {
    title: "7. Service changes, suspension, and termination",
    paragraphs: [
      "We may modify, suspend, or discontinue parts of the service, with or without notice, where reasonably necessary for maintenance, security, legal compliance, or product changes.",
      "We may suspend or terminate access if you violate these terms, create risk for the service or other users, fail to pay applicable fees, or use the platform in a way that exposes us or our providers to legal or operational harm.",
      "You may stop using the service at any time. Cancellation will usually take effect at the end of the current billing period unless a different timing is shown in the billing workflow.",
    ],
  },
  {
    title: "8. Third-party services",
    paragraphs: [
      "Certain parts of the service depend on third-party services such as Firebase Authentication, Google sign-in, Stripe, Vercel, and infrastructure providers. Your use of those integrations may also be subject to the terms and privacy policies of those third parties.",
      "We are not responsible for the independent acts, omissions, outages, or policy changes of third-party providers, although we work to choose providers that are appropriate for the service.",
    ],
  },
  {
    title: "9. Disclaimers",
    paragraphs: [
      "The service is provided on an \"as is\" and \"as available\" basis. To the maximum extent permitted by law, we disclaim warranties of merchantability, fitness for a particular purpose, non-infringement, and uninterrupted or error-free operation.",
      "Hosted agent behavior can be unpredictable, and infrastructure or third-party failures can occur. You are responsible for reviewing outputs, validating important work, and maintaining any backups or safeguards appropriate for your use case.",
    ],
  },
  {
    title: "10. Limitation of liability",
    paragraphs: [
      "To the maximum extent permitted by law, Host Hermes Agent and its operators will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for any loss of profits, revenues, goodwill, data, or business opportunities arising from or related to the service.",
      "To the extent liability cannot be excluded, our aggregate liability for claims arising out of or relating to the service will not exceed the amount you paid us for the service during the 12 months before the event giving rise to the claim.",
    ],
  },
  {
    title: "11. Changes to these terms",
    paragraphs: [
      "We may update these Terms of Service from time to time. If we make material changes, we will revise the effective date on this page and may provide additional notice in the product or by email when appropriate. Continued use of the service after an update becomes effective means you accept the revised terms.",
    ],
  },
] as const;

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The contractual terms for using Host Hermes Agent, including subscriptions, hosted workloads, acceptable use, and liability limits.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service",
    description:
      "The contractual terms for using Host Hermes Agent, including subscriptions, hosted workloads, acceptable use, and liability limits.",
    url: "/terms",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service",
    description:
      "The contractual terms for using Host Hermes Agent, including subscriptions, hosted workloads, acceptable use, and liability limits.",
  },
};

export default function TermsPage() {
  return (
    <LegalPage
      description="These terms explain the rules for using the hosted service, how subscriptions work, what responsibilities stay with the customer, and the limits that apply to the platform."
      effectiveDate={effectiveDate}
      eyebrow="Terms of Service"
      sections={sections}
      title="Clear terms for a managed hosted service."
    />
  );
}
