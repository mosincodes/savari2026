import type { NextRequest } from "next/server";
import { requireOnboardedSession } from "@/lib/api-middleware";
import { jsonOk, runApi } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { markRideCompletedForDriver } from "@/lib/services/rides-service";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, context: RouteParams) {
  return runApi(async () => {
    const { id } = await context.params;
    const { user } = await requireOnboardedSession();
    const result = await markRideCompletedForDriver(id, user.id);
    if (!result.ok) {
      throw new ApiError(result.message ?? "Could not complete ride", "RIDE_COMPLETE_FAILED", 400);
    }
    return jsonOk({ completed: true as const });
  });
}
