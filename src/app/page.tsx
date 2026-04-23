import Image from "next/image";
import { ProtectedRouteLink } from "@/components/protected-route-link";
import { buildSubscriptionPath } from "@/lib/routing";
import styles from "./page.module.css";

type Capability = {
  description: string;
  iconSrc: string;
  title: string;
};

type UseCase = {
  description: string;
  iconSrc: string;
  title: string;
};

type Testimonial = {
  date: string;
  handle: string;
  name: string;
  quote: string;
  url: string;
};

type SidebarBenefit = {
  icon: "always-on" | "secure" | "deploy" | "terminal" | "connect";
  label: string;
};

type ConnectApp = {
  name: string;
  src: string;
};

const coreCapabilities: Capability[] = [
  {
    title: "Persistent Memory",
    description: "Retains context across sessions for long-running workflows.",
    iconSrc: "/assets/figma/feature-persistent-memory.svg",
  },
  {
    title: "Task Decomposition",
    description:
      "Breaks down high-level goals into executable steps automatically.",
    iconSrc: "/assets/figma/feature-task-decomposition.svg",
  },
  {
    title: "Model Agnostic",
    description: "Connects to various LLM backends via standardized APIs.",
    iconSrc: "/assets/figma/feature-model-agnostic.svg",
  },
];

const useCases: UseCase[] = [
  {
    title: "Research and analysis",
    description:
      "Automate deep-dive research, synthesize documentation, and monitor industry trends autonomously.",
    iconSrc: "/assets/figma/use-case-research.svg",
  },
  {
    title: "Recurring tasks",
    description:
      "Schedule data extraction, report generation, and system health checks on a persistent basis.",
    iconSrc: "/assets/figma/use-case-recurring.svg",
  },
  {
    title: "Team workflows",
    description:
      "Integrate as a silent team member that responds to specific triggers in Slack or Discord.",
    iconSrc: "/assets/figma/use-case-team.svg",
  },
  {
    title: "Technical work",
    description:
      "Assist with code review, refactoring suggestions, and automated pull request analysis.",
    iconSrc: "/assets/figma/use-case-technical.svg",
  },
];

const testimonials: Testimonial[] = [
  {
    name: "Nyk",
    handle: "@nyk_builderz",
    date: "11:56 PM - Mar 22, 2026",
    quote: "“40+ skills, tools, integrations, and resources”",
    url: "https://x.com/nyk_builderz/status/2035958826973733150",
  },
  {
    name: "Drew Schuyler",
    handle: "@drewsky1",
    date: "3:50 PM - Apr 9, 2026",
    quote: "“The framework I run on my own hardware.”",
    url: "https://x.com/drewsky1/status/2042344358012469256",
  },
  {
    name: "Neurophilia",
    handle: "@bobvarkey",
    date: "10:13 AM - Apr 2, 2026",
    quote: "“Hermes seems to have some interesting features that add some zing.”",
    url: "https://x.com/bobvarkey/status/2039707915473518909",
  },
  {
    name: "World of AI",
    handle: "@intheworldofai",
    date: "3:04 AM - Apr 7, 2026",
    quote: "“Better in the ways that matter most.”",
    url: "https://x.com/intheworldofai/status/2041411760943456589",
  },
];

const featuredTestimonials: Testimonial[] = testimonials.slice(0, 0).concat([
  {
    name: "Chrys Bader",
    handle: "@chrysb",
    date: "Apr 10, 2026",
    quote:
      "Hermes Agent from @NousResearch is the fastest growing agent of all time. In the past 7 days alone, Hermes gained 3x more stars than OpenClaw.",
    url: "https://x.com/chrysb/status/2042426202825375826",
  },
  {
    name: "Alex Finn",
    handle: "@AlexFinn",
    date: "Apr 1, 2026",
    quote:
      "Hermes Agent is an incredible AI agent. It's better than OpenClaw in some key ways, but does it replace it?",
    url: "https://x.com/AlexFinn/status/2039364255699599867",
  },
  {
    name: "Sudo su",
    handle: "@sudoingX",
    date: "Mar 10, 2026",
    quote:
      "I keep coming back to Hermes Agent. Not because I have to test it, but because I want to use it. The UX is what does it.",
    url: "https://x.com/sudoingX/status/2031273045135077567",
  },
  {
    name: "Chubby",
    handle: "@kimmonismus",
    date: "Apr 2, 2026",
    quote:
      "Really cool: Hermes Agent powered by Gemma 4, running 100% locally and 100% free.",
    url: "https://x.com/kimmonismus/status/2039808403980345505",
  },
]);

const sidebarBenefits: SidebarBenefit[] = [
  {
    label: "Always on",
    icon: "always-on",
  },
  {
    label: "Secure isolated environment",
    icon: "secure",
  },
  {
    label: "One-click deployment",
    icon: "deploy",
  },
];

