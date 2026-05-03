import type { NextRequest } from "next/server";
import { profilePatchSchema } from "@/lib/validations";
import { normalizeLocalPkPhone, toE164Pakistan } from "@/lib/constants";
import { requireOnboardedSession, readJsonBody, loadProfileRow } from "@/lib/api-middleware";
import { ValidationApiError } from "@/lib/api-error";
import { jsonOk, runApi, zodErrorToValidation } from "@/lib/api-response";
import { revalidateProfileAffected } from "@/lib/services/revalidate-tags";

export async function GET() {
  return runApi(async () => {
    const { profile } = await requireOnboardedSession();
    return jsonOk(profile);
  });
}

export async function PATCH(request: NextRequest) {
  return runApi(async () => {
    const { user, supabase, profile } = await requireOnboardedSession();
    const body = await readJsonBody(request);
    const parsed = profilePatchSchema.safeParse(body);
    if (!parsed.success) throw zodErrorToValidation(parsed.error);

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (parsed.data.full_name !== undefined) {
      update.full_name = parsed.data.full_name;
    }
    if (parsed.data.emergency_contact_phone !== undefined) {
      const raw = parsed.data.emergency_contact_phone.trim();
      if (raw === "") {
        update.emergency_contact_phone = null;
      } else {
        const local = normalizeLocalPkPhone(raw);
        if (!local) {
          throw new ValidationApiError("Enter emergency contact as 03XXXXXXXXX or leave blank.");
        }
        update.emergency_contact_phone = toE164Pakistan(local);
      }
    }

    const fieldKeys = Object.keys(update).filter((k) => k !== "updated_at");
    if (fieldKeys.length === 0) {
      return jsonOk(profile);
    }

    const { error } = await supabase.from("profiles").update(update).eq("id", user.id);
    if (error) throw new ValidationApiError(error.message);

    const next = await loadProfileRow(supabase, user.id);
    if (next) revalidateProfileAffected(user.id);
    return jsonOk(next || profile);
  });
}
