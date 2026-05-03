import type { NextRequest } from "next/server";
import { rideCreateSchema, ridesListQuerySchema } from "@/lib/validations";
import { requireOnboardedSession, readJsonBody } from "@/lib/api-middleware";
import { ApiError } from "@/lib/api-error";
import { jsonCreated, jsonOk, runApi, zodErrorToValidation } from "@/lib/api-response";
import { listActiveRidesForBrowse } from "@/lib/db/queries/rides.queries";
import { createRideForDriver, type RideCreateInput } from "@/lib/services/rides-service";

export async function GET(request: NextRequest) {
  return runApi(async () => {
    const { user, supabase } = await requireOnboardedSession();
    const sp = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsedQuery = ridesListQuerySchema.safeParse(sp);
    if (!parsedQuery.success) throw zodErrorToValidation(parsedQuery.error);

    const q = parsedQuery.data;
    const { rows, meta } = await listActiveRidesForBrowse(supabase, {
      excludeDriverId: user.id,
      from_area: q.from || undefined,
      to_area: q.to || undefined,
      around_time: q.around || undefined,
      pagination: {
        page: q.page,
        pageSize: q.pageSize,
      },
    });
    return jsonOk(rows, { meta: { pagination: meta } });
  });
}

export async function POST(request: NextRequest) {
  return runApi(async () => {
    const { user } = await requireOnboardedSession();
    const body = await readJsonBody(request);
    const parsed = rideCreateSchema.safeParse(body);
    if (!parsed.success) throw zodErrorToValidation(parsed.error);

    const res = await createRideForDriver(user.id, parsed.data as RideCreateInput);
    if (!res.ok) {
      throw new ApiError(res.message ?? "Could not create ride", "CREATE_RIDE_FAILED", 400);
    }
    if (!res.id) {
      throw new ApiError("Could not create ride", "CREATE_RIDE_FAILED", 400);
    }

    return jsonCreated<{ id: string }>({ id: res.id });
  });
}