const footerLinks = [
  { href: "#", label: "Privacy" },
  { href: "#", label: "Terms" },
  { href: "https://github.com/NousResearch/hermes-agent", label: "GitHub" },
];
const startTrialPath = buildSubscriptionPath("/dashboard");

const connectApps: ConnectApp[] = [
  {
    name: "WhatsApp",
    src: "/assets/figma/aside-app-4.png",
  },
  {
    name: "Telegram",
    src: "/assets/figma/aside-app-2.png",
  },
  {
    name: "Slack",
    src: "/assets/figma/aside-app-3.png",
  },
  {
    name: "Discord",
    src: "/assets/figma/aside-app-1.png",
  },
];

function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={styles.buttonIcon}
    >
      <path
        d="M3.333 8h9.334"
        stroke="currentColor"
        strokeWidth="1.333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 3.333 12.667 8 8 12.667"
        stroke="currentColor"
        strokeWidth="1.333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SidebarBenefitIcon({ icon }: { icon: SidebarBenefit["icon"] }) {
  if (icon === "always-on") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M10 3.333v6.667l4 2.333"
          stroke="currentColor"
          strokeWidth="1.667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="10" r="6.667" stroke="currentColor" strokeWidth="1.667" />
      </svg>
    );
  }

  if (icon === "secure") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M10 2.917 4.583 5v4.958c0 3.333 2.308 6.45 5.417 7.208 3.109-.758 5.417-3.875 5.417-7.208V5L10 2.917Z"
          stroke="currentColor"
          strokeWidth="1.667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m7.708 9.792 1.667 1.666 2.917-3.333"
          stroke="currentColor"
          strokeWidth="1.667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "deploy") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M10 2.917 3.75 6.25 10 9.583l6.25-3.333L10 2.917Z"
          stroke="currentColor"
          strokeWidth="1.667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.75 10 10 13.333 16.25 10"
          stroke="currentColor"
          strokeWidth="1.667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.75 13.75 10 17.083l6.25-3.333"
          stroke="currentColor"
          strokeWidth="1.667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "connect") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="6.25" cy="6.25" r="2.917" stroke="currentColor" strokeWidth="1.667" />
        <circle cx="13.75" cy="13.75" r="2.917" stroke="currentColor" strokeWidth="1.667" />
        <path
          d="m8.333 8.333 3.334 3.334"
          stroke="currentColor"
          strokeWidth="1.667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect
        x="3.333"
        y="4.167"
        width="13.333"
        height="11.667"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.667"
      />
      <path
        d="m6.667 8.333 2.083 1.667-2.083 1.667"
        stroke="currentColor"
        strokeWidth="1.667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.833 11.667h2.5"
        stroke="currentColor"
        strokeWidth="1.667"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ActionLink({
  href,
  label,
  className,
}: {
  className?: string;
  href: string;
  label: string;
}) {
  return (
    <ProtectedRouteLink
      className={`${styles.buttonPrimary} ${className ?? ""}`.trim()}
      href={href}
    >
      <span className={styles.buttonText}>{label}</span>
      <ArrowRightIcon />
    </ProtectedRouteLink>
  );
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Home() {
  return (
    <div className={styles.page} id="top">
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a className={styles.brand} href="#top" aria-label="Host Hermes Agent">
            <span className={styles.brandMark}>
              <Image
                src="/assets/figma/host-hermes-logo.png"
                alt=""
                width={48}
                height={48}
                priority
              />
            </span>
            <span className={styles.brandName}>Host Hermes Agent</span>
          </a>

          <div className={styles.headerActions}>
            <ProtectedRouteLink className={styles.loginLink} href="/dashboard">
              Log In
            </ProtectedRouteLink>
            <ActionLink
              href={startTrialPath}
              label="3-Day Trial"
              className={styles.headerButton}
            />
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.contentColumn}>
          <section className={styles.heroSection}>
            <div className={styles.heroAgentIntro}>
              <Image
                src="/assets/figma/hero-badge.png"
                alt="Hermes Agent"
                width={56}
                height={56}
                priority
              />
              <div className={styles.heroAgentCopy}>
                <p className={styles.heroAgentLabel}>Hermes Agent</p>
                <p className={styles.heroAgentDescription}>
                  The self-improving AI agent built by Nous Research. The only
                  agent with a built-in learning loop.
                </p>
              </div>
            </div>

            <div className={styles.heroHeadingWrap}>
              <h1 className={styles.heroTitle}>Hermes Agent Hosting</h1>
            </div>

            <div className={styles.heroCopyBlock}>
              <p className={styles.heroLead}>
                Deploy Hermes Agent in the cloud with fast setup and a better
                user experience.
              </p>
              <p className={styles.heroDescription}>
                Run Hermes Agent in the cloud with fast setup, reliable uptime,
                and a cleaner experience from day one. Launch your own
                always-available AI agent without dealing with the usual setup
                friction.
              </p>
            </div>
          </section>

          <section className={`${styles.section} ${styles.sectionBordered}`}>
            <h2 className={styles.sectionTitle}>A self-improving AI agent</h2>
            <p className={styles.sectionCopy}>
              Designed to operate autonomously, Hermes handles complex tasks by
              leveraging persistent memory, dynamic tool selection, and
              iterative self-correction. It&apos;s built for continuous execution
              rather than single-shot prompts.
            </p>

            <div className={styles.capabilityList}>
              {coreCapabilities.map((capability) => (
                <article className={styles.capabilityItem} key={capability.title}>
                  <div className={styles.capabilityIcon}>
                    <Image
                      src={capability.iconSrc}
                      alt=""
                      width={20}
                      height={20}
                      aria-hidden="true"
                    />
                  </div>
                  <div className={styles.capabilityCopy}>
                    <h3>{capability.title}</h3>
                    <p>{capability.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <p className={styles.eyebrow}>Common Use Cases</p>
            <div className={styles.useCaseGrid}>
              {useCases.map((useCase) => (
                <article className={styles.surfaceCard} key={useCase.title}>
                  <div className={styles.surfaceCardIcon}>
                    <Image
                      src={useCase.iconSrc}
                      alt=""
                      width={24}
                      height={24}
                      aria-hidden="true"
                    />
                  </div>
                  <div className={styles.cardCopy}>
                    <h3>{useCase.title}</h3>
                    <p>{useCase.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <p className={styles.eyebrow}>What Users Are Saying</p>
            <div className={styles.testimonialGrid}>
              {featuredTestimonials.map((testimonial) => (
                <article className={styles.testimonialCard} key={testimonial.handle}>
                  <div className={styles.testimonialHeader}>
                    <div className={styles.testimonialIdentity}>
                      <div className={styles.avatarCircle}>{getInitials(testimonial.name)}</div>
                      <div className={styles.identityText}>
                        <div className={styles.identityTitle}>
                          <h3>{testimonial.name}</h3>
                        </div>
                        <p>{testimonial.handle}</p>
                      </div>
                    </div>
                  </div>

                  <blockquote className={styles.testimonialQuote}>
                    {testimonial.quote}
                  </blockquote>

                  <div className={styles.testimonialFooter}>
                    <p className={styles.testimonialDate}>{testimonial.date}</p>
                    <a
                      className={styles.testimonialLink}
                      href={testimonial.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View on X
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={`${styles.section} ${styles.sectionBordered}`}>
            <h2 className={styles.sectionTitle}>A simpler way to run</h2>
            <div className={styles.ctaPanel}>
              <div className={styles.ctaCopy}>
                <h3>Start with a 3-day trial</h3>
                <p>Launch Hermes fast, validate the setup, then keep it running.</p>
              </div>
              <ActionLink
                href={startTrialPath}
                label="Start 3-Day Trial"
                className={styles.ctaButton}
              />
            </div>
          </section>
        </div>

        <aside className={styles.aside}>
          <div className={styles.asideCard}>
            <div className={styles.asideIntro}>
              <h2>Deploy Hermes Agent</h2>
            </div>

            <div className={styles.priceBlock}>
              <p className={styles.priceLine}>
                <span className={styles.priceValue}>$19.99</span>
                <span className={styles.priceHeadline}>FREE</span>
              </p>
              <p className={styles.priceNote}>for first 3 days then $19.99 per month.</p>
            </div>

            <div className={styles.asideList}>
              {sidebarBenefits.map((benefit) => (
                <div className={styles.asideBenefit} key={benefit.label}>
                  <span className={styles.asideBenefitIcon}>
                    <SidebarBenefitIcon icon={benefit.icon} />
                  </span>
                  <span>{benefit.label}</span>
                </div>
              ))}
              <div className={styles.asideBenefitConnect}>
                <div className={styles.asideBenefitCopy}>
                  <span className={styles.asideBenefitIcon}>
                    <SidebarBenefitIcon icon="connect" />
                  </span>
                  <div className={styles.asideConnectCopy}>
                    <p className={styles.asideConnectEyebrow}>Instantly connect</p>
                  </div>
                </div>

                <div
                  className={styles.asideConnectIcons}
                  aria-label="Supported integrations"
                  role="list"
                >
                  {connectApps.map((app) => (
                    <div className={styles.connectIconWrap} key={app.name} role="listitem">
                      <Image
                        src={app.src}
                        alt={app.name}
                        width={22}
                        height={22}
                        loading="eager"
                      />
                    </div>
                  ))}
                  <span className={styles.connectMore}>+ more</span>
                </div>
              </div>
            </div>

            <ActionLink
              href={startTrialPath}
              label="Start free"
              className={styles.asideButton}
            />
          </div>
        </aside>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className={styles.footerCopy}>&copy; 2024 HostHermesAgent.</p>
          <div className={styles.footerLinks}>
            {footerLinks.map((link) => (
              <a
                className={styles.footerLink}
                href={link.href}
                key={link.label}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                target={link.href.startsWith("http") ? "_blank" : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
