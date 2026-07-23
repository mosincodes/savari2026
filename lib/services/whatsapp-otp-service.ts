import { storeOtp, verifyOtp } from "@/lib/services/otp-store";
import { sendWhatsAppMessage } from "@/lib/services/whatsapp-transport";

const OTP_TTL_MINUTES = 10;

function generateOtpToken(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Generate a 6-digit OTP, persist it, and return the token. */
export async function createWhatsAppOtp(phoneE164: string): Promise<string> {
  const token = generateOtpToken();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  await storeOtp(phoneE164, token, expiresAt);
  return token;
}

/** Send the OTP via Baileys (local or production gateway). */
export async function sendWhatsAppOtp(phoneE164: string, token: string): Promise<void> {
  await sendWhatsAppMessage(
    phoneE164,
    `Your Savari verification code is: *${token}*\n\nThis code expires in ${OTP_TTL_MINUTES} minutes. Do not share it with anyone.`,
  );
}

/** Verify OTP. Returns true and marks it used; false if invalid/expired. */
export async function verifyWhatsAppOtp(phoneE164: string, token: string): Promise<boolean> {
  return verifyOtp(phoneE164, token);
}
