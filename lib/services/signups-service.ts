import { createClient } from "@/lib/supabase/server";
import {
  driverSignupSchema,
  passengerSignupSchema,
  type DriverSignupInput,
  type PassengerSignupInput,
} from "@/lib/validations";
import type { SignupActionState as ActionState } from "@/lib/types/form-states";
import { revalidateAdminSurfaces } from "@/lib/services/revalidate-tags";

function flattenZod(err: { flatten: () => { fieldErrors: Record<string, string[]> } }) {
  const f = err.flatten().fieldErrors;
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(f)) {
    if (v && v.length) out[k] = v;
  }
  return out;
}

export async function submitDriverSignupFromForm(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const days = formData.getAll("days_available").map(String);
  const raw: Record<string, unknown> = {
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    whatsapp_phone: formData.get("whatsapp_phone"),
    cnic: formData.get("cnic"),
    car_make_model: formData.get("car_make_model"),
    car_color: formData.get("car_color"),
    number_plate: formData.get("number_plate"),
    route_from: formData.get("route_from"),
    route_from_other: formData.get("route_from_other") || undefined,
    route_to: formData.get("route_to"),
    route_to_other: formData.get("route_to_other") || undefined,
    departure_time: formData.get("departure_time"),
    return_time: formData.get("return_time"),
    days_available: days,
    available_seats: formData.get("available_seats"),
    notes: formData.get("notes") || "",
  };

  const parsed = driverSignupSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenZod(parsed.error) };
  }

  const d = parsed.data as DriverSignupInput;
  const supabase = await createClient();
  const departureStr = d.departure_time.length === 5 ? `${d.departure_time}:00` : d.departure_time;
  const returnStr = d.return_time.length === 5 ? `${d.return_time}:00` : d.return_time;

  const { error } = await supabase.from("driver_signups").insert({
    full_name: d.full_name,
    email: d.email,
    whatsapp_phone: d.whatsapp_phone,
    cnic: d.cnic,
    car_make_model: d.car_make_model,
    car_color: d.car_color,
    number_plate: d.number_plate,
    route_from: d.route_from,
    route_from_other: d.route_from === "Other" ? d.route_from_other : null,
    route_to: d.route_to,
    route_to_other: d.route_to === "Other" ? d.route_to_other : null,
    departure_time: departureStr,
    return_time: returnStr,
    days_available: d.days_available,
    available_seats: d.available_seats,
    notes: d.notes || null,
  });

  if (error) {
    console.error(error);
    return { ok: false, message: error.message || "Could not save. Try again." };
  }

  revalidateAdminSurfaces();
  return { ok: true };
}

export async function submitPassengerSignupFromForm(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const days = formData.getAll("days_needed").map(String);
  const raw: Record<string, unknown> = {
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    whatsapp_phone: formData.get("whatsapp_phone"),
    cnic: formData.get("cnic"),
    route_from: formData.get("route_from"),
    route_from_other: formData.get("route_from_other") || undefined,
    route_to: formData.get("route_to"),
    route_to_other: formData.get("route_to_other") || undefined,
    preferred_time: formData.get("preferred_time"),
    days_needed: days,
    seats_needed: formData.get("seats_needed"),
    notes: formData.get("notes") || "",
  };

  const parsed = passengerSignupSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenZod(parsed.error) };
  }

  const d = parsed.data as PassengerSignupInput;
  const supabase = await createClient();
  const timeStr = d.preferred_time.length === 5 ? `${d.preferred_time}:00` : d.preferred_time;

  const { error } = await supabase.from("passenger_signups").insert({
    full_name: d.full_name,
    email: d.email,
    whatsapp_phone: d.whatsapp_phone,
    cnic: d.cnic,
    route_from: d.route_from,
    route_from_other: d.route_from === "Other" ? d.route_from_other : null,
    route_to: d.route_to,
    route_to_other: d.route_to === "Other" ? d.route_to_other : null,
    preferred_time: timeStr,
    days_needed: d.days_needed,
    seats_needed: d.seats_needed,
    notes: d.notes || null,
  });

  if (error) {
    console.error(error);
    return { ok: false, message: error.message || "Could not save. Try again." };
  }

  revalidateAdminSurfaces();
  return { ok: true };
}
