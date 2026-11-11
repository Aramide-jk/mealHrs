import { z } from "zod";

export const emailSchema = z.string().trim().email("Enter a valid email address.");
export const phoneSchema = z.string().trim().regex(/^\+?234\d{10}$/, "Enter a valid Nigerian phone number.");
export const instructionsSchema = z.string().trim().max(300, "Keep instructions under 300 characters.");

export const addressInputSchema = z.object({
  label: z.string().trim().min(2, "Add a short label."),
  line1: z.string().trim().min(8, "Enter the full delivery address."),
  areaId: z.string().trim().min(1, "Select an area."),
  instructions: instructionsSchema.optional(),
});

export type AddressInput = z.infer<typeof addressInputSchema>;
