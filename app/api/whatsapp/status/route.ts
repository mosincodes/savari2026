import { NextResponse } from "next/server";

import {
  fetchWhatsAppGatewayStatus,
  isWhatsAppGatewayConfigured,
} from "@/lib/services/whatsapp-gateway-client";

import QRCode from "qrcode";

import { ensureWhatsAppSocket, getWhatsAppStatus } from "@/lib/services/baileys-whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** JSON status for the QR linking page — polled without reloading the page. */
export async function GET() {
  if (isWhatsAppGatewayConfigured()) {
    try {
      const status = await fetchWhatsAppGatewayStatus();
      return NextResponse.json(status);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Gateway unreachable", connected: false, state: "disconnected" },
        { status: 502 },
      );
    }
  }

  await ensureWhatsAppSocket();

  const status = getWhatsAppStatus();
  let qrImage: string | null = null;
  if (status.qr) {
    qrImage = await QRCode.toDataURL(status.qr, { margin: 1, width: 280 });
  }

  return NextResponse.json({ ...status, qrImage });
}
