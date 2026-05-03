import type { NextRequest } from "next/server";
import { matchStatusBodySchema } from "@/lib/validations";
import { requireSession, requireAdminSession, readJsonBody } from "@/lib/api-middleware";
import { jsonOk, runApi, zodErrorToValidation } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { updateMatchStatusForAdmin } from "@/lib/services/admin-service";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteParams) {
  return runApi(async () => {
    const { id } = await context.params;
    const { user } = await requireSession();
    await requireAdminSession(user.id);
    const raw = await readJsonBody(request);
    const parsed = matchStatusBodySchema.safeParse(raw);
    if (!parsed.success) throw zodErrorToValidation(parsed.error);

    const res = await updateMatchStatusForAdmin(id, parsed.data.status);
    if (!res.ok) throw new ApiError(res.message, "MATCH_UPDATE_FAILED", 400);
    return jsonOk({ status: parsed.data.status });
  });
}
