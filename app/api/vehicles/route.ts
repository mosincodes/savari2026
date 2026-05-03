import type { NextRequest } from "next/server";
import { vehicleCreateBodySchema } from "@/lib/validations";
import { requireOnboardedSession, readJsonBody } from "@/lib/api-middleware";
import { jsonCreated, jsonOk, runApi, zodErrorToValidation } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { insertVehicleForDriver, getMyVehicles } from "@/lib/services/vehicles-service";

export async function GET() {
  return runApi(async () => {
    const { user } = await requireOnboardedSession();
    const rows = await getMyVehicles(user.id);
    return jsonOk(rows);
  });
}

export async function POST(request: NextRequest) {
  return runApi(async () => {
    const { user } = await requireOnboardedSession();
    const raw = await readJsonBody(request);
    const parsed = vehicleCreateBodySchema.safeParse(raw);
    if (!parsed.success) throw zodErrorToValidation(parsed.error);

    const res = await insertVehicleForDriver(user.id, parsed.data);
    if ("error" in res) throw new ApiError(res.error, "VEHICLE_CREATE_FAILED", 400);

    return jsonCreated({ id: res.id });
  });
}
