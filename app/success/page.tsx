"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessInner() {
  const checkoutId = useSearchParams().get("checkout_id");
  const [state, setState] = useState<{ status: string; rank?: number }>({ status: "pending" });

  useEffect(() => {
    if (!checkoutId) return;
    let stop = false;
    async function poll() {
      const res = await fetch(`/api/intents?checkout_id=${checkoutId}`, { cache: "no-store" });
      const data = await res.json();
      if (stop) return;
      setState(data);
      if (data.status !== "paid") setTimeout(poll, 1500);
    }
    poll();
    return () => {
      stop = true;
    };
  }, [checkoutId]);

  const paid = state.status === "paid";

  return (
    <main className="mx-auto flex w-full max-w-md grow flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-3xl font-bold tracking-[-0.03em]">
        {paid ? "You're on the board 🎉" : "Confirming your payment…"}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {paid
          ? state.rank
            ? `You're currently ranked #${state.rank}.`
            : "Your bid has been applied."
          : "Hang tight — this updates as soon as the payment clears. Safe to close the tab; the webhook still applies it."}
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Back to the board
      </Link>
    </main>
  );
}

export default function Success() {
  return (
    <Suspense fallback={null}>
      <SuccessInner />
    </Suspense>
  );
}
