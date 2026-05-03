import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPrivilegedAdmin } from "@/lib/auth/admin-policy";
import type { User } from "@supabase/supabase-js";

export type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  cnic_last4: string | null;
  role: string;
  onboarding_completed: boolean;
  is_admin: boolean;
  emergency_contact_phone: string | null;
  rating_avg: number | null;
  reliability_flagged: boolean;
};

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

/** One auth + profile read per React request tree (layout + nested RSC pages). */
const loadAuthProfileContextInternal = cache(
  async (): Promise<{
    user: User | null;
    profile: ProfileRow | null;
    supabase: SupabaseServer;
  }> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { user: null, profile: null, supabase };

    const { data: raw } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    const profile = raw ? (raw as ProfileRow) : null;
    return { user, profile, supabase };
  },
);

export async function requireUser(): Promise<{ user: User; supabase: SupabaseServer }> {
  const { user, supabase } = await loadAuthProfileContextInternal();
  if (!user) redirect("/login");
  return { user, supabase };
}

export async function requireOnboardedProfile(): Promise<{
  user: User;
  profile: ProfileRow;
  supabase: SupabaseServer;
}> {
  const { user, profile, supabase } = await loadAuthProfileContextInternal();
  if (!user) redirect("/login");
  if (!profile) redirect("/onboarding");

  const p = profile;
  if (!p.onboarding_completed) redirect("/onboarding");

  return { user, profile: p, supabase };
}

/** Admin UI (app/admin/*): must be signed in and privileged. */
export async function requireAdminAccess(): Promise<void> {
  const { user } = await requireUser();
  if (!(await isPrivilegedAdmin(user.id))) redirect("/");
}
