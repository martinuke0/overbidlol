import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const DESC =
  "Rank is for sale. Overbid everyone, take #1, and get seen when this board goes viral. No ads, no API keys, no revenue share.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://overbid.lol"),
  title: {
    default: "overbid.lol — the pay-to-rank leaderboard",
    template: "%s · overbid.lol",
  },
  description: DESC,
  applicationName: "overbid.lol",
  keywords: [
    "overbid",
    "pay to rank",
    "leaderboard",
    "auction",
    "startup leaderboard",
    "bid to rank",
    "downbid",
    "product ranking",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "overbid.lol — the pay-to-rank leaderboard",
    description: DESC,
    url: "/",
    siteName: "overbid.lol",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "overbid.lol — the pay-to-rank leaderboard",
    description: DESC,
  },
  verification: { google: "Upstw_YLQyfe035QAJfiEBe4uPc4x27TeCw3hGOo5AM" },
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
