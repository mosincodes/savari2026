import type { NextRequest } from "next/server";
import { requireOnboardedSession } from "@/lib/api-middleware";
import { jsonOk, runApi } from "@/lib/api-response";
import { listRatingsReceived } from "@/lib/db/queries/profiles.queries";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteParams) {
  return runApi(async () => {
    const { id } = await context.params;
    const { supabase } = await requireOnboardedSession();

    const ratings = await listRatingsReceived(supabase, id);
    return jsonOk(ratings);
  });
}
