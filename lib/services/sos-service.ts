import twilio from "twilio";
import { createClient } from "@/lib/supabase/server";

export type SosResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

export async function triggerSosForUser(userId: string, rideId: string): Promise<SosResult> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("emergency_contact_phone, full_name")
    .eq("id", userId)
    .single();

  if (!profile?.emergency_contact_phone) {
    return { ok: false, status: 400, error: "Add an emergency contact in your profile first." };
  }

  const { data: ride, error: rideErr } = await supabase
    .from("rides")
    .select("id, driver_id, from_area, to_area")
    .eq("id", rideId)
    .single();

  if (rideErr || !ride) {
    return { ok: false, status: 404, error: "Ride not found" };
  }

  const isDriver = ride.driver_id === userId;
  const { data: booking } = await supabase
    .from("bookings")
    .select("id")
    .eq("ride_id", rideId)
    .eq("passenger_id", userId)
    .maybeSingle();

  if (!isDriver && !booking) {
    return { ok: false, status: 403, error: "Not on this ride" };
  }

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!sid || !token || !from) {
    return {
      ok: false,
      status: 503,
      error: "SMS not configured (Twilio env vars missing).",
    };
  }

  const client = twilio(sid, token);
  const msg = `Savvari SOS: ${profile.full_name || "User"} needs help on ride ${ride.from_area}→${ride.to_area}. Ride ID: ${rideId}`;

  try {
    await client.messages.create({
      to: profile.emergency_contact_phone,
      from,
      body: msg,
    });
  } catch (e: unknown) {
    const err = e as { message?: string };
    console.error(err);
    return { ok: false, status: 502, error: err.message || "Twilio error" };
  }

  return { ok: true };
}
