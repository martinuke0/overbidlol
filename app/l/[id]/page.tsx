import { redirect } from "next/navigation";

// Old share links used /l/<uuid>; the personal scheme is now /roast/<slug>.
// Keep these alive by forwarding — getListingById on /roast resolves a uuid too.
export default async function LegacyListing({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/roast/${id}`);
}
