import { NextRequest, NextResponse } from "next/server";

import { normalizeLocalPkPhone, toE164Pakistan } from "@/lib/constants";
import { otpSendBodySchema } from "@/lib/validations";
import { createClientForRoute } from "@/lib/supabase/route-handler";

/** Server-side OTP send — session cookies are untouched until verification. */
export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON.", code: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = otpSendBodySchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message || "Invalid payload";
    return NextResponse.json({ error: first, code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const local = normalizeLocalPkPhone(parsed.data.phone.replace(/\s/g, ""));
  if (!local) {
    return NextResponse.json(
      { error: "Enter a valid Pakistani number (03XXXXXXXXX).", code: "INVALID_PHONE" },
      { status: 400 },
    );
  }

  const response = NextResponse.json({ ok: true });
  const supabase = createClientForRoute(request, response);
  const { error } = await supabase.auth.signInWithOtp({
    phone: toE164Pakistan(local),
    options: { channel: "sms" },
  });

  if (error) {
    return NextResponse.json({ error: error.message, code: "OTP_SEND_FAILED" }, { status: 400 });
  }

  return response;
}
