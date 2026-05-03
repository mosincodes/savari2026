import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import twilio from "twilio";
import { ForbiddenError, UnauthorizedError } from "@/lib/api-error";
import { adminUserIdsFromEnv } from "@/lib/auth/admin-policy";
import { revalidateAdminSurfaces } from "@/lib/services/revalidate-tags";

async function loadAdminGateUserOrThrow(): Promise<{ id: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new UnauthorizedError();
  const envIds = adminUserIdsFromEnv();
  if (envIds.has(user.id)) return user;

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) throw new ForbiddenError();
  return user;
}

export async function insertSignupMatchForAdmin(input: {
  driver_signup_id: string;
  passenger_signup_id: string;
  notes?: string | null;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  await loadAdminGateUserOrThrow();
  const admin = createAdminClient();

  const { error } = await admin.from("matches").insert({
    driver_signup_id: input.driver_signup_id,
    passenger_signup_id: input.passenger_signup_id,
    status: "pending",
    notes: input.notes ?? null,
  });

  if (error) {
    console.error(error);
    return { ok: false, message: error.message };
  }

  revalidateAdminSurfaces();
  return { ok: true };
}

export async function createSignupMatchFromForm(formData: FormData): Promise<void> {
  const driver_signup_id = formData.get("driver_signup_id") as string;
  const passenger_signup_id = formData.get("passenger_signup_id") as string;
  const notes = (formData.get("notes") as string) || null;

  if (!driver_signup_id || !passenger_signup_id) {
    console.error("createSignupMatch: missing ids");
    return;
  }

  const res = await insertSignupMatchForAdmin({ driver_signup_id, passenger_signup_id, notes });
  if (!res.ok) {
    console.error(res.message);
  }
}

export async function updateMatchStatusForAdmin(matchId: string, status: string): Promise<{ ok: true } | { ok: false; message: string }> {
  await loadAdminGateUserOrThrow();
  const admin = createAdminClient();
  const { error } = await admin
    .from("matches")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", matchId);
  if (error) return { ok: false, message: error.message };
  revalidateAdminSurfaces();
  return { ok: true };
}

export async function sendMatchSmsForAdmin(toPhoneE164: string, body: string) {
  await loadAdminGateUserOrThrow();
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!sid || !token || !from) {
    return { ok: false as const, message: "Twilio not configured" };
  }
  const client = twilio(sid, token);
  try {
    await client.messages.create({ to: toPhoneE164, from, body });
    return { ok: true as const };
  } catch (e: unknown) {
    const err = e as { message?: string };
    return { ok: false as const, message: err.message || "SMS failed" };
  }
}
