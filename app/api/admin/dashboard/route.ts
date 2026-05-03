import { requireSession, requireAdminSession } from "@/lib/api-middleware";
import { jsonOk, runApi } from "@/lib/api-response";
import { getCachedAdminDashboardCounts } from "@/lib/db/queries/admin.queries";

export async function GET() {
  return runApi(async () => {
    const { user } = await requireSession();
    await requireAdminSession(user.id);
    const counts = await getCachedAdminDashboardCounts();
    return jsonOk(counts);
  });
}
