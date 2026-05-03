"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const nextPath = searchParams.get("next") || "/dashboard";
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone) {
      toast.error("Missing phone. Start from login.");
      router.push("/login");
      return;
    }
    if (token.length < 4) {
      toast.error("Enter the code from SMS");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        phone,
        token: token.replace(/\s/g, ""),
      }),
    });
    const body = (await res.json()) as { ok?: boolean; error?: string };
    setLoading(false);

    if (!res.ok) {
      toast.error(body.error ?? "Verification failed.");
      return;
    }

    toast.success("Welcome back!");
    router.push(nextPath);
    router.refresh();
  }

  if (!phone) {
    return (
      <p className="text-muted-foreground text-sm">
        No phone in link.{" "}
        <Link href="/login" className="text-foreground underline">
          Go to login
        </Link>
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">Code sent to {phone}</p>
      <div className="space-y-2">
        <Label htmlFor="token">One-time code</Label>
        <Input
          id="token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="123456"
          inputMode="numeric"
          autoComplete="one-time-code"
        />
      </div>
      <Button type="submit" className="rounded-full" disabled={loading}>
        {loading ? "Verifying…" : "Verify & continue"}
      </Button>
    </form>
  );
}

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Enter code</CardTitle>
            <CardDescription>Type the OTP we sent to your phone.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<p className="text-muted-foreground text-sm">Loading…</p>}>
              <VerifyForm />
            </Suspense>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
