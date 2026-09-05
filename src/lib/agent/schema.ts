import { z } from "zod";
export const policySchema = z.object({
  reserveDays: z.number().int().min(1).max(365),
  maxMonthlyUsdfc: z.number().finite().min(0).max(100),
  minUtility: z.number().min(0).max(100),
  allowCompaction: z.boolean(),
});
export const memoriesSchema = z
  .array(
    z.object({
      id: z.string().min(1).max(100),
      title: z.string().min(1).max(200),
      kind: z.enum(["core", "research", "trace", "artifact"]),
      content: z.string().min(1).max(1000000),
      importance: z.number().finite().min(0).max(100),
      accesses: z.number().int().min(0),
      ageDays: z.number().finite().min(0),
      pinned: z.boolean(),
    }),
  )
  .min(1)
  .max(200)
  .refine(
    (m) => new Set(m.map((i) => i.id)).size === m.length,
    "Memory IDs must be unique",
  );
