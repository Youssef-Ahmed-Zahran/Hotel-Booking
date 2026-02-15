import * as z from "zod";

export const amenitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export type AmenityFormData = z.infer<typeof amenitySchema>;
