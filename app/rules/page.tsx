import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rules · overbid.lol",
  description: "How overbid.lol works: rank is the bid, nothing else.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold tracking-[-0.02em] text-foreground">{title}</h2>
      <ul className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-muted-foreground">
        {children}
      </ul>
    </section>
  );
}

const Li = ({ children }: { children: React.ReactNode }) => (
  <li className="relative pl-5 before:absolute before:left-0 before:top-2.5 before:size-1.5 before:rounded-full before:bg-primary">
    {children}
  </li>
);

export default function Rules() {
  return (
    <main className="mx-auto w-full max-w-2xl grow px-4 py-12 sm:py-16">
      <Link href="/" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
        ← Back to the board
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-[-0.03em] text-foreground">Rules</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        overbid.lol is a public leaderboard. No ads, no API keys, no revenue share. You pay to sit
        above everyone else — <span className="font-semibold text-foreground">rank is the bid, and nothing else.</span>
      </p>

      <Section title="How ranking works">
        <Li>Bids are in US dollars — a $1 minimum, raised $0.25 at a time.</Li>
        <Li>Paying less than #1 still lists you, at whatever rank that bid can buy.</Li>
        <Li>Equal bids keep the order they were placed — the earlier bid ranks higher.</Li>
        <Li>
          Enter the same website or @handle again to raise it. You pay only the difference above
          your current bid, never the full amount again.
        </Li>
        <Li>No one can take your rank by paying that difference — they place a new, higher bid.</Li>
        <Li>App Store, Play Store, GitHub and similar links are keyed by their path, so different apps never share a bid.</Li>
        <Li>Tracking query strings are ignored when we match your listing.</Li>
      </Section>

      <Section title="What you can list">
        <Li>A product website, or an X @handle. Products and profiles — not group chats.</Li>
        <Li>No chat or invite links: Telegram, WhatsApp, Discord, Messenger, Signal and the like.</Li>
        <Li>No sexual content. Porn, NSFW, and adult platforms don't belong on the board.</Li>
        <Li>Query parameters are stripped from listing links — affiliate, referral and tracking URLs won't carry through.</Li>
      </Section>

      <Section title="After you pay">
        <Li>Your listing is public immediately.</Li>
        <Li>Clicks go straight to the URL or profile you submitted, with no extra query parameters.</Li>
        <Li>A completed payment is what claims the rank — nothing is reserved before it clears.</Li>
      </Section>

      <p className="mt-10 text-sm text-muted-foreground">
        Questions? Everything above is enforced automatically at checkout.{" "}
        <Link href="/" className="font-semibold text-primary hover:underline">
          Back to the board →
        </Link>
      </p>
    </main>
  );
}
