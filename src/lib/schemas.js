import { z } from "zod";

// Password security requirements
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");

export const signUpSchema = z.object({
  name: z.string().min(2, "Name is too short").max(50, "Name is too long"),
  email: z.string().email("Please enter a valid business email"),
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
});