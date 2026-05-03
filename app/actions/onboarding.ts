"use server";

import { createClient } from "@/lib/supabase/server";
import type { OnboardingState } from "@/lib/types/form-states";
import { completeOnboardingForUser } from "@/lib/services/profiles-service";

export type { OnboardingState } from "@/lib/types/form-states";

export async function completeOnboarding(
  _prev: OnboardingState | undefined,
  formData: FormData,
): Promise<OnboardingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not logged in" };
  return completeOnboardingForUser(user, formData);
}
