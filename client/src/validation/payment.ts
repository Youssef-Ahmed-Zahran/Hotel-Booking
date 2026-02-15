import * as z from "zod";

export const paymentSchema = z
  .object({
    paymentMethod: z.enum(["credit_card", "debit_card", "paypal"]),
    cardNumber: z.string().optional(),
    cardName: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.paymentMethod === "credit_card" ||
      data.paymentMethod === "debit_card"
    ) {
      if (
        !data.cardNumber ||
        data.cardNumber.replace(/\s/g, "").length !== 16
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid card number (16 digits required)",
          path: ["cardNumber"],
        });
      }
      if (!data.cardName || data.cardName.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cardholder name is required",
          path: ["cardName"],
        });
      }
      if (!data.expiryDate || !/^\d{2}\/\d{2}$/.test(data.expiryDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid expiry date (MM/YY)",
          path: ["expiryDate"],
        });
      }
      if (!data.cvv || !/^\d{3,4}$/.test(data.cvv)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid CVV (3-4 digits)",
          path: ["cvv"],
        });
      }
    }
  });

export type PaymentFormData = z.infer<typeof paymentSchema>;

export interface PaymentInfo {
  paymentMethod: string;
  cardNumber?: string;
  cardName?: string;
  expiryDate?: string;
  cvv?: string;
}
