export function SiteFooter() {
  const y = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-muted/20 py-6 text-center text-xs text-muted-foreground">
      Savvari · Lahore · سواری © {y}
    </footer>
  );
}
