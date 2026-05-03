import type { NextRequest } from "next/server";
import { matchCreateBodySchema } from "@/lib/validations";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSession, requireAdminSession, readJsonBody } from "@/lib/api-middleware";
import { jsonCreated, jsonOk, runApi, zodErrorToValidation } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import {
  listRecentSignupDrivers,
  listRecentSignupPassengers,
  listRecentMatches,
} from "@/lib/db/queries/matches.queries";
import { insertSignupMatchForAdmin } from "@/lib/services/admin-service";

export async function GET() {
  return runApi(async () => {
    const { user } = await requireSession();
    await requireAdminSession(user.id);
    const admin = createAdminClient();
    const [signupDrivers, signupPassengers, matches] = await Promise.all([
      listRecentSignupDrivers(admin, 100),
      listRecentSignupPassengers(admin, 100),
      listRecentMatches(admin, 100),
    ]);
    return jsonOk({
      signupDrivers,
      signupPassengers,
      matches,
    });
  });
}

export async function POST(request: NextRequest) {
  return runApi(async () => {
    const { user } = await requireSession();
    await requireAdminSession(user.id);
    const raw = await readJsonBody(request);
    const parsed = matchCreateBodySchema.safeParse(raw);
    if (!parsed.success) throw zodErrorToValidation(parsed.error);

    const res = await insertSignupMatchForAdmin(parsed.data);
    if (!res.ok) throw new ApiError(res.message, "MATCH_CREATE_FAILED", 400);

    return jsonCreated({ recorded: true as const });
  });
}
