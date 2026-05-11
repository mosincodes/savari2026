export default function MainAppLoading() {
  return (
    <div role="status" aria-label="Loading" className="space-y-6">
      <div className="space-y-3">
        <div className="bg-muted animate-pulse h-9 w-full max-w-sm rounded-xl" />
        <div className="bg-muted animate-pulse h-5 w-full max-w-md rounded-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="border-border bg-muted/60 h-36 animate-pulse rounded-2xl border" />
        <div className="border-border bg-muted/60 h-36 animate-pulse rounded-2xl border" />
      </div>
      <div className="border-border bg-muted/40 h-32 animate-pulse rounded-2xl border" />
    </div>
  );
}
