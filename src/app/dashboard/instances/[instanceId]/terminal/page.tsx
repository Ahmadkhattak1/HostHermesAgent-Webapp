import { notFound, redirect } from "next/navigation";
import styles from "@/app/console.module.css";
import { TerminalClient } from "@/app/dashboard/instances/[instanceId]/terminal/terminal-client";
import { requirePaidSubscriber } from "@/lib/auth";
import {
  getInstanceFromControlPlane,
  isReadyInstance,
} from "@/lib/control-plane/server";

type TerminalPageProps = {
  params: Promise<{
    instanceId: string;
  }>;
};

export default async function TerminalPage({ params }: TerminalPageProps) {
  const { instanceId } = await params;
  const terminalPath = `/dashboard/instances/${instanceId}/terminal`;
  const { accessToken, user } = await requirePaidSubscriber(terminalPath);
  const instance = await getInstanceFromControlPlane(accessToken, instanceId);

  if (!instance) {
    notFound();
  }

  if (!isReadyInstance(instance)) {
    redirect("/dashboard/deploy");
  }

  return (
    <main className={`${styles.screen} ${styles.terminalScreen}`}>
      <TerminalClient
        instance={instance}
        viewerDisplayName={user.displayName}
        viewerEmail={user.email}
        viewerPhotoUrl={user.photoUrl}
      />
    </main>
  );
}
