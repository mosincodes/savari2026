/** Lahore area list — same as commuter survey / product plan */
export const LAHORE_AREAS = [
  "DHA / Defence",
  "Gulberg / Garden Town",
  "Johar Town / Valencia",
  "Model Town / Faisal Town",
  "Bahria Town / Paragon",
  "Lake City",
  "Cantt / Walton",
  "Iqbal Town / Township",
  "Wapda Town",
  "Gulberg / Mall Road",
  "IT Tower / Arfa Karim",
  "University (LUMS / UET / UMT / FAST)",
  "Cantt / Fortress Stadium",
  "Other",
] as const;

export type LahoreArea = (typeof LAHORE_AREAS)[number];

export const WEEKDAYS = [
  { id: "Mon", label: "Monday" },
  { id: "Tue", label: "Tuesday" },
  { id: "Wed", label: "Wednesday" },
  { id: "Thu", label: "Thursday" },
  { id: "Fri", label: "Friday" },
  { id: "Sat", label: "Saturday" },
] as const;

/** Pakistani mobile: 03XXXXXXXXX (11 digits) */
export const PK_PHONE_REGEX = /^03\d{9}$/;

/** Normalize user input to 03XXXXXXXXX or null */
export function normalizeLocalPkPhone(input: string): string | null {
  const d = input.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("03")) return d;
  if (d.length === 12 && d.startsWith("923")) return `0${d.slice(3)}`;
  if (d.length === 10 && d.startsWith("3")) return `0${d}`;
  return null;
}

/** 10-digit PK mobile starting with 3; matches across +92 / 03 / variants in provider payloads. */
export function pkComparableMobile10(input: string | undefined | null): string | null {
  if (input == null || input === "") return null;
  const d = input.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("92")) return d.slice(2);
  if (d.length === 11 && d.startsWith("03")) return d.slice(1);
  if (d.length === 10 && d.startsWith("3")) return d;
  return null;
}

/** Normalize to E.164 for Supabase/Twilio: +923XXXXXXXXX */
export function toE164Pakistan(localPhone: string): string {
  const digits = localPhone.replace(/\D/g, "");
  if (digits.startsWith("92") && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.startsWith("0") && digits.length === 11) {
    return `+92${digits.slice(1)}`;
  }
  if (digits.length === 10 && digits.startsWith("3")) {
    return `+92${digits}`;
  }
  return `+92${digits.replace(/^0+/, "")}`;
}
