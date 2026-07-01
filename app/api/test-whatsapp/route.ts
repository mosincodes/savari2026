import { NextRequest, NextResponse } from "next/server";

import { getWhatsAppStatus } from "@/lib/services/baileys-whatsapp";
import { getWhatsAppTransportLabel, sendWhatsAppMessage } from "@/lib/services/whatsapp-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Temporary test endpoint — remove before production. */
export async function POST(request: NextRequest) {
  const { to } = await request.json();
  if (!to) {
    return NextResponse.json({ error: "Missing 'to' phone in E.164 e.g. +923001234567" }, { status: 400 });
  }

  try {
    await sendWhatsAppMessage(to, "Savari test: WhatsApp delivery is working ✅");
    return NextResponse.json({ ok: true, provider: getWhatsAppTransportLabel() });
  } catch (e: unknown) {
    const err = e as { message?: string };
    return NextResponse.json(
      { ok: false, error: err.message, provider: getWhatsAppTransportLabel(), status: getWhatsAppStatus() },
      { status: 502 },
    );
  }
}
