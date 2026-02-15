import * as z from "zod";

export const bookingSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
  paymentStatus: z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"]),
});

export type BookingFormData = z.infer<typeof bookingSchema>;
