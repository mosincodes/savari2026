import { NextRequest, NextResponse } from "next/server";

import { getWhatsAppStatus, sendWhatsAppText } from "@/lib/services/baileys-whatsapp";

// Baileys requires the Node.js runtime (not edge) and a live connection.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Temporary test endpoint — remove before production. */
export async function POST(request: NextRequest) {
  const { to } = await request.json();
  if (!to) {
    return NextResponse.json({ error: "Missing 'to' phone in E.164 e.g. +923001234567" }, { status: 400 });
  }

  try {
    await sendWhatsAppText(to, "Savari test: WhatsApp delivery is working ✅");
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e as { message?: string };
    return NextResponse.json({ ok: false, error: err.message, status: getWhatsAppStatus() }, { status: 502 });
  }
}
