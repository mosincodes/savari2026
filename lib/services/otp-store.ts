import { createAdminClient } from "@/lib/supabase/admin";

type OtpRow = { token: string; expiresAt: Date; usedAt: Date | null };

/** Dev-only fallback when Supabase is paused or unreachable (single-process). */
const memoryByPhone = new Map<string, OtpRow[]>();

function isNetworkError(message: string): boolean {
  return /fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|network|getaddrinfo/i.test(message);
}

function memoryFallbackEnabled(): boolean {
  if (process.env.OTP_STORE === "memory") return true;
  if (process.env.OTP_STORE === "supabase") return false;
  return process.env.NODE_ENV !== "production";
}

function storeInMemory(phoneE164: string, token: string, expiresAt: Date): void {
  const rows = memoryByPhone.get(phoneE164) ?? [];
  for (const row of rows) {
    if (!row.usedAt) row.usedAt = new Date();
  }
  rows.unshift({ token, expiresAt, usedAt: null });
  memoryByPhone.set(phoneE164, rows.slice(0, 5));
}

function verifyInMemory(phoneE164: string, token: string): boolean {
  const rows = memoryByPhone.get(phoneE164) ?? [];
  const row = rows.find((r) => r.token === token && !r.usedAt);
  if (!row) return false;
  if (row.expiresAt < new Date()) return false;
  row.usedAt = new Date();
  return true;
}

async function storeInSupabase(phoneE164: string, token: string, expiresAt: Date): Promise<void> {
  const admin = createAdminClient();
  const expiresIso = expiresAt.toISOString();
  const usedIso = new Date().toISOString();

  await admin
    .from("otp_verifications")
    .update({ used_at: usedIso })
    .eq("phone", phoneE164)
    .is("used_at", null);

  const { error } = await admin.from("otp_verifications").insert({
    phone: phoneE164,
    token,
    expires_at: expiresIso,
  });

  if (error) throw new Error(error.message);
}

async function verifyInSupabase(phoneE164: string, token: string): Promise<boolean> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("otp_verifications")
    .select("id, expires_at, used_at")
    .eq("phone", phoneE164)
    .eq("token", token)
    .is("used_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return false;
  if (new Date(String(data.expires_at)) < new Date()) return false;

  await admin.from("otp_verifications").update({ used_at: new Date().toISOString() }).eq("id", data.id);
  return true;
}

export function formatOtpStoreError(raw: string): string {
  if (isNetworkError(raw)) {
    const host = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "your Supabase URL";
    if (process.env.NODE_ENV === "production") {
      return (
        `Cannot reach Supabase (${host}). The project URL does not resolve — it may have been deleted or env vars point to the wrong project. ` +
        "In Supabase Dashboard, open or create your project, copy Settings → API URL and keys, update them on Vercel, redeploy, then run pending SQL migrations."
      );
    }
    return (
      `Cannot reach Supabase (${host}). The project may be paused, deleted, or the URL is wrong. ` +
      "Restore or create the project in the Supabase dashboard and update .env.local. " +
      "For local WhatsApp-only testing without Supabase, set OTP_STORE=memory in .env.local."
    );
  }
  return raw.startsWith("OTP store failed:") ? raw : `OTP store failed: ${raw}`;
}

/** Persist OTP for verification. Falls back to in-memory store in local dev when Supabase is down. */
export async function storeOtp(phoneE164: string, token: string, expiresAt: Date): Promise<void> {
  if (process.env.OTP_STORE === "memory") {
    storeInMemory(phoneE164, token, expiresAt);
    console.warn("OTP store: using in-memory store (OTP_STORE=memory).");
    return;
  }

  try {
    await storeInSupabase(phoneE164, token, expiresAt);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (memoryFallbackEnabled() && isNetworkError(message)) {
      storeInMemory(phoneE164, token, expiresAt);
      console.warn(
        "OTP store: Supabase unreachable — using in-memory fallback for this dev server. " +
          "Login will still fail until Supabase is restored (session minting needs Auth).",
      );
      return;
    }
    throw new Error(formatOtpStoreError(message));
  }
}

/** Verify OTP from Supabase or the in-memory dev fallback. */
export async function verifyOtp(phoneE164: string, token: string): Promise<boolean> {
  if (process.env.OTP_STORE === "memory") {
    return verifyInMemory(phoneE164, token);
  }

  try {
    return await verifyInSupabase(phoneE164, token);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (memoryFallbackEnabled() && isNetworkError(message)) {
      return verifyInMemory(phoneE164, token);
    }
    console.error("OTP verify store error:", message);
    return false;
  }
}
