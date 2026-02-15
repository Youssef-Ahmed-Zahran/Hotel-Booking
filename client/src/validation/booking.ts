import * as z from "zod";

export const bookingSchema = z
  .object({
    checkInDate: z.string().min(1, "Check-in date is required"),
    checkOutDate: z.string().min(1, "Check-out date is required"),
    numberOfGuests: z.number().int().min(1, "At least 1 guest is required"),
  })
  .refine(
    (data) => {
      const checkIn = new Date(data.checkInDate);
      const checkOut = new Date(data.checkOutDate);
      return checkOut > checkIn;
    },
    {
      message: "Check-out date must be after check-in date",
      path: ["checkOutDate"],
    }
  );

export type BookingFormData = z.infer<typeof bookingSchema>;
