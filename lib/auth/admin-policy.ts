import { createClient } from "@/lib/supabase/server";

export function adminUserIdsFromEnv(): Set<string> {
  return new Set(
    (process.env.ADMIN_USER_IDS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

/** True if JWT user is ops admin (`profiles.is_admin` or ADMIN_USER_IDS). */
export async function isPrivilegedAdmin(userId: string): Promise<boolean> {
  if (adminUserIdsFromEnv().has(userId)) return true;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("is_admin").eq("id", userId).single();
  return Boolean(data?.is_admin);
}
