import { requireUser } from "@/lib/require-profile";

/** Onboarding requires an authenticated session (same as former middleware behaviour). */
export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return <>{children}</>;
}
