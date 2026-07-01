import { existsSync } from "node:fs";
import path from "node:path";

import type { WASocket } from "baileys";

/**
 * Self-hosted WhatsApp transport using the Baileys (WhatsApp Web) protocol.
 *
 * This is free and unlimited but UNOFFICIAL: it logs in with your own WhatsApp
 * number via "Linked Devices". It violates WhatsApp's ToS and the number can be
 * banned, so only use a throwaway/secondary number for an MVP.
 *
 * Requirements:
 *  - A long-running Node process (works with `next start` on a VPS/container).
 *    It will NOT work on serverless platforms like Vercel, because the socket
 *    connection cannot stay alive between invocations.
 *  - First-time setup: open the QR route and scan it from WhatsApp on your phone
 *    (Settings → Linked Devices → Link a device). The session is then persisted
 *    to disk and survives restarts.
 */

const AUTH_DIR = path.resolve(process.env.WHATSAPP_AUTH_DIR ?? ".baileys_auth");

type ConnState = "disconnected" | "connecting" | "qr" | "open";

interface WhatsAppRuntime {
  sock: WASocket | null;
  state: ConnState;
  /** Latest QR string (raw); render to an image in the route. */
  qr: string | null;
  /** Set while a connection attempt is in flight to avoid duplicate sockets. */
  starting: Promise<void> | null;
  lastError: string | null;
}

// Persist across Next.js hot-reloads / route module re-evaluation.
const globalForWa = globalThis as unknown as { __savariWa?: WhatsAppRuntime };

const runtime: WhatsAppRuntime =
  globalForWa.__savariWa ??
  (globalForWa.__savariWa = {
    sock: null,
    state: "disconnected",
    qr: null,
    starting: null,
    lastError: null,
  });

/** Dynamic import keeps Baileys out of the webpack bundle (see next.config.ts). */
async function loadBaileys() {
  const [baileys, pinoMod] = await Promise.all([import("baileys"), import("pino")]);
  return {
    makeWASocket: baileys.default,
    DisconnectReason: baileys.DisconnectReason,
    fetchLatestBaileysVersion: baileys.fetchLatestBaileysVersion,
    // Alias avoids eslint react-hooks/rules-of-hooks false positive (not a React hook).
    loadMultiFileAuthState: baileys.useMultiFileAuthState,
    pino: pinoMod.default,
  };
}

/** Establish (or re-establish) the socket. Safe to call repeatedly. */
async function startSocket(): Promise<void> {
  runtime.state = "connecting";
  runtime.lastError = null;

  try {
    const { makeWASocket, DisconnectReason, fetchLatestBaileysVersion, loadMultiFileAuthState, pino } =
      await loadBaileys();

    const logger = pino({ level: process.env.WHATSAPP_LOG_LEVEL ?? "silent" });
    const { state, saveCreds } = await loadMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      logger,
      markOnlineOnConnect: false,
      browser: ["Savari", "Chrome", "1.0.0"],
    });

    runtime.sock = sock;

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
      const { connection, qr, lastDisconnect } = update;

      if (qr) {
        runtime.qr = qr;
        runtime.state = "qr";
      }

      if (connection === "open") {
        runtime.state = "open";
        runtime.qr = null;
        runtime.lastError = null;
      }

      if (connection === "close") {
        runtime.state = "disconnected";
        runtime.sock = null;

        const statusCode = (lastDisconnect?.error as { output?: { statusCode?: number } } | undefined)
          ?.output?.statusCode;
        runtime.lastError = (lastDisconnect?.error as Error | undefined)?.message ?? null;

        const loggedOut = statusCode === DisconnectReason.loggedOut;
        if (loggedOut) {
          runtime.qr = null;
          return;
        }

        setTimeout(() => {
          void ensureWhatsAppSocket();
        }, 2000);
      }
    });
  } catch (e) {
    runtime.state = "disconnected";
    runtime.sock = null;
    runtime.lastError = e instanceof Error ? e.message : "Failed to start WhatsApp socket.";
    throw e;
  }
}

/** Start the socket if not already running/starting. Returns once init kicked off. */
export async function ensureWhatsAppSocket(): Promise<void> {
  if (runtime.sock && (runtime.state === "open" || runtime.state === "connecting" || runtime.state === "qr")) {
    return;
  }
  if (runtime.starting) {
    return runtime.starting;
  }
  runtime.starting = startSocket().finally(() => {
    runtime.starting = null;
  });
  return runtime.starting;
}

export interface WhatsAppStatus {
  state: ConnState;
  connected: boolean;
  /** Raw QR string when a scan is needed; null otherwise. */
  qr: string | null;
  hasSession: boolean;
  lastError: string | null;
}

export function getWhatsAppStatus(): WhatsAppStatus {
  return {
    state: runtime.state,
    connected: runtime.state === "open",
    qr: runtime.qr,
    hasSession: existsSync(path.join(AUTH_DIR, "creds.json")),
    lastError: runtime.lastError,
  };
}

/** Wait until connected, QR is ready, or time out. */
async function waitForReady(timeoutMs = 25000): Promise<"open" | "qr" | "timeout"> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (runtime.state === "open") return "open";
    if (runtime.qr) return "qr";
    await new Promise((r) => setTimeout(r, 300));
  }
  if (runtime.state === "open") return "open";
  if (runtime.qr) return "qr";
  return "timeout";
}

function toWhatsAppJid(phoneE164: string): string {
  const digits = phoneE164.replace(/\D/g, "");
  return `${digits}@s.whatsapp.net`;
}

/**
 * Send a plain text WhatsApp message. Ensures the socket is connected first.
 * Throws if WhatsApp isn't linked yet (scan the QR) or the number has no account.
 */
export async function sendWhatsAppText(phoneE164: string, text: string): Promise<void> {
  await ensureWhatsAppSocket();

  const ready = await waitForReady();
  if (ready === "qr" || (!runtime.sock && !getWhatsAppStatus().hasSession)) {
    throw new Error(
      "WhatsApp not linked. Open /api/whatsapp/qr in your browser and scan the QR from your phone (WhatsApp → Linked Devices).",
    );
  }
  if (ready === "timeout" || !runtime.sock) {
    const status = getWhatsAppStatus();
    throw new Error(
      `WhatsApp not connected (state: ${status.state}${status.lastError ? `, ${status.lastError}` : ""}). Try /api/whatsapp/qr.`,
    );
  }

  const jid = toWhatsAppJid(phoneE164);

  const results = await runtime.sock.onWhatsApp(jid);
  const check = results?.[0];
  if (!check?.exists) {
    throw new Error(`The number ${phoneE164} is not on WhatsApp.`);
  }

  await runtime.sock.sendMessage(check.jid ?? jid, { text });
}
