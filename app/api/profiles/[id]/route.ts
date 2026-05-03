import type { NextRequest } from "next/server";
import { requireOnboardedSession } from "@/lib/api-middleware";
import { jsonOk, runApi } from "@/lib/api-response";
import { NotFoundError } from "@/lib/api-error";
import { getPublicProfileById } from "@/lib/db/queries/profiles.queries";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteParams) {
  return runApi(async () => {
    const { id } = await context.params;
    const { supabase } = await requireOnboardedSession();
    const p = await getPublicProfileById(supabase, id);
    if (!p) throw new NotFoundError("Profile");
    return jsonOk(p);
  });
}
