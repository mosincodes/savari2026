import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { rideCreateSchema } from "@/lib/validations";
import type { RideActionState } from "@/lib/types/form-states";
import { revalidateRidesAffected } from "@/lib/services/revalidate-tags";

export type RideCreateInput = z.infer<typeof rideCreateSchema>;

async function persistNewRide(driverUserId: string, d: RideCreateInput): Promise<RideActionState> {
  const supabase = await createClient();
  const timeStr = d.departure_time.length === 5 ? `${d.departure_time}:00` : d.departure_time;
  const returnRaw = (d.return_time || "").trim();
  const returnTimeStr =
    returnRaw.length === 0 ? null : returnRaw.length === 5 ? `${returnRaw}:00` : returnRaw;

  const { data, error } = await supabase
    .from("rides")
    .insert({
      driver_id: driverUserId,
      vehicle_id: d.vehicle_id || null,
      from_area: d.from_area,
      from_area_other: d.from_area === "Other" ? d.from_area_other : null,
      to_area: d.to_area,
      to_area_other: d.to_area === "Other" ? d.to_area_other : null,
      departure_time: timeStr,
      return_time: returnTimeStr,
      days: d.days,
      seats_available: d.seats_available,
      women_only: d.women_only ?? false,
      meeting_point: d.meeting_point || null,
      notes: d.notes || null,
      status: "active",
    })
    .select("id")
    .single();

  if (error) {
    console.error(error);
    return { ok: false, message: error.message };
  }

  revalidateRidesAffected(driverUserId, data.id);
  revalidatePath("/dashboard");
  return { ok: true, id: data.id };
}

export async function createRideForDriver(
  driverUserId: string | null | undefined,
  input: RideCreateInput,
): Promise<RideActionState> {
  if (!driverUserId) return { ok: false, message: "Not logged in" };
  return persistNewRide(driverUserId, input);
}

export async function createRideFromFormData(formData: FormData): Promise<RideActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not logged in" };

  const days = formData.getAll("days").map(String);
  const raw: Record<string, unknown> = {
    from_area: formData.get("from_area"),
    from_area_other: formData.get("from_area_other") || "",
    to_area: formData.get("to_area"),
    to_area_other: formData.get("to_area_other") || "",
    departure_time: formData.get("departure_time"),
    return_time: (formData.get("return_time") as string)?.trim() || "",
    days,
    seats_available: formData.get("seats_available"),
    women_only: formData.get("women_only") === "on",
    meeting_point: formData.get("meeting_point") || "",
    notes: formData.get("notes") || "",
    vehicle_id: formData.get("vehicle_id") || undefined,
  };

  const parsed = rideCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || "Invalid" };
  }

  return persistNewRide(user.id, parsed.data);
}

export async function markRideCompletedForDriver(rideId: string, driverUserId: string): Promise<RideActionState> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("rides")
    .update({ status: "completed", updated_at: new Date().toISOString() })
    .eq("id", rideId)
    .eq("driver_id", driverUserId);

  if (error) return { ok: false, message: error.message };
  revalidateRidesAffected(driverUserId, rideId);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function cancelRideForDriver(rideId: string, driverUserId: string): Promise<RideActionState> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("rides")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", rideId)
    .eq("driver_id", driverUserId);

  if (error) return { ok: false, message: error.message };
  revalidateRidesAffected(driverUserId, rideId);
  return { ok: true };
}
