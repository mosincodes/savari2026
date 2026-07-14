import { LAHORE_AREAS } from "@/lib/constants";

/** Minutes — commute searches need a wider window than 15 (e.g. 3 PM search → 4 PM ride). */
export const COMMUTE_TIME_WINDOW_MIN = 90;

const CANONICAL = new Set<string>(LAHORE_AREAS);

/** Map short / survey labels to canonical LAHORE_AREAS strings. */
const AREA_ALIASES: Record<string, string> = {
  Gulberg: "Gulberg / Garden Town",
  "Garden Town": "Gulberg / Garden Town",
  DHA: "DHA / Defence",
  Defence: "DHA / Defence",
  "Johar Town": "Johar Town / Valencia",
  Valencia: "Johar Town / Valencia",
  "Model Town": "Model Town / Faisal Town",
  "Faisal Town": "Model Town / Faisal Town",
  "Bahria Town": "Bahria Town / Paragon",
  Paragon: "Bahria Town / Paragon",
  Cantt: "Cantt / Walton",
  Walton: "Cantt / Walton",
  "Iqbal Town": "Iqbal Town / Township",
  Township: "Iqbal Town / Township",
  "Lake City": "Lake City",
};

/** Resolve filter value to the canonical area stored in the DB, if possible. */
export function canonicalArea(area: string | undefined): string | undefined {
  if (!area?.trim()) return undefined;
  const t = area.trim();
  if (CANONICAL.has(t)) return t;
  return AREA_ALIASES[t] ?? t;
}

/** Display label for stored area (handles "Other" + custom text). */
export function displayArea(area: string, other: string | null | undefined): string {
  if (area === "Other" && other?.trim()) return other.trim();
  return area;
}
