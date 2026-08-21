"use client";

import { useState } from "react";

const MAX = 100;
const priceCents = (len: number) => Math.min(MAX, Math.max(50, len)); // 1¢/char, 50¢ min, $1 max
const usd = (c: number) => (c % 100 === 0 ? `$${c / 100}` : `$${(c / 100).toFixed(2)}`);

// `target` is the listing's @handle or URL.
export function EditBio({ target }: { target: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isHandle = target.startsWith("@") || (!target.includes(".") && !target.includes("/"));
  const body = isHandle ? { handle: target } : { url: target };

  async function submit() {
    if (!text.trim()) {
      setError("Write something first");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...body, description: text.slice(0, MAX) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      window.location.href = data.url; // Polar checkout
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
        className="text-[11px] font-semibold text-muted-foreground underline decoration-dotted underline-offset-2 transition-colors hover:text-primary"
      >
        ✎ edit the hater
      </button>
    );
  }

  return (
    <div
      className="mt-1 rounded-lg border bg-card p-2"
      onClick={(e) => e.preventDefault()}
    >
      <textarea
        autoFocus
        rows={2}
        maxLength={MAX}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write their new bio…"
        className="w-full resize-none rounded-md bg-transparent text-sm outline-none"
      />
      <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span>
          {text.length}/{MAX} · pay {usd(priceCents(text.length))}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
            }}
            className="font-semibold hover:text-foreground"
          >
            cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={submit}
            className="rounded-full bg-primary px-3 py-1 font-bold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "…" : "pay to edit"}
          </button>
        </div>
      </div>
      {error && <p className="mt-1 text-[11px] font-medium text-destructive">{error}</p>}
    </div>
  );
}
