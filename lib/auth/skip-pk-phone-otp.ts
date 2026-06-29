import {
  getBypassPasswordOrNull,
  isPkPhoneEligibleForOtpBypass,
} from "@/lib/skip-otp-bypass";
import { normalizeLocalPkPhone, toE164Pakistan } from "@/lib/constants";
import { ensurePhoneUserHasPassword } from "@/lib/auth/phone-session";

import { createAdminClient } from "@/lib/supabase/admin";

export type SkipPkOtpResult =
  | { ok: true; access_token: string; refresh_token: string }
  | { ok: false; reason: "not_eligible" | "misconfigured" | "auth_failed"; message?: string };

function toE164FromLoginInput(raw: string): string | null {
  const trimmed = raw.trim();
  const local = normalizeLocalPkPhone(trimmed);
  if (local) return toE164Pakistan(local);
  const d = trimmed.replace(/\D/g, "");
  if (d.startsWith("92") && d.length === 12) return `+${d}`;
  if (d.startsWith("0") && d.length === 11) return toE164Pakistan(d);
  return null;
}

function hintForPrivilegedKeyInvalid(): string {
  return "Invalid privileged API key: set SUPABASE_SECRET_KEY (sb_secret_…) or legacy SUPABASE_SERVICE_ROLE_KEY from the same project as NEXT_PUBLIC_SUPABASE_URL—not the publishable anon key.";
}

/** Skip SMS OTP for allowlisted PK numbers when bypass env password is configured. */
export async function skipPkPhoneOtpIfAllowed(phoneRaw: string): Promise<SkipPkOtpResult> {
  const password = getBypassPasswordOrNull();
  if (!password) {
    return { ok: false, reason: "not_eligible" };
  }

  const e164 = toE164FromLoginInput(phoneRaw);
  if (!e164 || !isPkPhoneEligibleForOtpBypass(e164)) {
    return { ok: false, reason: "not_eligible" };
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch (e) {
    return {
      ok: false,
      reason: "misconfigured",
      message: e instanceof Error ? e.message : "Server auth not configured.",
    };
  }

  try {
    await ensurePhoneUserHasPassword(admin, e164, password);
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Could not prepare bypass account.";
    const msg = /invalid api key/i.test(raw) ? hintForPrivilegedKeyInvalid() : raw;
    return { ok: false, reason: "auth_failed", message: msg };
  }

  const { data, error } = await admin.auth.signInWithPassword({
    phone: e164,
    password,
  });

  if (error || !data.session) {
    const raw = error?.message ?? "Sign-in failed.";
    const msg = /invalid api key/i.test(raw) ? hintForPrivilegedKeyInvalid() : raw;
    return { ok: false, reason: "auth_failed", message: msg };
  }

  return {
    ok: true,
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  };
}
