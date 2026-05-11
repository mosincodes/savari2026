"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { normalizeLocalPkPhone } from "@/lib/constants";
import { shouldTryPkOtpBypassBeforeOtp } from "@/lib/skip-otp-bypass";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const local = normalizeLocalPkPhone(phone);
    if (!local) {
      toast.error("Enter a valid Pakistani number: 03XXXXXXXXX");
      return;
    }

    setLoading(true);

    if (shouldTryPkOtpBypassBeforeOtp(local)) {
      const bypassRes = await fetch("/api/auth/bypass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: local }),
      });
      const bypassBody = (await bypassRes.json()) as {
        ok?: boolean;
        reason?: string;
        message?: string;
        error?: string;
      };
      if (bypassRes.ok && bypassBody.ok) {
        setLoading(false);
        toast.success("Welcome back!");
        router.push(nextPath);
        router.refresh();
        return;
      }

      if (bypassRes.status === 403 && bypassBody.reason === "not_eligible") {
        /* fall through to SMS OTP below */
      } else {
        setLoading(false);
        toast.error(bypassBody.message ?? bypassBody.error ?? "Could not sign in without code.");
        return;
      }
    }

    const otpRes = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ phone: local }),
    });
    const otpBody = (await otpRes.json()) as { ok?: boolean; error?: string };
    setLoading(false);

    if (!otpRes.ok) {
      toast.error(otpBody.error ?? "Could not send code.");
      return;
    }

    toast.success("OTP sent. Check your SMS.");
    router.push(`/verify?phone=${encodeURIComponent(local)}&next=${encodeURIComponent(nextPath)}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Log in</CardTitle>
        <CardDescription>
          We verify your number with a one-time code delivered by SMS first; WhatsApp may be used depending on
          your carrier and our messaging setup.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="03XXXXXXXXX"
              inputMode="numeric"
              maxLength={11}
              autoComplete="tel"
            />
          </div>
          <Button type="submit" className="rounded-full" disabled={loading}>
            {loading ? "Sending…" : "Send code"}
          </Button>
          <p className="text-muted-foreground text-center text-xs">
            By continuing you agree to Savvari’s trial terms.{" "}
            <Link href="/join/passenger" className="underline">
              New here? Sign up first
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <Suspense fallback={<p className="text-muted-foreground text-center text-sm">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
