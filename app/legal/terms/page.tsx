import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { LegalPlainDocument } from "@/components/legal-document";
import { readLegalSource } from "@/lib/legal/load-source";

export const metadata: Metadata = {
  title: "Terms of service · Savvari",
  description: "Terms governing use of the Savvari peer-to-peer carpooling Platform in Lahore, Pakistan.",
};

export default async function TermsPage() {
  const raw = await readLegalSource("terms-of-service.txt");
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:py-16 lg:px-6">
        <LegalPlainDocument raw={raw} backHref="/legal" backLabel="← Legal" />
      </main>
    </div>
  );
}
