import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function resolveMetadataBase(): URL {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    try {
      const u = new URL(fromEnv.endsWith("/") ? fromEnv.slice(0, -1) : fromEnv);
      return u;
    } catch {
      /* fall through */
    }
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    try {
      return new URL(`https://${vercel}`);
    } catch {
      /* fall through */
    }
  }
  return new URL("http://localhost:3000");
}

const metadataBase = resolveMetadataBase();
const ogTitle = "Savvari · Lahore Carpooling";
const ogDescription =
  "Peer-to-peer carpooling for Lahore. Share rides, split fuel, build a smarter commute.";

export const metadata: Metadata = {
  metadataBase,
  title: ogTitle,
  description: ogDescription,
  openGraph: {
    title: ogTitle,
    description: ogDescription,
    siteName: "Savvari",
    locale: "en_PK",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: ogTitle,
    description: ogDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${dmSerif.variable} ${geistMono.variable} min-h-screen font-sans`}
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
