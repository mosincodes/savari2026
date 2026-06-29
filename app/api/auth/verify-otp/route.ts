import { NextRequest, NextResponse } from "next/server";

import { mintSessionForPhone } from "@/lib/auth/phone-session";
import { normalizeLocalPkPhone, toE164Pakistan } from "@/lib/constants";
import { verifyWhatsAppOtp } from "@/lib/services/whatsapp-otp-service";
import { createClientForRoute } from "@/lib/supabase/route-handler";
import { otpVerifyBodySchema } from "@/lib/validations";

// Minting a session via the admin client requires the Node.js runtime, not edge.
export const runtime = "nodejs";

/** Verify the WhatsApp OTP, then attach a Supabase session to the response. */
export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = otpVerifyBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid" }, { status: 400 });
  }

  const local = normalizeLocalPkPhone(parsed.data.phone.replace(/\s/g, ""));
  if (!local) {
    return NextResponse.json({ error: "Invalid phone." }, { status: 400 });
  }
  const phoneE164 = toE164Pakistan(local);
  const token = parsed.data.token.replace(/\s/g, "");

  const valid = await verifyWhatsAppOtp(phoneE164, token);
  if (!valid) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  }

  const session = await mintSessionForPhone(phoneE164);
  if (!session.ok) {
    const status = session.reason === "misconfigured" ? 500 : 400;
    return NextResponse.json({ error: session.message ?? "Could not sign you in." }, { status });
  }

  const response = NextResponse.json({ ok: true });
  const supabase = createClientForRoute(request, response);
  const { error } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return response;
}
