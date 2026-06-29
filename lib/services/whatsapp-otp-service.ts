import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsAppText } from "@/lib/services/baileys-whatsapp";

const OTP_TTL_MINUTES = 10;

function generateOtpToken(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Generate a 6-digit OTP, persist it, and return the token. */
export async function createWhatsAppOtp(phoneE164: string): Promise<string> {
  const admin = createAdminClient();
  const token = generateOtpToken();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

  // Invalidate any prior unused OTPs for this number.
  await admin.from("otp_verifications").update({ used_at: new Date().toISOString() }).eq("phone", phoneE164).is("used_at", null);

  const { error } = await admin.from("otp_verifications").insert({
    phone: phoneE164,
    token,
    expires_at: expiresAt,
  });

  if (error) throw new Error(`OTP store failed: ${error.message}`);

  return token;
}

/** Send the OTP via the self-hosted Baileys WhatsApp transport (free). */
export async function sendWhatsAppOtp(phoneE164: string, token: string): Promise<void> {
  await sendWhatsAppText(
    phoneE164,
    `Your Savari verification code is: *${token}*\n\nThis code expires in ${OTP_TTL_MINUTES} minutes. Do not share it with anyone.`,
  );
}

/** Verify OTP. Returns true and marks it used; false if invalid/expired. */
export async function verifyWhatsAppOtp(phoneE164: string, token: string): Promise<boolean> {
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

  if (error || !data) return false;

  if (new Date(data.expires_at) < new Date()) return false;

  await admin.from("otp_verifications").update({ used_at: new Date().toISOString() }).eq("id", data.id);

  return true;
}
