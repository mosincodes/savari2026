import type { SupabaseClient } from "@supabase/supabase-js";

export type VehicleRow = {
  id: string;
  make_model: string;
  number_plate: string;
  color?: string;
  driver_id?: string;
};

export async function listVehiclesForDriver(supabase: SupabaseClient, driverId: string): Promise<VehicleRow[]> {
  const { data, error } = await supabase.from("vehicles").select("id, make_model, number_plate").eq("driver_id", driverId);
  if (error) throw new Error(error.message);
  return (data || []) as VehicleRow[];
}
