import { createHmac } from "node:crypto";

import { pkComparableMobile10 } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";

export type MintSessionResult =
  | { ok: true; access_token: string; refresh_token: string }
  | { ok: false; reason: "misconfigured" | "auth_failed"; message?: string };

/**
 * Deterministic, server-only password for a phone user. We never expose it; it
 * only exists so the admin client can `signInWithPassword` after we've verified
 * ownership of the number via our own OTP channel (WhatsApp). Derived via HMAC
 * so it is stable across logins without storing anything extra.
 */
function derivePhonePassword(phoneE164: string): string {
  const secret =
    process.env.WHATSAPP_OTP_SESSION_SECRET ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error(
      "Missing WHATSAPP_OTP_SESSION_SECRET (or SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY) to derive the phone session password.",
    );
  }
  return createHmac("sha256", secret).update(`savari:phone:${phoneE164}`).digest("hex");
}

/** Create the phone auth user (confirmed) with `password`, or update an existing one. */
export async function ensurePhoneUserHasPassword(
  admin: ReturnType<typeof createAdminClient>,
  phoneE164: string,
  password: string,
): Promise<void> {
  const { error: createErr } = await admin.auth.admin.createUser({
    phone: phoneE164,
    phone_confirm: true,
    password,
  });
  if (!createErr) return;

  const dupish =
    /already registered|already exists|duplicate|Database error/i.test(createErr.message) ||
    (createErr as { status?: number }).status === 422;

  if (!dupish) {
    console.error("createUser phone-session:", createErr.message);
    throw new Error(createErr.message);
  }

  for (let page = 1; page <= 50; page++) {
    const { data, error: listErr } = await admin.auth.admin.listUsers({ page, perPage: 500 });
    if (listErr) throw new Error(listErr.message);
    const rows = data?.users ?? [];
    if (rows.length === 0) break;
    const needle = pkComparableMobile10(phoneE164);
    const u =
      needle != null
        ? rows.find((x) => pkComparableMobile10(x.phone) === needle)
        : rows.find((x) => x.phone === phoneE164);
    if (u) {
      const { error: updErr } = await admin.auth.admin.updateUserById(u.id, {
        password,
        phone_confirm: true,
      });
      if (updErr) throw new Error(updErr.message);
      return;
    }
    const lastPage =
      typeof (data as { lastPage?: number }).lastPage === "number"
        ? (data as { lastPage: number }).lastPage
        : null;
    if (lastPage != null && page >= lastPage) break;
  }

  throw new Error("Phone user exists but was not found in admin list.");
}

/**
 * Mint a Supabase session for a phone number that has ALREADY been verified by
 * the caller (e.g. via WhatsApp OTP). Returns access/refresh tokens to set as
 * session cookies. Does NOT itself verify ownership — only call after OTP check.
 */
export async function mintSessionForPhone(phoneE164: string): Promise<MintSessionResult> {
  let admin: ReturnType<typeof createAdminClient>;
  let password: string;
  try {
    admin = createAdminClient();
    password = derivePhonePassword(phoneE164);
  } catch (e) {
    return {
      ok: false,
      reason: "misconfigured",
      message: e instanceof Error ? e.message : "Server auth not configured.",
    };
  }

  try {
    await ensurePhoneUserHasPassword(admin, phoneE164, password);
  } catch (e) {
    return {
      ok: false,
      reason: "auth_failed",
      message: e instanceof Error ? e.message : "Could not prepare account.",
    };
  }

  const { data, error } = await admin.auth.signInWithPassword({ phone: phoneE164, password });
  if (error || !data.session) {
    return { ok: false, reason: "auth_failed", message: error?.message ?? "Sign-in failed." };
  }

  return {
    ok: true,
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  };
}
