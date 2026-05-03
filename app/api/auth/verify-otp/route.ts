import { NextRequest, NextResponse } from "next/server";

import { normalizeLocalPkPhone, toE164Pakistan } from "@/lib/constants";
import { otpVerifyBodySchema } from "@/lib/validations";
import { createClientForRoute } from "@/lib/supabase/route-handler";

/** Server-side OTP verify — attaches Supabase session cookies to the response. */
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
  const token = parsed.data.token.replace(/\s/g, "");

  const response = NextResponse.json({ ok: true });
  const supabase = createClientForRoute(request, response);

  const { data, error } = await supabase.auth.verifyOtp({
    phone: toE164Pakistan(local),
    token,
    type: "sms",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data.user) {
    return NextResponse.json({ error: "Verification incomplete." }, { status: 400 });
  }

  return response;
}
