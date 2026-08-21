"use client";

// Opens an X (Twitter) compose window pre-filled with the listing's share link.
export function ShareButton({ id, name, rank }: { id: string; name: string; rank: number }) {
  function share(e: React.MouseEvent) {
    e.preventDefault();
    const url = `${window.location.origin}/l/${id}`;
    const text = `Should ${name} be #${rank} on overbid.lol? 😤\nOutbid them — or drag them down 👇`;
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text,
    )}&url=${encodeURIComponent(url)}`;
    window.open(intent, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      onClick={share}
      className="text-[11px] font-semibold text-muted-foreground underline decoration-dotted underline-offset-2 transition-colors hover:text-primary"
    >
      ↗ share on X
    </button>
  );
}
