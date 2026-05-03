import type { SupabaseClient } from "@supabase/supabase-js";

export type PublicProfileRow = {
  id: string;
  full_name: string | null;
  rating_avg: number | string | null;
  phone?: string | null;
  photo_url?: string | null;
  role?: string;
};

export async function getPublicProfileById(
  supabase: SupabaseClient,
  profileId: string,
): Promise<PublicProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, rating_avg, role")
    .eq("id", profileId)
    .single();
  if (error) return null;
  return data as PublicProfileRow;
}

export async function listRatingsReceived(
  supabase: SupabaseClient,
  profileId: string,
  limit = 20,
): Promise<{ score: number; comment: string | null; created_at: string; from_user_id: string }[]> {
  const { data, error } = await supabase
    .from("ratings")
    .select("score, comment, created_at, from_user_id")
    .eq("to_user_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data || []) as {
    score: number;
    comment: string | null;
    created_at: string;
    from_user_id: string;
  }[];
}
