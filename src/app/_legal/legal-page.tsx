import Image from "next/image";
import Link from "next/link";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/site-config";
import styles from "./legal-page.module.css";

type LegalSection = {
  items?: readonly string[];
  note?: string;
  paragraphs?: readonly string[];
  title: string;
};

type LegalPageProps = {
  description?: string;
  effectiveDate: string;
  eyebrow: string;
  sections: readonly LegalSection[];
  title: string;
};

type FooterLink =
  | { external?: false; href: string; label: string }
  | { external: true; href: string; label: string };

const footerLinks: FooterLink[] = [
  { href: "/", label: "Home" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  {
    external: true,
    href: "https://github.com/NousResearch/hermes-agent",
    label: "GitHub",
  },
];

export function LegalPage({
  description,
  effectiveDate,
  eyebrow,
  sections,
  title,
}: LegalPageProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/">
            <span className={styles.brandMark}>
              <Image
                src="/assets/figma/app-logo.png"
                alt=""
                width={28}
                height={28}
                priority
              />
            </span>
            <span className={styles.brandCopy}>
              <span className={styles.brandName}>{SITE_NAME}</span>
              <span className={styles.brandLabel}>Legal</span>
            </span>
          </Link>

          <nav className={styles.headerLinks} aria-label="Legal navigation">
            <Link className={styles.headerLink} href="/privacy">
              Privacy
            </Link>
            <Link className={styles.headerLink} href="/terms">
              Terms
            </Link>
            <Link className={styles.headerLink} href="/">
              Back to site
            </Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.document}>
          <header className={styles.documentHeader}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h1 className={styles.title}>{title}</h1>
            {description ? <p className={styles.intro}>{description}</p> : null}
            <p className={styles.metaText}>Effective {effectiveDate}</p>
            <p className={styles.contactLine}>
              Questions about these terms or our privacy practices:{" "}
              <a className={styles.contactLink} href={`mailto:${SUPPORT_EMAIL}`}>
                {SUPPORT_EMAIL}
              </a>
            </p>
          </header>

          {sections.map((section) => (
            <section className={styles.section} key={section.title}>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p className={styles.paragraph} key={paragraph}>
                  {paragraph}
                </p>
              ))}
              {section.items?.length ? (
                <ul className={styles.list}>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {section.note ? <p className={styles.sectionNote}>{section.note}</p> : null}
            </section>
          ))}
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className={styles.footerCopy}>&copy; {currentYear} {SITE_NAME}.</p>
          <nav className={styles.footerLinks} aria-label="Footer">
            {footerLinks.map((link) =>
              link.external ? (
                <a
                  className={styles.footerLink}
                  href={link.href}
                  key={link.label}
                  rel="noreferrer"
                  target="_blank"
                >
                  {link.label}
                </a>
              ) : (
                <Link className={styles.footerLink} href={link.href} key={link.label}>
                  {link.label}
                </Link>
              ),
            )}
          </nav>
        </div>
      </footer>
    </div>
  );
}
