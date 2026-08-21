"use client";

// Opens an X (Twitter) compose window pre-filled with the listing's share link.
// `custom` = a per-account tweet; falls back to the default template (used by bought listings).
export function ShareButton({
  id,
  name,
  rank,
  custom,
}: {
  id: string;
  name: string;
  rank: number;
  custom?: string | null;
}) {
  function share(e: React.MouseEvent) {
    e.preventDefault();
    // Personal link: /roast/_skris or /roast/outrank.so (falls back to the id).
    const slug = name.replace(/^@/, "").trim() || id;
    const url = `${window.location.origin}/roast/${encodeURIComponent(slug)}`;
    const text =
      custom && custom.trim()
        ? custom
        : `Hey ${name} — you're only #${rank} on overbid.lol 😤\n\nDo something about it.`;
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
