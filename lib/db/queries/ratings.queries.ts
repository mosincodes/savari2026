import type { SupabaseClient } from "@supabase/supabase-js";

export async function insertRating(
  supabase: SupabaseClient,
  input: {
    ride_id: string;
    from_user_id: string;
    to_user_id: string;
    score: number;
    comment: string | null;
  },
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from("ratings").insert({
    ride_id: input.ride_id,
    from_user_id: input.from_user_id,
    to_user_id: input.to_user_id,
    score: input.score,
    comment: input.comment,
  });
  return { error: error ? new Error(error.message) : null };
}
