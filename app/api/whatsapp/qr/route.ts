import { NextRequest, NextResponse } from "next/server";

import {
  getWhatsAppGatewayQrUrl,
  isWhatsAppGatewayConfigured,
} from "@/lib/services/whatsapp-gateway-client";

// Baileys needs the Node.js runtime and a non-cached, always-fresh response.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Optional gate: if WHATSAPP_QR_SECRET is set, require ?key=<secret>. */
function authorized(request: NextRequest): boolean {
  const secret = process.env.WHATSAPP_QR_SECRET;
  if (!secret) return true;
  return request.nextUrl.searchParams.get("key") === secret;
}

const POLLING_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Savari · Link WhatsApp</title>
<style>
body{font-family:system-ui,-apple-system,sans-serif;background:#0b141a;color:#e9edef;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:16px;box-sizing:border-box}
.card{background:#111b21;border:1px solid #2a3942;border-radius:16px;padding:28px;max-width:420px;width:100%;text-align:center}
h1{font-size:18px;margin:0 0 6px}p{color:#8696a0;font-size:14px;line-height:1.5}
img{width:280px;height:280px;background:#fff;border-radius:12px;padding:8px;display:none;margin:12px auto}
img.visible{display:block}.ok{color:#00a884;font-size:40px}.badge{display:inline-block;padding:4px 10px;border-radius:999px;background:#202c33;color:#8696a0;font-size:12px;margin-top:8px}
.spinner{width:32px;height:32px;border:3px solid #2a3942;border-top-color:#00a884;border-radius:50%;animation:spin .8s linear infinite;margin:16px auto}
@keyframes spin{to{transform:rotate(360deg)}}
</style></head><body><div class="card" id="content"><div class="spinner"></div><h1>Connecting…</h1><p>Do not refresh while scanning.</p></div>
<script>
let lastQr=null;
async function poll(){
  try{
    const r=await fetch("/api/whatsapp/status",{cache:"no-store"});const d=await r.json();
    const el=document.getElementById("content");
    if(d.connected){el.innerHTML='<div class="ok">✓</div><h1>WhatsApp is linked</h1><p>Savari can now send OTP messages.</p>';return;}
    if(d.qrImage){
      if(d.qrImage!==lastQr){lastQr=d.qrImage;
        el.innerHTML='<h1>Link Savari to WhatsApp</h1><p><b>WhatsApp → Settings → Linked Devices → Link a device</b></p><img class="visible" src="'+d.qrImage+'"/><span class="badge">state: qr</span>';}
      return;
    }
    el.innerHTML='<div class="spinner"></div><h1>Connecting…</h1><span class="badge">state: '+(d.state||"?")+'</span>'+(d.lastError?'<p><code>'+d.lastError+'</code></p>':"");
  }catch(e){document.getElementById("content").innerHTML='<h1>Error</h1><p>Could not reach /api/whatsapp/status</p>';}
}
poll();setInterval(poll,2000);
</script></body></html>`;

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Production on Vercel: redirect to the always-on Baileys gateway.
  if (isWhatsAppGatewayConfigured()) {
    const qrUrl = getWhatsAppGatewayQrUrl()!;
    return NextResponse.redirect(qrUrl);
  }

  return new NextResponse(POLLING_HTML, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
