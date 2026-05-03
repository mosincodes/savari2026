import type { NextRequest } from "next/server";
import { requireOnboardedSession } from "@/lib/api-middleware";
import { jsonOk, runApi } from "@/lib/api-response";
import { NotFoundError, ApiError } from "@/lib/api-error";
import { getRideDetailBundle } from "@/lib/db/queries/rides.queries";
import { cancelRideForDriver } from "@/lib/services/rides-service";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteParams) {
  return runApi(async () => {
    const { id } = await context.params;
    const { user, supabase } = await requireOnboardedSession();
    const bundle = await getRideDetailBundle(supabase, id, user.id);
    if (!bundle) throw new NotFoundError("Ride not found");
    return jsonOk(bundle);
  });
}

export async function DELETE(_request: NextRequest, context: RouteParams) {
  return runApi(async () => {
    const { id } = await context.params;
    const { user } = await requireOnboardedSession();
    const result = await cancelRideForDriver(id, user.id);
    if (!result.ok) {
      throw new ApiError(result.message ?? "Could not cancel ride", "RIDE_CANCEL_FAILED", 400);
    }
    return jsonOk({ cancelled: true as const });
  });
}
