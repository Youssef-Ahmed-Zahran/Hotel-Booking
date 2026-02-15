import * as z from "zod";

export const hotelSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  postalCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  rating: z.number().min(0).max(5),
  isFeatured: z.boolean(),
});

export type HotelFormData = z.infer<typeof hotelSchema>;
