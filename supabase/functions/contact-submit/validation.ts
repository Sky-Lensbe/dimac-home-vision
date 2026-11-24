import { z } from "npm:zod@3";
const text = z.string().trim().max(200);
export const Body = z.object({
  id: z.string().uuid(), type: z.enum(["contact", "renovation", "woningscan"]),
  name: text.min(1), email: z.string().trim().email().max(255), phone: text.optional(),
  message: z.string().trim().max(4000).optional(), subject: text.optional(),
  location: text.optional(), address: text.optional(), timing: text.optional(),
  budget: text.optional(), start: text.optional(), scope: text.optional(), approach: text.optional(),
  renovationType: text.optional(), packageId: z.enum(["woningscan", "woningscan-plus"]).optional(),
  drone: z.boolean().optional(), situation: z.enum(["kopen", "renoveren"]).nullable().optional(),
  reportRef: z.string().regex(/^QS-\d{8}-[A-Z0-9]{8}$/).nullable().optional(),
  website: z.string().max(0), startedAt: z.number().int().positive(),
}).strict().superRefine((d, ctx) => {
  if (d.type === "contact" && !d.message) ctx.addIssue({ code: "custom", message: "Bericht ontbreekt" });
  if (d.type === "woningscan" && (!d.packageId || !d.address)) ctx.addIssue({ code: "custom", message: "Pakket of adres ontbreekt" });
  if (d.type === "renovation" && (!d.renovationType || !d.location)) ctx.addIssue({ code: "custom", message: "Type of locatie ontbreekt" });
});
