import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";
import "./templates.css";
import { inter } from "@/lib/fonts";

// Inter Tight is what gives Webild its tight, calm headlines. next/font
// self-hosts it, so visitors never make a request to Google.
const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wintech Templates · a live site from a template, today",
  description:
    "Browse templates for portfolios, landing pages, stores, and booking. Preview any of them free, then make one yours at name.wintechstudio.com.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${interTight.variable} ${inter.variable}`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
