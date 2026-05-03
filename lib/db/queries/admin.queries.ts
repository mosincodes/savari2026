import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createAdminClient } from "@/lib/supabase/admin";

export async function fetchAdminDashboardCountsUncached(admin: SupabaseClient): Promise<{
  drivers: number;
  passengers: number;
  matches: number;
}> {
  const [dc, pc, mc] = await Promise.all([
    admin.from("driver_signups").select("*", { count: "exact", head: true }),
    admin.from("passenger_signups").select("*", { count: "exact", head: true }),
    admin.from("matches").select("*", { count: "exact", head: true }),
  ]);
  return {
    drivers: dc.count ?? 0,
    passengers: pc.count ?? 0,
    matches: mc.count ?? 0,
  };
}

export const getCachedAdminDashboardCounts = unstable_cache(
  async (): Promise<{ drivers: number; passengers: number; matches: number }> => {
    const admin = createAdminClient();
    return fetchAdminDashboardCountsUncached(admin);
  },
  ["admin-dashboard-counts"],
  { tags: [CACHE_TAGS.adminDashboard] },
);

export async function listDriverSignupsTable(admin: SupabaseClient, limit = 200): Promise<Record<string, unknown>[]> {
  const { data, error } = await admin
    .from("driver_signups")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data || []) as Record<string, unknown>[];
}

export async function listPassengerSignupsTable(
  admin: SupabaseClient,
  limit = 200,
): Promise<Record<string, unknown>[]> {
  const { data, error } = await admin
    .from("passenger_signups")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data || []) as Record<string, unknown>[];
}

export type PendingPaymentRow = {
  id: string;
  payment_ref: string | null;
  payment_method: string | null;
  passenger_id: string;
  ride_id: string;
};

export async function listPendingPaymentBookings(
  admin: SupabaseClient,
  limit = 200,
): Promise<PendingPaymentRow[]> {
  const { data, error } = await admin
    .from("bookings")
    .select("id, payment_ref, payment_method, passenger_id, ride_id")
    .eq("payment_status", "pending_review")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data || []) as PendingPaymentRow[];
}
