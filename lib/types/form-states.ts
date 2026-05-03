export type RideActionState = { ok: true; id?: string } | { ok: false; message?: string };

export type BookingState = { ok: true } | { ok: false; message?: string };

export type OnboardingState = { ok: true } | { ok: false; message?: string };

export type SignupActionState =
  | { ok: true; message?: string }
  | { ok: false; fieldErrors?: Record<string, string[]>; message?: string };
