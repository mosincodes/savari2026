import {
  getBypassPasswordOrNull,
  isPkPhoneEligibleForOtpBypass,
} from "@/lib/skip-otp-bypass";
import { normalizeLocalPkPhone, pkComparableMobile10, toE164Pakistan } from "@/lib/constants";

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

async function ensurePhoneUserHasPassword(
  admin: ReturnType<typeof createAdminClient>,
  phoneE164: string,
  password: string,
) {
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
    console.error("createUser bypass:", createErr.message);
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
      const { error: updErr } = await admin.auth.admin.updateUserById(u.id, { password, phone_confirm: true });
      if (updErr) throw new Error(updErr.message);
      return;
    }
    const lastPage =
      typeof (data as { lastPage?: number }).lastPage === "number"
        ? (data as { lastPage: number }).lastPage
        : null;
    if (lastPage != null && page >= lastPage) break;
  }

  throw new Error("Bypass: user exists but was not found in admin list.");
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
