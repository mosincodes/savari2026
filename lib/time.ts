/** "HH:MM" or "HH:MM:SS" → minutes from midnight */
export function timeToMinutes(t: string): number {
  const parts = t.split(":");
  const h = Number(parts[0] || 0);
  const m = Number(parts[1] || 0);
  return h * 60 + m;
}

export function withinMinutes(a: string, b: string, window: number): boolean {
  const diff = Math.abs(timeToMinutes(a) - timeToMinutes(b));
  const wrap = Math.min(diff, 24 * 60 - diff);
  return wrap <= window;
}
