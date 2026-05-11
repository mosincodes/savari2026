import Link from "next/link";

export function SiteFooter() {
  const y = new Date().getFullYear();
  const link = "font-medium text-muted-foreground hover:text-accent transition-colors";

  return (
    <footer className="border-border bg-muted/20 px-4 py-8">
      <div className="text-muted-foreground mx-auto flex max-w-5xl flex-col items-center gap-6 text-xs sm:flex-row sm:flex-wrap sm:justify-between">
        <p className="text-center font-medium">
          Savvari · Lahore · سواری © {y}
        </p>
        <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link href="/legal" className={link}>
            Legal hub
          </Link>
          <Link href="/legal/terms" className={link}>
            Terms
          </Link>
          <Link href="/legal/privacy" className={link}>
            Privacy
          </Link>
          <Link href="/legal/community" className={link}>
            Safety
          </Link>
        </nav>
      </div>
    </footer>
  );
}
