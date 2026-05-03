import type { NextRequest } from "next/server";
import { ratingSchema } from "@/lib/validations";
import { requireOnboardedSession, readJsonBody } from "@/lib/api-middleware";
import { jsonCreated, runApi, zodErrorToValidation } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { submitRatingFromInput } from "@/lib/services/bookings-service";

type RouteParams = { params: Promise<{ id: string }> };

/** Rating for a booking's ride — `id` currently unused but keeps REST shape; body must match `ratingSchema` (includes ride_id). */
export async function POST(request: NextRequest, context: RouteParams) {
  return runApi(async () => {
    void context;
    const { user } = await requireOnboardedSession();
    const raw = await readJsonBody(request);
    const parsed = ratingSchema.safeParse(raw);
    if (!parsed.success) throw zodErrorToValidation(parsed.error);

    const res = await submitRatingFromInput(user.id, parsed.data);
    if (!res.ok) {
      throw new ApiError(res.message ?? "Rating failed", "RATING_FAILED", 400);
    }

    return jsonCreated({ rated: true as const });
  });
}
