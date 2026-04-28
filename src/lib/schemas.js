import { z } from "zod";

// Password security requirements
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");

export const signUpSchema = z.object({
  username: z.string().min(2, "Username is too short").max(50, "Username is too long"),
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
  username: z.string().min(2, "Username is too short"),
});

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"), // ISO 8601 datetime
  location: z.string().min(1, "Location is required"),
  maxAttendance: z.coerce.number().min(1, "Must be at least 1"),
  eventStatus: z.enum(["SCHEDULED", "COMPLETED", "CANCELED"]),
  paymentRequired: z.boolean(),
  price: z.coerce.number().min(0).optional(), // required if paymentRequired
  organizerId: z.coerce.number().optional(),
  categoryId: z.coerce.number(),
});

export const organizerSchema = z.object({
  username: z.string().min(2, "Username is too short").max(50, "Username is too long"),
  email: z.string().email("Invalid email"),
  password: passwordSchema,
});

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});