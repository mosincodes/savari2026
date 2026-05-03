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

export const metadata: Metadata = {
  title: "Savvari · Lahore Carpooling",
  description:
    "Peer-to-peer carpooling for Lahore. Share rides, split fuel, build a smarter commute.",
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
