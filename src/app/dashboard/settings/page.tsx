import Image from "next/image";
import styles from "@/app/console.module.css";
import { ManageSubscriptionButton } from "@/components/manage-subscription-button";
import { SettingsBackButton } from "@/components/settings-back-button";
import { SupportContactButton } from "@/components/support-contact-button";
import { requireAuthenticatedSession } from "@/lib/auth";
import {
  getBillingStateFromControlPlane,
  getLatestInstanceFromControlPlane,
  isReadyInstance,
} from "@/lib/control-plane/server";

export default async function SettingsPage() {
  const { accessToken, user } = await requireAuthenticatedSession("/dashboard/settings");
  const { canManageBilling, hasActiveSubscription, profile } =
    await getBillingStateFromControlPlane(accessToken);
  const latestInstance = await getLatestInstanceFromControlPlane(accessToken);
  const backHref = isReadyInstance(latestInstance)
    ? `/dashboard/instances/${latestInstance.id}/terminal`
    : "/dashboard/deploy";

  return (
    <main className={`${styles.screen} ${styles.settingsScreen}`}>
      <div className={styles.settingsShell}>
        <header className={styles.statusTopBar}>
          <div className={styles.statusBrand}>
            <div className={styles.statusBrandMark}>
              <Image
                src="/assets/figma/hero-badge.png"
                alt=""
                width={40}
                height={40}
                priority
              />
            </div>
            <span className={styles.statusBrandName}>Hermes Agent</span>
          </div>

          <SupportContactButton buttonClassName={styles.statusSupportButton}>
            <span className={styles.statusSupport}>Support</span>
          </SupportContactButton>
        </header>

        <section className={styles.settingsCanvas}>
          <div className={styles.settingsPanel}>
            <div className={styles.settingsIntro}>
              <h1 className={styles.settingsTitle}>Settings</h1>
              <p className={styles.settingsCopy}>
                Minimal account details for your hosted Hermes environment.
              </p>
            </div>

            <section className={styles.settingsSection}>
              <p className={styles.settingsSectionLabel}>Account</p>
              <div className={styles.settingsValueList}>
                <div className={styles.settingsValueRow}>
                  <span className={styles.settingsValueKey}>Name</span>
                  <span className={styles.settingsValue}>
                    {user.displayName ?? "Host Hermes user"}
                  </span>
                </div>
                <div className={styles.settingsValueRow}>
                  <span className={styles.settingsValueKey}>Email</span>
                  <span className={styles.settingsValue}>
                    {user.email ?? "Not available"}
                  </span>
                </div>
              </div>
            </section>

            <section className={styles.settingsSection}>
              <p className={styles.settingsSectionLabel}>Subscription</p>
              <div className={styles.settingsValueList}>
                <div className={styles.settingsValueRow}>
                  <span className={styles.settingsValueKey}>Status</span>
                  <span className={styles.settingsStatusPill}>
                    {hasActiveSubscription ? "Active" : "Action required"}
                  </span>
                </div>
                <div className={styles.settingsValueRow}>
                  <span className={styles.settingsValueKey}>Billing email</span>
                  <span className={styles.settingsValue}>
                    {profile.email ?? user.email ?? "Not available"}
                  </span>
                </div>
                <div className={styles.settingsValueRow}>
                  <span className={styles.settingsValueKey}>Subscription state</span>
                  <span className={styles.settingsValue}>
                    {profile.subscriptionStatus ?? "Not available"}
                  </span>
                </div>
              </div>
            </section>

            <div className={styles.settingsActions}>
              {canManageBilling ? (
                <ManageSubscriptionButton nextPath="/dashboard/settings" />
              ) : null}
              <SettingsBackButton href={backHref} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
