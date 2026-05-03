import { normalizeLocalPkPhone, toE164Pakistan } from "@/lib/constants";

/** E.164 allowlist entries for OTP-free phone login (set password server-side via admin); requires env password. */
const DEFAULT_SKIP_OTP_E164_ALLOWLIST = new Set<string>(["+923224577544","+923222221332","+923222256668"]);

function e164PkToLocalZeroThree(e164: string): string | null {
  const d = e164.replace(/\D/g, "");
  if (!d.startsWith("92") || d.length !== 12) return null;
  return `0${d.slice(2)}`;
}

/** Local 03… numbers in {@link DEFAULT_SKIP_OTP_E164_ALLOWLIST}; login tries server bypass before OTP. */
export const SKIP_OTP_DEFAULT_LOCAL_PK: readonly string[] = [...DEFAULT_SKIP_OTP_E164_ALLOWLIST]
  .map((e164) => e164PkToLocalZeroThree(e164))
  .filter((x): x is string => x != null);

export function shouldTryPkOtpBypassBeforeOtp(localPk03: string): boolean {
  console.log("localPk03",localPk03,SKIP_OTP_DEFAULT_LOCAL_PK)
  return SKIP_OTP_DEFAULT_LOCAL_PK.includes(localPk03);
}

/** Comma-separated E.164 (e.g. +923…) or local 03… in SKIP_OTP_BYPASS_PK_PHONES extends the defaults. */
function parseExtraAllowlist(): Set<string> {
  const raw = process.env.SKIP_OTP_BYPASS_PK_PHONES ?? "";
  const set = new Set<string>();
  for (const part of raw.split(",")) {
    const t = part.trim();
    if (!t) continue;
    if (t.startsWith("+")) {
      const digits = t.replace(/\D/g, "");
      if (digits.startsWith("92") && digits.length === 12) set.add(`+${digits}`);
      continue;
    }
    const local = normalizeLocalPkPhone(t);
    if (local) set.add(toE164Pakistan(local));
  }
  return set;
}

export function pkPhoneBypassPasswordConfigured(): boolean {
  const pw = process.env.SKIP_OTP_BYPASS_PK_PHONES_PASSWORD;
  return typeof pw === "string" && pw.length >= 8;
}

/** Whether this E.164 is allowed to bypass OTP when password env is set. */
export function isPkPhoneEligibleForOtpBypass(e164: string): boolean {
  if (!pkPhoneBypassPasswordConfigured()) return false;
  const extras = parseExtraAllowlist();
  return DEFAULT_SKIP_OTP_E164_ALLOWLIST.has(e164) || extras.has(e164);
}

export function getBypassPasswordOrNull(): string | null {
  const pw = process.env.SKIP_OTP_BYPASS_PK_PHONES_PASSWORD;
  console.log("localpw",pw)
  return typeof pw === "string" && pw.length >= 8 ? pw : null;
}
