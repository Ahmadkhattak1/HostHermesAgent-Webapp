import Image from "next/image";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://hosthermesagent.com/#organization",
      name: "Host Hermes Agent",
      url: "https://hosthermesagent.com",
      logo: "https://hosthermesagent.com/logo.png",
      description:
        "Host Hermes Agent provided Hermes Agent hosting and has merged with Clawpilot.app.",
      sameAs: ["https://clawpilot.app"],
    },
    {
      "@type": "WebPage",
      "@id": "https://hosthermesagent.com/#webpage",
      url: "https://hosthermesagent.com",
      name: "Host Hermes Agent Hosting Moved to Clawpilot.app",
      description:
        "Host Hermes Agent has merged with Clawpilot.app. Go to Clawpilot.app for managed Hermes Agent hosting and AI agent hosting.",
      about: [
        "Hermes Agent hosting",
        "managed AI agent hosting",
        "Host Hermes Agent",
        "Clawpilot.app",
      ],
      isPartOf: {
        "@id": "https://hosthermesagent.com/#website",
      },
      mainEntity: {
        "@type": "Service",
        name: "Hermes Agent hosting",
        serviceType: "Managed AI agent hosting",
        provider: {
          "@type": "Organization",
          name: "Clawpilot",
          url: "https://clawpilot.app",
        },
        url: "https://clawpilot.app",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://hosthermesagent.com/#website",
      name: "Host Hermes Agent",
      url: "https://hosthermesagent.com",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://clawpilot.app/?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function Home() {
  return (
    <main className="page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Image
        className="logo"
        src="/logo.png"
        alt="Hermes agent logo"
        width="128"
        height="128"
        priority
        unoptimized
      />
      <h1>
        Host Hermes Agent merged with{" "}
        <a href="https://clawpilot.app">Clawpilot.app</a>. Go there to host your
        Hermes Agent.
      </h1>
    </main>
  );
}
