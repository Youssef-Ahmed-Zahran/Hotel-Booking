import * as z from "zod";

export const reviewSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  hotelId: z.string().min(1, "Hotel ID is required"),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  reviewType: z.enum(["HOTEL", "APARTMENT", "ROOM"]),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
