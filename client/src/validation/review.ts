import * as z from "zod";

export const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z.string().min(1, "Comment is required"),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
