import * as z from "zod";

export const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  role: z.enum(["USER", "ADMIN"]),
  phoneNumber: z.string().optional(),
  profileImageUrl: z.string().url("Invalid URL").or(z.literal("")).optional(),
});

export type UserFormData = z.infer<typeof userSchema>;
