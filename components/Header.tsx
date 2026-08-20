import { LivePill } from "./LivePill";

function Crown() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden className="shrink-0">
      <path d="M4 23 L6 10 L13 16 L16 7 L19 16 L26 10 L28 23 Z" fill="var(--primary)" />
      <rect x="4" y="23" width="24" height="4" rx="1.5" fill="var(--foreground)" />
    </svg>
  );
}

function DownChevrons() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 32 32"
      fill="none"
      stroke-width="4"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden
      className="shrink-0"
    >
      <path d="M6 11 L16 19 L26 11" stroke="var(--foreground)" />
      <path d="M6 18 L16 26 L26 18" stroke="var(--primary)" />
    </svg>
  );
}

export function Header({ mode }: { mode: "overbid" | "downbid" }) {
  const down = mode === "downbid";
  return (
    <header className="mb-5 text-center">
      <div className="inline-flex items-center justify-center gap-2.5 text-[30px] font-semibold tracking-[-0.04em] text-foreground">
        {down ? <DownChevrons /> : <Crown />}
        {down ? (
          <span>
            downbid<span className="text-primary">!</span>
          </span>
        ) : (
          "overbid.lol"
        )}
      </div>
      <div className="mt-4">
        <LivePill />
      </div>
      <p className="mx-auto mt-5 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground [text-wrap:pretty]">
        {down ? (
          <>
            <span className="font-semibold text-primary">Haters welcome.</span> Pay to drag a rival
            down the board — there&apos;s a 25% tax on every takedown.
          </>
        ) : (
          <>
            <span className="font-semibold text-primary">Rank is for sale.</span> Overbid everyone,
            take #1, and get seen when this board goes viral.
          </>
        )}
      </p>
    </header>
  );
}
