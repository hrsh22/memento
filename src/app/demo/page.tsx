import { Memento } from "@/components/memento";

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ evidence?: string }>;
}) {
  const evidence = (await searchParams).evidence === "1";
  return <Memento key={evidence ? "evidence" : "lab"} evidence={evidence} />;
}
