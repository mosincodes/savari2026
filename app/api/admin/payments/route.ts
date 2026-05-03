import { createAdminClient } from "@/lib/supabase/admin";
import { requireSession, requireAdminSession } from "@/lib/api-middleware";
import { jsonOk, runApi } from "@/lib/api-response";
import { listPendingPaymentBookings } from "@/lib/db/queries/admin.queries";

export async function GET() {
  return runApi(async () => {
    const { user } = await requireSession();
    await requireAdminSession(user.id);
    const admin = createAdminClient();
    const rows = await listPendingPaymentBookings(admin);
    return jsonOk(rows);
  });
}
