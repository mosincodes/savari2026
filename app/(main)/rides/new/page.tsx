import { requireOnboardedProfile } from "@/lib/require-profile";
import { NewRideForm } from "@/components/forms/new-ride-form";
import { listVehiclesForDriver } from "@/lib/db/queries/vehicles.queries";

export default async function NewRidePage() {
  const { supabase, user } = await requireOnboardedProfile();
  const vehicles = await listVehiclesForDriver(supabase, user.id);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="font-heading text-3xl tracking-tight">Post a ride</h1>
      <NewRideForm vehicles={vehicles || []} />
    </div>
  );
}
