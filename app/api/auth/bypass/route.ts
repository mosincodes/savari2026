import { NextRequest, NextResponse } from "next/server";

import { skipPkPhoneOtpIfAllowed } from "@/lib/auth/skip-pk-phone-otp";
import { normalizeLocalPkPhone } from "@/lib/constants";
import { otpBypassBodySchema } from "@/lib/validations";
import { createClientForRoute } from "@/lib/supabase/route-handler";

/** OTP bypass for allowlisted PK numbers — sets session cookies; never exposes tokens to JSON. */
export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON.", ok: false as const }, { status: 400 });
  }

  const parsed = otpBypassBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false as const, reason: "invalid", message: parsed.error.issues[0]?.message || "Invalid" },
      { status: 400 },
    );
  }

  const local = normalizeLocalPkPhone(parsed.data.phone.replace(/\s/g, ""));
  if (!local) {
    return NextResponse.json(
      { error: "Enter a valid Pakistani number (03XXXXXXXXX).", ok: false as const },
      { status: 400 },
    );
  }

  const result = await skipPkPhoneOtpIfAllowed(local);
  if (!result.ok) {
    const status =
      result.reason === "misconfigured"
        ? 500
        : result.reason === "not_eligible"
          ? 403
          : 400;
    return NextResponse.json(
      { ok: false as const, reason: result.reason, message: result.message },
      { status },
    );
  }

  const response = NextResponse.json({ ok: true });
  const supabase = createClientForRoute(request, response);
  const { error } = await supabase.auth.setSession({
    access_token: result.access_token,
    refresh_token: result.refresh_token,
  });

  if (error) {
    return NextResponse.json({ error: error.message, ok: false as const }, { status: 400 });
  }

  return response;
}
