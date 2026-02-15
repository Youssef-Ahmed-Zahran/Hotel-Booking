import * as z from "zod";

export const apartmentSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  apartmentNumber: z.string().min(1, "Apartment number is required"),
  pricePerNight: z.number().positive("Price must be a positive number"),
  totalCapacity: z.number().int().min(1, "Capacity must be at least 1"),
  numberOfBedrooms: z.number().int().min(1, "At least 1 bedroom is required"),
  numberOfBathrooms: z.number().int().min(1, "At least 1 bathroom is required"),
  apartmentType: z.enum([
    "STUDIO",
    "ONE_BEDROOM",
    "TWO_BEDROOM",
    "THREE_BEDROOM",
    "PENTHOUSE",
    "SUITE",
  ]),
  roomsBookableSeparately: z.boolean(),
  hotelId: z.string().min(1, "Please select a hotel"),
});

export type ApartmentFormData = z.infer<typeof apartmentSchema>;

export const apartmentUpdateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  pricePerNight: z.number().positive("Price must be a positive number"),
  totalCapacity: z.number().int().min(1, "Capacity must be at least 1"),
  numberOfBedrooms: z.number().int().min(1, "At least 1 bedroom is required"),
  numberOfBathrooms: z.number().int().min(1, "At least 1 bathroom is required"),
  apartmentType: z.enum([
    "STUDIO",
    "ONE_BEDROOM",
    "TWO_BEDROOM",
    "THREE_BEDROOM",
    "PENTHOUSE",
    "SUITE",
  ]),
  roomsBookableSeparately: z.boolean(),
});

export type ApartmentUpdateFormData = z.infer<typeof apartmentUpdateSchema>;
