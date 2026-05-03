"use server";

import { createClient } from "@/lib/supabase/server";
import type { RideActionState } from "@/lib/types/form-states";
import {
  cancelRideForDriver,
  createRideFromFormData,
  markRideCompletedForDriver,
} from "@/lib/services/rides-service";

export type { RideActionState } from "@/lib/types/form-states";

export async function createRide(
  _prev: RideActionState | undefined,
  formData: FormData,
): Promise<RideActionState> {
  return createRideFromFormData(formData);
}

export async function markRideCompleted(rideId: string): Promise<RideActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not logged in" };
  return markRideCompletedForDriver(rideId, user.id);
}

export async function cancelRide(rideId: string): Promise<RideActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not logged in" };
  return cancelRideForDriver(rideId, user.id);
}
