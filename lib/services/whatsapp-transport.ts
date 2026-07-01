import twilio from "twilio";

import { sendWhatsAppText as sendViaBaileys } from "@/lib/services/baileys-whatsapp";
import {
  isWhatsAppGatewayConfigured,
  sendViaWhatsAppGateway,
} from "@/lib/services/whatsapp-gateway-client";

export type WhatsAppProvider = "baileys" | "baileys-gateway" | "twilio";

/** True on Vercel, AWS Lambda, etc. */
export function isServerlessRuntime(): boolean {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
}

function twilioWhatsAppConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
      process.env.TWILIO_AUTH_TOKEN?.trim() &&
      process.env.TWILIO_WHATSAPP_FROM?.trim(),
  );
}

/** Baileys locally, Baileys gateway on Vercel when WHATSAPP_GATEWAY_URL is set. */
export function resolveWhatsAppProvider(): WhatsAppProvider {
  const explicit = process.env.WHATSAPP_PROVIDER?.trim().toLowerCase();
  if (explicit === "twilio") return "twilio";
  if (explicit === "baileys" && !isServerlessRuntime()) return "baileys";
  if (explicit === "gateway" || explicit === "baileys-gateway") return "baileys-gateway";

  if (isWhatsAppGatewayConfigured()) return "baileys-gateway";
  if (isServerlessRuntime()) return "baileys-gateway"; // will error with setup instructions if URL missing
  return "baileys";
}

async function sendViaTwilio(phoneE164: string, text: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_WHATSAPP_FROM!;
  const client = twilio(sid, token);

  await client.messages.create({
    from: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
    to: `whatsapp:${phoneE164}`,
    body: text,
  });
}

const GATEWAY_SETUP_MSG =
  "Baileys cannot run inside Vercel serverless. Deploy the Baileys gateway (npm run whatsapp-gateway) on Railway/Fly.io, " +
  "then set WHATSAPP_GATEWAY_URL and WHATSAPP_GATEWAY_SECRET on Vercel. Link WhatsApp at <gateway-url>/qr.";

/** Send WhatsApp text — direct Baileys locally, remote gateway on Vercel. */
export async function sendWhatsAppMessage(phoneE164: string, text: string): Promise<void> {
  const provider = resolveWhatsAppProvider();

  if (provider === "twilio") {
    if (!twilioWhatsAppConfigured()) {
      throw new Error("Twilio not configured (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM).");
    }
    await sendViaTwilio(phoneE164, text);
    return;
  }

  if (provider === "baileys-gateway") {
    if (!isWhatsAppGatewayConfigured()) {
      throw new Error(GATEWAY_SETUP_MSG);
    }
    await sendViaWhatsAppGateway(phoneE164, text);
    return;
  }

  await sendViaBaileys(phoneE164, text);
}

export function getWhatsAppTransportLabel(): string {
  return resolveWhatsAppProvider();
}
