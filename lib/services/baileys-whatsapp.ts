import { accessSync, constants, existsSync, mkdirSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import type { WASocket } from "baileys";

/**
 * Self-hosted WhatsApp transport using the Baileys (WhatsApp Web) protocol.
 *
 * Deploy on a long-running server (Railway gateway or local dev). Not for Vercel.
 * First-time: open /qr (or gateway /qr) and scan from WhatsApp → Linked Devices.
 */

function resolveAuthDir(): string {
  if (process.env.WHATSAPP_AUTH_DIR?.trim()) {
    return path.resolve(process.env.WHATSAPP_AUTH_DIR);
  }
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "savari-baileys-auth");
  }
  return path.resolve(".baileys_auth");
}

const AUTH_DIR = resolveAuthDir();

type ConnState = "disconnected" | "connecting" | "qr" | "open";

interface WhatsAppRuntime {
  sock: WASocket | null;
  state: ConnState;
  qr: string | null;
  starting: Promise<void> | null;
  lastError: string | null;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
  needsRescan: boolean;
}

const globalForWa = globalThis as unknown as { __savariWa?: WhatsAppRuntime };

const runtime: WhatsAppRuntime =
  globalForWa.__savariWa ??
  (globalForWa.__savariWa = {
    sock: null,
    state: "disconnected",
    qr: null,
    starting: null,
    lastError: null,
    reconnectTimer: null,
    needsRescan: false,
  });

function ensureAuthDirWritable(): void {
  try {
    if (!existsSync(AUTH_DIR)) {
      mkdirSync(AUTH_DIR, { recursive: true, mode: 0o700 });
    }
    accessSync(AUTH_DIR, constants.W_OK);
    const probe = path.join(AUTH_DIR, ".write-test");
    writeFileSync(probe, "ok");
    unlinkSync(probe);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    throw new Error(`Cannot write WhatsApp session to ${AUTH_DIR} (${msg}).`);
  }
}

function clearAuthSession(): void {
  try {
    if (existsSync(AUTH_DIR)) {
      rmSync(AUTH_DIR, { recursive: true, force: true });
    }
  } catch {
    /* best effort */
  }
  runtime.needsRescan = true;
  runtime.qr = null;
}

async function loadBaileys() {
  const [baileys, pinoMod] = await Promise.all([import("baileys"), import("pino")]);
  return {
    makeWASocket: baileys.default,
    DisconnectReason: baileys.DisconnectReason,
    fetchLatestBaileysVersion: baileys.fetchLatestBaileysVersion,
    loadMultiFileAuthState: baileys.useMultiFileAuthState,
    pino: pinoMod.default,
  };
}

function teardownSocket(): void {
  const sock = runtime.sock;
  runtime.sock = null;
  if (!sock) return;
  try {
    sock.ev.removeAllListeners("connection.update");
    sock.ev.removeAllListeners("creds.update");
    sock.end(undefined);
  } catch {
    /* ignore */
  }
}

function scheduleReconnect(): void {
  if (runtime.reconnectTimer || runtime.needsRescan) return;
  runtime.reconnectTimer = setTimeout(() => {
    runtime.reconnectTimer = null;
    void ensureWhatsAppSocket();
  }, 3000);
}

async function startSocket(): Promise<void> {
  teardownSocket();
  runtime.state = "connecting";
  runtime.lastError = null;

  try {
    ensureAuthDirWritable();

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
      connectTimeoutMs: 60_000,
      keepAliveIntervalMs: 25_000,
      defaultQueryTimeoutMs: 60_000,
    });

    runtime.sock = sock;
    runtime.needsRescan = false;

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
      const { connection, qr, lastDisconnect } = update;

      if (connection === "connecting") {
        runtime.state = "connecting";
      }

      if (qr) {
        runtime.qr = qr;
        runtime.state = "qr";
        runtime.needsRescan = true;
      }

      if (connection === "open") {
        runtime.state = "open";
        runtime.qr = null;
        runtime.lastError = null;
        runtime.needsRescan = false;
      }

      if (connection === "close") {
        runtime.state = "disconnected";
        runtime.sock = null;

        const statusCode = (lastDisconnect?.error as { output?: { statusCode?: number } } | undefined)
          ?.output?.statusCode;
        const errMsg = (lastDisconnect?.error as Error | undefined)?.message ?? "Connection closed";
        runtime.lastError = statusCode != null ? `${errMsg} (code ${statusCode})` : errMsg;

        const sessionDead =
          statusCode === DisconnectReason.loggedOut || statusCode === DisconnectReason.badSession;

        const connectionFailure = /connection failure/i.test(errMsg);

        if (sessionDead || connectionFailure) {
          if (connectionFailure && !sessionDead) {
            clearAuthSession();
            runtime.lastError = "Connection failed — WhatsApp session expired. Scan QR again at /qr.";
          } else {
            clearAuthSession();
            runtime.lastError = "Session expired — scan QR again at /qr (or your gateway /qr).";
          }
          return;
        }

        // Connection Failure, restart required, etc. — auto-reconnect.
        scheduleReconnect();
      }
    });
  } catch (e) {
    runtime.state = "disconnected";
    runtime.sock = null;
    runtime.lastError = e instanceof Error ? e.message : "Failed to start WhatsApp socket.";
    throw e;
  }
}

