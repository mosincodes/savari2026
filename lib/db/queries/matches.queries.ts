import type { SupabaseClient } from "@supabase/supabase-js";

/** Admin client (service role) — selects signups lists for matching UI */
export async function listRecentSignupDrivers(
  admin: SupabaseClient,
  limit = 100,
): Promise<{ id: string; full_name: string; whatsapp_phone: string; route_from: string; route_to: string }[]> {
  const { data, error } = await admin
    .from("driver_signups")
    .select("id, full_name, whatsapp_phone, route_from, route_to")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data || []) as {
    id: string;
    full_name: string;
    whatsapp_phone: string;
    route_from: string;
    route_to: string;
  }[];
}

export async function listRecentSignupPassengers(
  admin: SupabaseClient,
  limit = 100,
): Promise<{ id: string; full_name: string; whatsapp_phone: string; route_from: string; route_to: string }[]> {
  const { data, error } = await admin
    .from("passenger_signups")
    .select("id, full_name, whatsapp_phone, route_from, route_to")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data || []) as {
    id: string;
    full_name: string;
    whatsapp_phone: string;
    route_from: string;
    route_to: string;
  }[];
}

export async function listRecentMatches(admin: SupabaseClient, limit = 100): Promise<Record<string, unknown>[]> {
  const { data, error } = await admin.from("matches").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  return (data || []) as Record<string, unknown>[];
}
