import type { NextRequest } from "next/server";
import { vehiclePatchSchema } from "@/lib/validations";
import { requireOnboardedSession, readJsonBody } from "@/lib/api-middleware";
import { jsonOk, runApi, zodErrorToValidation } from "@/lib/api-response";
import { ApiError, ForbiddenError, NotFoundError } from "@/lib/api-error";
import { updateVehicleForDriver } from "@/lib/services/vehicles-service";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteParams) {
  return runApi(async () => {
    const { id } = await context.params;
    const { user, supabase } = await requireOnboardedSession();
    const { data, error } = await supabase
      .from("vehicles")
      .select("id, driver_id, make_model, color, number_plate, total_seats")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new ApiError(error.message, "VEHICLE_READ_FAILED", 400);
    if (!data) throw new NotFoundError("Vehicle");
    if (data.driver_id !== user.id) throw new ForbiddenError();

    const { driver_id: _omit, ...rest } = data;
    void _omit;
    return jsonOk(rest);
  });
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  return runApi(async () => {
    const { id } = await context.params;
    const { user } = await requireOnboardedSession();
    const raw = await readJsonBody(request);
    const parsed = vehiclePatchSchema.safeParse(raw);
    if (!parsed.success) throw zodErrorToValidation(parsed.error);

    const res = await updateVehicleForDriver(id, user.id, parsed.data);
    if ("error" in res) throw new ApiError(res.error, "VEHICLE_UPDATE_FAILED", 400);
    return jsonOk({ updated: true as const });
  });
}

export async function DELETE(_request: NextRequest, context: RouteParams) {
  return runApi(async () => {
    const { id } = await context.params;
    const { user, supabase } = await requireOnboardedSession();
    const { data, error } = await supabase.from("vehicles").delete().eq("id", id).eq("driver_id", user.id).select("id");
    if (error) throw new ApiError(error.message, "VEHICLE_DELETE_FAILED", 400);
    if (!data?.length) throw new NotFoundError("Vehicle");
    return jsonOk({ deleted: true as const });
  });
}
