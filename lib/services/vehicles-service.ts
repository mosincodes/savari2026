import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { vehicleCreateBodySchema } from "@/lib/validations";
import type { VehicleRow } from "@/lib/db/queries/vehicles.queries";
import { listVehiclesForDriver } from "@/lib/db/queries/vehicles.queries";
import type { z } from "zod";

export async function insertVehicleForDriver(
  driverId: string,
  body: z.infer<typeof vehicleCreateBodySchema>,
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .insert({
      driver_id: driverId,
      make_model: body.make_model,
      color: body.color,
      number_plate: body.number_plate,
      total_seats: body.total_seats ?? 4,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  revalidatePath("/rides/new");
  return { id: data.id };
}

export async function getMyVehicles(driverId: string): Promise<VehicleRow[]> {
  const supabase = await createClient();
  return listVehiclesForDriver(supabase, driverId);
}

export async function updateVehicleForDriver(
  vehicleId: string,
  driverId: string,
  patch: Partial<Pick<z.infer<typeof vehicleCreateBodySchema>, "make_model" | "color" | "number_plate" | "total_seats">>,
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  if (Object.keys(patch).length === 0) return { ok: true };
  const { error } = await supabase.from("vehicles").update(patch).eq("id", vehicleId).eq("driver_id", driverId);
  if (error) return { error: error.message };
  revalidatePath("/rides/new");
  return { ok: true };
}
