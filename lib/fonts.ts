import { Figtree, Inter } from "next/font/google";

/* The dashboard uses Inter, the font in the reference admin. The public
   pages keep Inter Tight. Self-hosted by next/font. */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/* v4 marketing pages: Figtree 400/500/600, the Wintech Studio face. */
export const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-figtree",
  display: "swap",
});
