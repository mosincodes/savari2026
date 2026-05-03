import { createClient } from "@supabase/supabase-js";

/** Host `https://<ref>.supabase.co` → ref */
function projectRefFromSupabaseUrl(urlStr: string): string | null {
  try {
    const u = new URL(urlStr);
    const m = /^([a-z0-9]+)\.supabase\.co$/i.exec(u.hostname);
    return m?.[1] ?? null;
  } catch {
    return null;
  }
}

/** Legacy service_role JWT embeds `ref` in the payload; must match the URL project. */
function projectRefFromLegacyServiceJwt(jwt: string): string | null {
  if (!jwt.startsWith("eyJ") || jwt.split(".").length !== 3) return null;
  try {
    let b64 = jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    if (pad) b64 += "=".repeat(4 - pad);
    const payload = JSON.parse(atob(b64)) as { ref?: string };
    return typeof payload.ref === "string" ? payload.ref : null;
  } catch {
    return null;
  }
}

function resolvePublicSupabaseUrl(): string | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const t = url?.trim();
  return t?.length ? t : undefined;
}

/** Backend-only: prefer modern `sb_secret_…`; fall back to legacy service_role JWT. */
function resolveServiceOrSecretApiKey(): string | undefined {
  const modern = process.env.SUPABASE_SECRET_KEY?.trim();
  const legacy = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (modern) return modern;
  if (legacy) return legacy;
  return undefined;
}

/** Server-only: bypasses RLS. Never import in client components. */
export function createAdminClient() {
  const url = resolvePublicSupabaseUrl();
  const key = resolveServiceOrSecretApiKey();
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY (legacy JWT service_role) or SUPABASE_SECRET_KEY (sb_secret_…)",
    );
  }

  const urlRef = projectRefFromSupabaseUrl(url);
  const jwtRef = projectRefFromLegacyServiceJwt(key);
  if (urlRef && jwtRef && urlRef !== jwtRef) {
    throw new Error(
      `The secret/service API key JWT belongs to project ref "${jwtRef}" but NEXT_PUBLIC_SUPABASE_URL uses "${urlRef}". Copy keys from the same Dashboard project (Settings → API).`,
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
