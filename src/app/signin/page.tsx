import { redirect } from "next/navigation";
import { getAuthenticatedSession } from "@/lib/control-plane/server";
import { getDefaultProtectedPath, sanitizeNextPath } from "@/lib/routing";
import { SignInRedirectContent } from "@/app/signin/signin-redirect";

type SignInPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const nextPath = sanitizeNextPath(
    readParam(params.next),
    getDefaultProtectedPath(),
  );
  const session = await getAuthenticatedSession();

  if (session) {
    redirect(nextPath);
  }

  return <SignInRedirectContent nextPath={nextPath} />;
}
