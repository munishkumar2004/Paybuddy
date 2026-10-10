import { z } from "zod";

// ─── Phone: Indian mobile number ───
export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number");

// ─── Signup validation ───
export const signupSchema = z.object({
  name: z.string().min(2, "Name too short"),
  phone: phoneSchema,
  pin: z.string().length(4).regex(/^\d+$/, "PIN must be 4 digits"),
});

// ─── Login validation ───
export const loginSchema = z.object({
  phone: phoneSchema,
  pin: z.string().length(4),
});

// ─── Send money validation ───
export const sendMoneySchema = z.object({
  toPhone: phoneSchema,
  amount: z.number().positive().max(10000, "Max ₹10,000 per transaction"),
  note: z.string().max(100, "Note too long").optional(),
  pin: z.string().length(4),
});

// ─── TypeScript types ───
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SendMoneyInput = z.infer<typeof sendMoneySchema>;