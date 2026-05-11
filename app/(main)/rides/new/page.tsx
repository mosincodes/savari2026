import { requireOnboardedProfile } from "@/lib/require-profile";
import { NewRideForm } from "@/components/forms/new-ride-form";
import { listVehiclesForDriver } from "@/lib/db/queries/vehicles.queries";

export default async function NewRidePage() {
  const { supabase, user } = await requireOnboardedProfile();
  const vehicles = await listVehiclesForDriver(supabase, user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="space-y-2">
        <h1 className="font-heading text-4xl tracking-tight">Post a ride</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Share route, timings, seats, and a clear meet point — helps passengers decide fast.
        </p>
      </header>
      <NewRideForm vehicles={vehicles || []} />
    </div>
  );
}
