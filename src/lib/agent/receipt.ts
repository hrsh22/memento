/** Canonical serialization makes receipt signatures independent of object key order. */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value))
    return "[" + value.map(canonicalJson).join(",") + "]";
  const o = value as Record<string, unknown>;
  return (
    "{" +
    Object.keys(o)
      .filter((k) => o[k] !== undefined)
      .sort()
      .map((k) => JSON.stringify(k) + ":" + canonicalJson(o[k]))
      .join(",") +
    "}"
  );
}
export function receiptMessage(receipt: Record<string, unknown>): string {
  const unsigned = { ...receipt };
  delete unsigned.decisionSignature;
  return "Memento decision receipt v1\n" + canonicalJson(unsigned);
}
