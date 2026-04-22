import { redirect } from "next/navigation";
import { requirePaidSubscriber } from "@/lib/auth";
import {
  getLatestInstanceFromControlPlane,
  isReadyInstance,
} from "@/lib/control-plane/server";

export default async function DashboardPage() {
  const { accessToken } = await requirePaidSubscriber("/dashboard");
  const instance = await getLatestInstanceFromControlPlane(accessToken);

  if (isReadyInstance(instance)) {
    redirect(`/dashboard/instances/${instance.id}/terminal`);
  }

  redirect("/dashboard/deploy");
}
