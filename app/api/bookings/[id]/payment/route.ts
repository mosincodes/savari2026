import type { NextRequest } from "next/server";
import { bookingPaymentSubmitSchema } from "@/lib/validations";
import { requireOnboardedSession, requireAdminSession, readJsonBody } from "@/lib/api-middleware";
import { jsonOk, runApi, zodErrorToValidation } from "@/lib/api-response";
import { ForbiddenError, ApiError } from "@/lib/api-error";
import {
  confirmBookingPaymentAdmin,
  submitBookingPaymentForPassenger,
} from "@/lib/services/bookings-service";

type RouteParams = { params: Promise<{ id: string }> };

/** Passenger submits JazzCash/EasyPaisa reference */
export async function POST(request: NextRequest, context: RouteParams) {
  return runApi(async () => {
    const { id } = await context.params;
    const { user } = await requireOnboardedSession();
    const body = await readJsonBody(request);
    const merged =
      typeof body === "object" && body !== null ? { ...(body as object), booking_id: id } : { booking_id: id };
    const parsed = bookingPaymentSubmitSchema.safeParse(merged);
    if (!parsed.success) throw zodErrorToValidation(parsed.error);

    const res = await submitBookingPaymentForPassenger(user.id, parsed.data);
    if (!res.ok) {
      throw new ApiError(res.message ?? "Payment submit failed", "PAYMENT_SUBMIT_FAILED", 400);
    }

    return jsonOk({ pending_review: true as const });
  });
}

/** Admin confirms manual payment */
export async function PATCH(_request: NextRequest, context: RouteParams) {
  return runApi(async () => {
    const { id } = await context.params;
    const { user } = await requireOnboardedSession();
    await requireAdminSession(user.id);

    const res = await confirmBookingPaymentAdmin(id, user.id);
    if (!res.ok) {
      if (res.message === "Forbidden") throw new ForbiddenError();
      throw new ApiError(res.message ?? "Confirm failed", "PAYMENT_CONFIRM_FAILED", 400);
    }

    return jsonOk({ paid: true as const });
  });
}
