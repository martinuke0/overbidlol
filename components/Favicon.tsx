"use client";

import { useState } from "react";

// `cover` = a real avatar/profile pic → fill the tile. Otherwise a small site favicon (centered).
// Falls back to the letter avatar when the image is missing / errors.
export function Favicon({
  src,
  letter,
  cover = false,
}: {
  src: string | null;
  letter: string;
  cover?: boolean;
}) {
  const [err, setErr] = useState(false);
  if (!src || err) return <>{letter}</>;
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt=""
      className={cover ? "size-full object-cover" : "size-7"}
      onError={() => setErr(true)}
    />
  );
}
