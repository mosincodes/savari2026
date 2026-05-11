/** User-facing labels for profiles.role stored values */
export function formatRoleDisplay(role: string | null | undefined): string {
  switch (role) {
    case "both":
      return "Driver & passenger";
    case "driver":
      return "Driver";
    case "passenger":
      return "Passenger";
    default:
      return role || "—";
  }
}
