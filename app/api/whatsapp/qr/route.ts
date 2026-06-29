import { NextRequest, NextResponse } from "next/server";

import QRCode from "qrcode";

import { ensureWhatsAppSocket, getWhatsAppStatus } from "@/lib/services/baileys-whatsapp";

// Baileys needs the Node.js runtime and a non-cached, always-fresh response.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Optional gate: if WHATSAPP_QR_SECRET is set, require ?key=<secret>. */
function authorized(request: NextRequest): boolean {
  const secret = process.env.WHATSAPP_QR_SECRET;
  if (!secret) return true;
  return request.nextUrl.searchParams.get("key") === secret;
}

function page(body: string): NextResponse {
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta http-equiv="refresh" content="5"/>
<title>Savari · Link WhatsApp</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0b141a;color:#e9edef;
       display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}
  .card{background:#111b21;border:1px solid #2a3942;border-radius:16px;padding:28px;max-width:420px;text-align:center}
  h1{font-size:18px;margin:0 0 6px} p{color:#8696a0;font-size:14px;line-height:1.5}
  img{width:280px;height:280px;background:#fff;border-radius:12px;padding:8px}
  .ok{color:#00a884;font-size:40px} .badge{display:inline-block;padding:4px 10px;border-radius:999px;
       background:#202c33;color:#8696a0;font-size:12px;margin-top:8px}
  code{background:#202c33;padding:1px 6px;border-radius:4px}
</style></head><body><div class="card">${body}</div></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  await ensureWhatsAppSocket();

  // Poll until connected, QR appears, or timeout.
  const deadline = Date.now() + 15000;
  let status = getWhatsAppStatus();
  while (Date.now() < deadline && !status.connected && !status.qr) {
    await new Promise((r) => setTimeout(r, 500));
    status = getWhatsAppStatus();
  }

  if (status.connected) {
    return page(
      `<div class="ok">✓</div><h1>WhatsApp is linked</h1>
       <p>Savari can now send OTP messages via WhatsApp.</p>
       <span class="badge">state: ${status.state}</span>`,
    );
  }

  if (status.qr) {
    const dataUrl = await QRCode.toDataURL(status.qr, { margin: 1, width: 280 });
    return page(
      `<h1>Link Savari to WhatsApp</h1>
       <p>On your phone: <b>WhatsApp → Settings → Linked Devices → Link a device</b>, then scan this code. It refreshes automatically.</p>
       <img src="${dataUrl}" alt="WhatsApp QR code"/>
       <div><span class="badge">state: ${status.state}</span></div>`,
    );
  }

  return page(
    `<h1>Connecting…</h1>
     <p>Waiting for WhatsApp to generate a QR code. This page refreshes every 5s.</p>
     <span class="badge">state: ${status.state}</span>
     ${status.lastError ? `<p>Last error: <code>${status.lastError}</code></p>` : ""}`,
  );
}
