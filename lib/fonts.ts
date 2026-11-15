import { Inter } from "next/font/google";

/* The dashboard uses Inter, the font in the reference admin. The public
   pages keep Inter Tight. Self-hosted by next/font. */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
