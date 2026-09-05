import { describe, it, expect } from "vitest";
import { compact } from "./engine";
const filler = Array.from(
  { length: 24 },
  (_, i) => `Trace ${i}: routine polling completed.`,
).join(" ");
const fixtures = [
  {
    name: "decimal budgets",
    facts: [
      "Critical: reserve 1.25 USDFC.",
      "Never exceed 0.10 USDFC per month.",
    ],
  },
  {
    name: "late recovery instruction",
    facts: [
      "Recovery: retrieve the second copy if the first fails.",
      "You must compare SHA-256 before loading memory.",
    ],
  },
  {
    name: "negative constraint",
    facts: [
      "Never upload private keys.",
      "Mission: preserve the user's original safety boundaries.",
    ],
  },
  {
    name: "conditional exception",
    facts: [
      "Do not write unless the new quote fits.",
      "Critical: a funded wallet does not override the cap.",
    ],
  },
  {
    name: "URLs and filenames",
    facts: [
      "Recovery: read https://example.org/archive/v1.2.json.",
      "You must keep version 2.4 of the manifest.",
    ],
  },
  {
    name: "more than four essential facts",
    facts: Array.from(
      { length: 7 },
      (_, i) => `Constraint ${i}: this protected fact must remain.`,
    ),
  },
];
describe("annotated essential-fact compaction fixtures", () => {
  it.each(fixtures)("preserves $name", ({ facts }) => {
    const source = filler + " " + facts.join(" ") + " " + filler;
    const output = compact(source);
    for (const fact of facts) expect(output).toContain(fact);
    for (const sentence of output.split(/(?<=[.!?])\s+/))
      expect(source).toContain(sentence);
    expect(output.length).toBeLessThan(source.length);
  });
});
