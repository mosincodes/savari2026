import { SiteHeader } from "@/components/site-header";
import { AppNavigation } from "@/components/app-nav";
import { requireOnboardedProfile } from "@/lib/require-profile";

export default async function MainAppLayout({ children }: { children: React.ReactNode }) {
  await requireOnboardedProfile();

  return (
    <div className="bg-app-dots flex min-h-screen flex-col">
      <SiteHeader showAuth={false} appShell />
      <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-5xl flex-1 gap-8 px-4 py-6 md:py-10">
        <aside className="hidden w-52 shrink-0 md:block lg:w-56">
          <div className="sticky top-16">
            <p className="text-muted-foreground px-3 pb-2 text-xs font-semibold uppercase tracking-wider">
              Menu
            </p>
            <AppNavigation orientation="sidebar" />
          </div>
        </aside>

        {/* Extra bottom padding on small screens — bottom tab bar */}
        <div className="min-w-0 flex-1 pb-20 md:pb-0">{children}</div>
      </div>

      <div className="border-border/70 fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur-md md:hidden supports-[backdrop-filter]:bg-background/80">
        <AppNavigation orientation="bottom" />
      </div>
    </div>
  );
}
