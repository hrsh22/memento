import { Memento } from "@/components/memento";

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ evidence?: string; live?: string }>;
}) {
  const params = await searchParams;
  const evidence = params.evidence === "1";
  // ?live=1 opens the live treasury without jumping to the receipts view.
  const live = evidence || params.live === "1";
  return (
    <Memento
      key={evidence ? "evidence" : live ? "live" : "lab"}
      evidence={evidence}
      live={live}
    />
  );
}
