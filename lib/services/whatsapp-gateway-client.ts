/** Client for the always-on Baileys gateway (Railway/Fly.io/VPS). */

export interface GatewayStatus {
  state: string;
  connected: boolean;
  qr: string | null;
  qrImage: string | null;
  hasSession: boolean;
  lastError: string | null;
}

export function getWhatsAppGatewayUrl(): string | null {
  const url = process.env.WHATSAPP_GATEWAY_URL?.trim();
  return url ? url.replace(/\/$/, "") : null;
}

export function isWhatsAppGatewayConfigured(): boolean {
  return getWhatsAppGatewayUrl() != null;
}

function gatewayHeaders(json = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  const secret = process.env.WHATSAPP_GATEWAY_SECRET?.trim();
  if (secret) headers["X-Gateway-Secret"] = secret;
  return headers;
}

export function getWhatsAppGatewayQrUrl(): string | null {
  const base = getWhatsAppGatewayUrl();
  return base ? `${base}/qr` : null;
}

/** POST /send on the Baileys gateway. */
export async function sendViaWhatsAppGateway(phoneE164: string, text: string): Promise<void> {
  const base = getWhatsAppGatewayUrl();
  if (!base) {
    throw new Error("WHATSAPP_GATEWAY_URL is not set.");
  }

  const res = await fetch(`${base}/send`, {
    method: "POST",
    headers: gatewayHeaders(true),
    body: JSON.stringify({ to: phoneE164, text }),
  });

  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `WhatsApp gateway error (${res.status})`);
  }
}

/** GET /status on the Baileys gateway. */
export async function fetchWhatsAppGatewayStatus(): Promise<GatewayStatus> {
  const base = getWhatsAppGatewayUrl();
  if (!base) {
    throw new Error("WHATSAPP_GATEWAY_URL is not set.");
  }

  const res = await fetch(`${base}/status`, {
    headers: gatewayHeaders(),
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as GatewayStatus & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `WhatsApp gateway error (${res.status})`);
  }
  return data;
}
