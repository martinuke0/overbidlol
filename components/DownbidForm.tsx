"use client";

import { useEffect, useState } from "react";
import { downbidPayCents, MIN_CENTS, STEP_CENTS } from "@/lib/bid";

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
    </svg>
  );
}

const fmt = (cents: number) => {
  const d = cents / 100;
  return d % 1 === 0 ? String(d) : d.toFixed(2);
};
const usd = (cents: number) => {
  const d = cents / 100;
  return d % 1 === 0 ? `$${d}` : `$${d.toFixed(2)}`;
};

export function DownbidForm({ defaultLowerCents }: { defaultLowerCents: number }) {
  // Default to the current top bid — enough to knock #1 off the board.
  const snapInit = (c: number) => Math.max(MIN_CENTS, Math.round(c / STEP_CENTS) * STEP_CENTS);
  const [amount, setAmount] = useState(() => fmt(snapInit(defaultLowerCents)));
  // Switching category resets the default target reduction to that category's top bid.
  useEffect(() => setAmount(fmt(snapInit(defaultLowerCents))), [defaultLowerCents]);
  const [target, setTarget] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const toCents = (s: string) => Math.round((parseFloat(s) || 0) * 100);
  const snap = (cents: number) => Math.max(MIN_CENTS, Math.round(cents / STEP_CENTS) * STEP_CENTS);
  const bump = (dir: number) => setAmount(fmt(snap(snap(toCents(amount)) + dir * STEP_CENTS)));

  const lowerCents = snap(toCents(amount));
  const payCents = downbidPayCents(lowerCents);

  function splitInput() {
    const v = target.trim();
    if (!v) return {};
    if (v.startsWith("@") || (!v.includes(".") && !v.includes("/"))) return { handle: v };
    return { url: /^https?:\/\//i.test(v) ? v : `https://${v}` };
  }

  async function submit() {
    if (!target.trim()) {
      setError("Enter the target's URL or @handle");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      setAmount(fmt(lowerCents));
      const res = await fetch("/api/downbid", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...splitInput(), lower_cents: lowerCents }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      window.location.href = data.url;
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
        <span>Drag a rival down</span>
        <span className="inline-flex items-center gap-2">
          <button type="button" aria-label="decrease" onClick={() => bump(-1)} className={stepBtn}>
            −
          </button>
          <span className="inline-flex w-[7ch] items-baseline justify-center text-primary">
            $
            <input
              inputMode="decimal"
              aria-label="Amount to lower, in dollars"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
              onBlur={() => setAmount(fmt(snap(toCents(amount))))}
              className="min-w-0 bg-transparent p-0 text-left font-[inherit] text-[inherit] tracking-[inherit] tabular-nums text-primary outline-none"
              style={{ width: `${Math.max(1, amount.length)}ch` }}
            />
          </span>
          <button type="button" aria-label="increase" onClick={() => bump(1)} className={stepBtn}>
            +
          </button>
        </span>
      </div>

      <p className="mx-auto mt-3 max-w-md text-center text-sm text-muted-foreground [text-wrap:pretty]">
        You pay <span className="font-semibold text-foreground">{usd(payCents)}</span> — that&apos;s{" "}
        {usd(lowerCents)} off their bid plus a 25% hater tax. Drop them to $0 and they&apos;re off
        the board.
      </p>

      <div className="mt-5 flex items-stretch gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <GlobeIcon />
          </span>
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Target's URL or @handle"
            className="w-full rounded-full border bg-card py-3.5 pr-4 pl-11 text-base outline-none transition-shadow focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={submit}
          className="shrink-0 rounded-full bg-destructive px-7 py-3.5 text-base font-bold whitespace-nowrap text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "…" : "Downbid"}
        </button>
      </div>

      {error && <p className="mt-3 text-center text-sm font-medium text-destructive">{error}</p>}

      <p className="mt-3 text-center text-sm text-muted-foreground">
        Must already be on the board. Lower them enough and they vanish — no refunds, no mercy.
      </p>
    </div>
  );
}
