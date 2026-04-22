import Link from "next/link";
import styles from "@/app/console.module.css";

export default function AuthCodeErrorPage() {
  return (
    <main className={`${styles.screen} ${styles.subscriptionScreen}`}>
      <div className={styles.redirectShell}>
        <div className={styles.redirectContent}>
          <div className={styles.redirectTextBlock}>
            <h1 className={styles.redirectTitle}>Google sign-in did not complete</h1>
            <p className={styles.redirectCopy}>
              Firebase could not finish the Google sign-in flow. Please retry
              the deployment flow after checking your authorized domains.
            </p>
          </div>
          <div className={styles.redirectActions}>
            <Link className={styles.redirectPrimaryLink} href="/dashboard/deploy">
              Try again
            </Link>
            <Link className={styles.redirectSecondaryLink} href="/">
              Return home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
