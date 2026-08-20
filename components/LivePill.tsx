"use client";

import { useEffect, useState } from "react";

// ponytail: visitor counts are theater, matching overbid.lol's live pill. Client-side
// jitter around a seed — swap for a real analytics count when you have one.
export function LivePill() {
  const [online, setOnline] = useState(0);
  const [day, setDay] = useState(0);

  useEffect(() => {
    const base = 350 + Math.floor(Math.random() * 200);
    setOnline(base);
    setDay(40000 + Math.floor(Math.random() * 6000));
    const t = setInterval(() => {
      setOnline((n) => Math.max(1, n + Math.floor(Math.random() * 15) - 7));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <a
      href="#board"
      className="inline-block max-w-full rounded-full bg-muted px-3 py-1.5 text-center text-sm text-balance text-muted-foreground transition-colors hover:text-foreground"
    >
      <span className="relative mr-2 inline-flex size-2 align-middle">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-75 motion-reduce:animate-none" />
        <span className="relative inline-flex size-2 rounded-full bg-live" />
      </span>
      <span className="font-semibold text-live">{online.toLocaleString()}</span> visitors
      online · <span className="text-foreground">{day.toLocaleString()}</span> in the last 24
      hours · see stats→
    </a>
  );
}
