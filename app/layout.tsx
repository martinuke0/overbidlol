import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const DESC =
  "Rank is for sale. Overbid everyone, take #1, anoverbidseen when this board goes viral. No ads, no API keys, no revenue share.";

export const metadata: Metadata = {
  title: "overbid.lol",
  description: DESC,
  openGraph: {
    title: "overbid.lol",
    description: DESC,
    type: "website",
  },
  twitter: { card: "summary_large_image", description: DESC },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
