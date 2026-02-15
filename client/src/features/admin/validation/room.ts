import * as z from "zod";

export const roomSchema = z
  .object({
    roomNumber: z.string().min(1, "Room number is required"),
    roomType: z.enum(["SINGLE", "DOUBLE", "SUITE", "DELUXE"]),
    pricePerNight: z.number().positive("Price must be a positive number"),
    capacity: z.number().int().min(1, "Capacity must be at least 1"),
    isAvailable: z.boolean(),
    bookableIndividually: z.boolean(),
    hotelId: z.string().optional(),
    apartmentId: z.string().optional(),
  })
  .refine((data) => data.hotelId || data.apartmentId, {
    message: "Please select either a hotel or an apartment",
    path: ["hotelId"],
  });

export type RoomFormData = z.infer<typeof roomSchema>;

export const roomUpdateSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  roomType: z.enum(["SINGLE", "DOUBLE", "SUITE", "DELUXE"]),
  pricePerNight: z.number().positive("Price must be a positive number"),
  capacity: z.number().int().min(1, "Capacity must be at least 1"),
  isAvailable: z.boolean(),
  bookableIndividually: z.boolean(),
});

export type RoomUpdateFormData = z.infer<typeof roomUpdateSchema>;
