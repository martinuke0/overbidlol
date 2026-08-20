"use client";

import { useState } from "react";

// Falls back to the letter avatar when a domain has no favicon (Google 404s).
export function Favicon({ src, letter }: { src: string | null; letter: string }) {
  const [err, setErr] = useState(false);
  if (!src || err) return <>{letter}</>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className="size-6" onError={() => setErr(true)} />;
}
