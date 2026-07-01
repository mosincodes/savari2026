#!/usr/bin/env npx tsx
/**
 * Always-on Baileys gateway for production (Railway / Fly.io / VPS).
 *
 * Vercel cannot run Baileys — deploy THIS service separately, then set on Vercel:
 *   WHATSAPP_GATEWAY_URL=https://your-gateway.up.railway.app
 *   WHATSAPP_GATEWAY_SECRET=<same secret as here>
 *
 * Link WhatsApp once at: https://your-gateway.up.railway.app/qr
 */
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import QRCode from "qrcode";

import {
  ensureWhatsAppSocket,
  getWhatsAppStatus,
  sendWhatsAppText,
} from "../lib/services/baileys-whatsapp";

const PORT = Number(process.env.PORT ?? process.env.WHATSAPP_GATEWAY_PORT ?? 4040);
const SECRET = process.env.WHATSAPP_GATEWAY_SECRET?.trim() ?? "";

function authorized(req: IncomingMessage): boolean {
  if (!SECRET) return true;
  return req.headers["x-gateway-secret"] === SECRET;
}

function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

async function readJson<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}") as T;
}

const QR_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Savari · Link WhatsApp</title>
<style>
body{font-family:system-ui,sans-serif;background:#0b141a;color:#e9edef;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:16px}
.card{background:#111b21;border:1px solid #2a3942;border-radius:16px;padding:28px;max-width:420px;width:100%;text-align:center}
h1{font-size:18px;margin:0 0 6px}p{color:#8696a0;font-size:14px;line-height:1.5}
img{width:280px;height:280px;background:#fff;border-radius:12px;padding:8px;display:none;margin:12px auto}
img.visible{display:block}.ok{color:#00a884;font-size:40px}.badge{display:inline-block;padding:4px 10px;border-radius:999px;background:#202c33;color:#8696a0;font-size:12px;margin-top:8px}
.spinner{width:32px;height:32px;border:3px solid #2a3942;border-top-color:#00a884;border-radius:50%;animation:spin .8s linear infinite;margin:16px auto}
@keyframes spin{to{transform:rotate(360deg)}}
</style></head><body><div class="card" id="content"><div class="spinner"></div><h1>Connecting…</h1></div>
<script>
let lastQr=null;
const el=document.getElementById("content");
async function poll(){
  try{
    const r=await fetch("/status");const d=await r.json();
    if(d.connected){el.innerHTML='<div class="ok">✓</div><h1>WhatsApp is linked</h1><p>Gateway is ready to send OTPs.</p>';return;}
    if(d.qrImage){
      if(d.qrImage!==lastQr){lastQr=d.qrImage;
        el.innerHTML='<h1>Link WhatsApp</h1><p>WhatsApp → Settings → Linked Devices → Link a device</p><p style="font-size:12px">Keep this page open while scanning.</p><img class="visible" src="'+d.qrImage+'"/>';}
      return;
    }
    el.innerHTML='<div class="spinner"></div><h1>Connecting…</h1><span class="badge">state: '+(d.state||"?")+'</span>';
  }catch(e){el.innerHTML='<h1>Error</h1><p>Gateway not responding.</p>';}
}
poll();setInterval(poll,2000);
</script></body></html>`;

async function handleStatus(res: ServerResponse): Promise<void> {
  await ensureWhatsAppSocket();
  const status = getWhatsAppStatus();
  let qrImage: string | null = null;
  if (status.qr) qrImage = await QRCode.toDataURL(status.qr, { margin: 1, width: 280 });
  json(res, 200, { ...status, qrImage });
}

const server = createServer(async (req, res) => {
  const url = req.url ?? "/";
  const method = req.method ?? "GET";

  if (url === "/health") {
    json(res, 200, { ok: true });
    return;
  }

  if (url === "/qr" && method === "GET") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(QR_HTML);
    return;
  }

  if (url === "/status" && method === "GET") {
    await handleStatus(res);
    return;
  }

  if (url === "/send" && method === "POST") {
    if (!authorized(req)) {
      json(res, 401, { error: "Unauthorized" });
      return;
    }
    try {
      const body = await readJson<{ to?: string; text?: string }>(req);
      if (!body.to || !body.text) {
        json(res, 400, { error: "Missing to or text" });
        return;
      }
      await sendWhatsAppText(body.to, body.text);
      json(res, 200, { ok: true });
    } catch (e) {
      json(res, 502, { error: e instanceof Error ? e.message : "Send failed" });
    }
    return;
  }

  json(res, 404, { error: "Not found" });
});

void ensureWhatsAppSocket();

server.listen(PORT, () => {
  console.log(`Savari WhatsApp gateway listening on :${PORT}`);
  console.log(`Link WhatsApp: http://localhost:${PORT}/qr`);
});