/** Start the socket if not already running/starting. */
export async function ensureWhatsAppSocket(): Promise<void> {
  if (runtime.state === "open" && runtime.sock) return;
  if (runtime.sock && (runtime.state === "connecting" || runtime.state === "qr")) return;
  if (runtime.starting) return runtime.starting;

  runtime.starting = startSocket().finally(() => {
    runtime.starting = null;
  });
  return runtime.starting;
}

export interface WhatsAppStatus {
  state: ConnState;
  connected: boolean;
  qr: string | null;
  hasSession: boolean;
  lastError: string | null;
  needsRescan: boolean;
}

export function getWhatsAppStatus(): WhatsAppStatus {
  return {
    state: runtime.state,
    connected: runtime.state === "open",
    qr: runtime.qr,
    hasSession: existsSync(path.join(AUTH_DIR, "creds.json")),
    lastError: runtime.lastError,
    needsRescan: runtime.needsRescan,
  };
}

async function waitForReady(timeoutMs = 45_000): Promise<"open" | "qr" | "timeout"> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (runtime.state === "open" && runtime.sock) return "open";
    if (runtime.qr) return "qr";
    if (runtime.state === "disconnected" && !runtime.starting && !runtime.reconnectTimer) {
      void ensureWhatsAppSocket();
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  if (runtime.state === "open" && runtime.sock) return "open";
  if (runtime.qr) return "qr";
  return "timeout";
}

function toWhatsAppJid(phoneE164: string): string {
  const digits = phoneE164.replace(/\D/g, "");
  return `${digits}@s.whatsapp.net`;
}

async function sendOnce(phoneE164: string, text: string): Promise<void> {
  const sock = runtime.sock;
  if (!sock || runtime.state !== "open") {
    throw new Error("Socket not open");
  }

  const jid = toWhatsAppJid(phoneE164);
  const results = await sock.onWhatsApp(jid);
  const check = results?.[0];
  if (!check?.exists) {
    throw new Error(`The number ${phoneE164} is not on WhatsApp.`);
  }

  await sock.sendMessage(check.jid ?? jid, { text });
}

/**
 * Send a plain text WhatsApp message. Reconnects automatically if the socket dropped.
 */
export async function sendWhatsAppText(phoneE164: string, text: string): Promise<void> {
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) {
      teardownSocket();
      runtime.state = "disconnected";
      runtime.starting = null;
      if (runtime.reconnectTimer) {
        clearTimeout(runtime.reconnectTimer);
        runtime.reconnectTimer = null;
      }
    }

    await ensureWhatsAppSocket();
    const ready = await waitForReady();

    if (ready === "qr" || runtime.needsRescan || (!runtime.sock && !getWhatsAppStatus().hasSession)) {
      throw new Error(
        "WhatsApp not linked. Open /api/whatsapp/qr (or your gateway /qr) and scan from WhatsApp → Linked Devices.",
      );
    }

    if (ready !== "open" || !runtime.sock) {
      if (attempt === 0) continue;
      const status = getWhatsAppStatus();
      throw new Error(
        `WhatsApp not connected (state: ${status.state}${status.lastError ? `, ${status.lastError}` : ""}). ` +
          "Re-link at /qr if this keeps happening.",
      );
    }

    try {
      await sendOnce(phoneE164, text);
      return;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      runtime.lastError = msg;
      if (attempt === 0 && /closed|disconnect|timeout|connection/i.test(msg)) {
        continue;
      }
      throw e instanceof Error ? e : new Error(msg);
    }
  }
}
