"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
    </svg>
  );
}

export function BidForm({
  defaultDollars,
  devMode,
}: {
  defaultDollars: number;
  devMode: boolean;
}) {
  const router = useRouter();
  const [dollars, setDollars] = useState(defaultDollars);
  const [target, setTarget] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const bump = (d: number) => setDollars((n) => Math.max(1, n + d));

  // A URL if it looks like one, otherwise treat as an @handle.
  function splitInput() {
    const v = target.trim();
    if (!v) return {};
    if (v.startsWith("@") || (!v.includes(".") && !v.includes("/"))) return { handle: v };
    return { url: /^https?:\/\//i.test(v) ? v : `https://${v}` };
  }

  async function submit(endpoint: string) {
    if (!target.trim()) {
      setError("Enter a URL or @handle first");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...splitInput(), amount_dollars: dollars }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      if (data.url) {
        window.location.href = data.url; // real Polar checkout
      } else {
        setTarget("");
        router.refresh(); // dev simulate: board updates in place
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const stepBtn =
    "inline-flex size-7 items-center justify-center rounded-full bg-muted text-lg leading-none text-muted-foreground transition-colors hover:text-foreground";

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[32px] font-bold tracking-[-0.03em] md:text-[44px]">
        <span>Grab #1 for</span>
        <span className="inline-flex items-center gap-2">
          <button type="button" aria-label="decrease" onClick={() => bump(-1)} className={stepBtn}>
            −
          </button>
          <span className="inline-flex items-baseline text-primary">
            $
            <input
              inputMode="numeric"
              aria-label="Amount in dollars"
              value={dollars}
              onChange={(e) =>
                setDollars(Math.max(1, Math.floor(Number(e.target.value.replace(/\D/g, "")) || 1)))
              }
              className="min-w-0 bg-transparent p-0 text-center font-[inherit] text-[inherit] tracking-[inherit] tabular-nums text-primary outline-none"
              style={{ width: `${Math.max(1, String(dollars).length)}ch` }}
            />
          </span>
          <button type="button" aria-label="increase" onClick={() => bump(1)} className={stepBtn}>
            +
          </button>
        </span>
      </div>

      <p className="mx-auto mt-3 max-w-md text-center text-sm text-muted-foreground [text-wrap:pretty]">
        Your bid is your rank. Bid under #1 and you still land on the board — wherever the money
        puts you.
      </p>

      <div className="mt-5 flex items-stretch gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <GlobeIcon />
          </span>
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit("/api/checkout")}
            placeholder="Your product URL or @handle"
            className="w-full rounded-full border bg-card py-3.5 pr-4 pl-11 text-base outline-none transition-shadow focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => submit("/api/checkout")}
          className="shrink-0 rounded-full bg-foreground px-7 py-3.5 text-base font-bold whitespace-nowrap text-background transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "…" : "Overbid"}
        </button>
      </div>

      {error && <p className="mt-3 text-center text-sm font-medium text-destructive">{error}</p>}

      {devMode && (
        <button
          type="button"
          disabled={busy}
          onClick={() => submit("/api/dev/simulate")}
          className="mt-2 inline-flex w-full items-center justify-center rounded-full border px-6 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
        >
          ⚡ Simulate paid bid (dev, no charge)
        </button>
      )}

      <p className="mt-3 text-center text-sm text-muted-foreground">
        Already on the list? Enter the same URL or @handle and up your bid to get back to the top.
      </p>
    </div>
  );
}
