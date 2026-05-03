import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { ApiError, ValidationApiError } from "@/lib/api-error";

/** Wrap route handlers → consistent `{ error, code }` payloads. */
export async function runApi(handler: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await handler();
  } catch (err: unknown) {
    return jsonErrorResponse(err);
  }
}

export type ApiSuccessEnvelope<T> = { data: T; meta?: Record<string, unknown> };

export type ApiErrorEnvelope = { error: string; code: string; details?: unknown };

export function jsonOk<T>(data: T, init?: ResponseInit & { meta?: Record<string, unknown> }): NextResponse {
  const { meta, ...rest } = init || {};
  const body: ApiSuccessEnvelope<T> = meta ? { data, meta } : { data };
  return NextResponse.json(body, { status: 200, ...rest });
}

export function jsonCreated<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ data } satisfies ApiSuccessEnvelope<T>, { status: 201, ...init });
}

export function jsonErrorResponse(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    const body: ApiErrorEnvelope = {
      error: err.message,
      code: err.code,
      ...(err.details !== undefined ? { details: err.details } : {}),
    };
    return NextResponse.json(body, { status: err.status });
  }

  console.error(err);
  const body: ApiErrorEnvelope = {
    error: "Internal server error",
    code: "INTERNAL",
  };
  return NextResponse.json(body, { status: 500 });
}

export function zodErrorToValidation(z: ZodError): ValidationApiError {
  const flat = z.flatten();
  const first = flat.formErrors?.[0] || Object.values(flat.fieldErrors).flat()?.[0] || "Validation failed";
  return new ValidationApiError(typeof first === "string" ? first : "Validation failed", flat.fieldErrors);
}
