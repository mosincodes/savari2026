import type { ApiSuccessEnvelope, ApiErrorEnvelope } from "@/lib/api-response";

/** Result of calling the app's JSON REST routes from browser / hooks. */
export type ApiClientResult<T> =
  | { ok: true; data: T; meta?: Record<string, unknown> }
  | { ok: false; error: string; code: string; status: number; details?: unknown };

export async function apiFetchJson<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiClientResult<T>> {
  const res = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string> | undefined),
    },
    ...init,
  });

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const e = body as Partial<ApiErrorEnvelope> | null;
    return {
      ok: false,
      error: typeof e?.error === "string" ? e.error : res.statusText,
      code: typeof e?.code === "string" ? e.code : "HTTP_ERROR",
      status: res.status,
      ...(e?.details !== undefined ? { details: e.details } : {}),
    };
  }

  const envelope = body as Partial<ApiSuccessEnvelope<T>> | null;
  if (!envelope || typeof envelope !== "object" || !("data" in envelope)) {
    return { ok: false, error: "Malformed response", code: "MALFORMED", status: res.status };
  }

  const meta =
    envelope.meta !== undefined && typeof envelope.meta === "object"
      ? (envelope.meta as Record<string, unknown>)
      : undefined;

  return { ok: true, data: envelope.data as T, meta };
}

export async function apiPostJson<TReq extends object, TRes>(
  path: string,
  body: TReq,
): Promise<ApiClientResult<TRes>> {
  return apiFetchJson<TRes>(path, { method: "POST", body: JSON.stringify(body) });
}

export async function apiPatchJson<TReq extends object, TRes>(
  path: string,
  body: TReq,
): Promise<ApiClientResult<TRes>> {
  return apiFetchJson<TRes>(path, { method: "PATCH", body: JSON.stringify(body) });
}

export async function apiDelete(path: string): Promise<ApiClientResult<{ deleted: boolean }>> {
  return apiFetchJson(path, { method: "DELETE" });
}
