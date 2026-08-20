"use client";

import { useEffect, useState } from "react";

// Real stats: heartbeat a visitor id every 30s, poll distinct-visitor counts every 15s.
function visitorId(): string {
  try {
    let id = localStorage.getItem("ov_vid");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("ov_vid", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

export function LivePill() {
  const [online, setOnline] = useState<number | null>(null);
  const [day, setDay] = useState<number | null>(null);

  useEffect(() => {
    const vid = visitorId();
    const beat = () =>
      fetch("/api/visit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ visitor: vid }),
      }).catch(() => {});
    const load = () =>
      fetch("/api/stats", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          setOnline(d.online);
          setDay(d.day);
        })
        .catch(() => {});
    beat();
    load();
    const b = setInterval(beat, 30000);
    const l = setInterval(load, 15000);
    return () => {
      clearInterval(b);
      clearInterval(l);
    };
  }, []);

  return (
    <a
      href="https://app.vemetric.com/public/overbid.lol"
      target="_blank"
      rel="noopener"
      className="inline-block max-w-full rounded-full bg-muted px-3 py-1.5 text-center text-sm text-balance text-muted-foreground transition-colors hover:text-foreground"
    >
      <span className="relative mr-2 inline-flex size-2 align-middle">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-75 motion-reduce:animate-none" />
        <span className="relative inline-flex size-2 rounded-full bg-live" />
      </span>
      <span className="font-semibold text-live">{(online ?? 0).toLocaleString()}</span> visitors
      online · <span className="text-foreground">{(day ?? 0).toLocaleString()}</span> in the last
      24 hours · see stats→
    </a>
  );
}
