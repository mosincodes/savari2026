import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { sosBodySchema } from "@/lib/validations";
import { requireSession, readJsonBody } from "@/lib/api-middleware";
import { runApi, zodErrorToValidation, jsonErrorResponse } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { triggerSosForUser } from "@/lib/services/sos-service";

export async function POST(req: NextRequest) {
  return runApi(async () => {
    const { user } = await requireSession();
    const raw = await readJsonBody(req);
    const parsed = sosBodySchema.safeParse(raw);
    if (!parsed.success) throw zodErrorToValidation(parsed.error);

    const msg = await triggerSosForUser(user.id, parsed.data.ride_id);
    if (!msg.ok) {
      return jsonErrorResponse(
        new ApiError(msg.error, msg.status >= 500 ? "SOS_TWILIO" : "SOS_FAILED", msg.status),
      );
    }

    /** Legacy clients read `{ ok: true }` instead of `{ data }` envelopes. */
    return NextResponse.json({ ok: true });
  });
}
