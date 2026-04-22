import { redirect } from "next/navigation";
import styles from "@/app/console.module.css";
import { requirePaidSubscriber } from "@/lib/auth";
import { DeployFlow } from "@/app/dashboard/deploy/deploy-flow";
import {
  getLatestInstanceFromControlPlane,
  isReadyInstance,
} from "@/lib/control-plane/server";

export default async function DeployPage() {
  const { accessToken } = await requirePaidSubscriber("/dashboard/deploy");
  const instance = await getLatestInstanceFromControlPlane(accessToken);

  if (isReadyInstance(instance)) {
    redirect(`/dashboard/instances/${instance.id}/terminal`);
  }

  return (
    <main className={`${styles.screen} ${styles.statusScreen}`}>
      <DeployFlow initialInstance={instance} />
    </main>
  );
}
