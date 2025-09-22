import { z } from "zod";

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const fastLoginSchema = z.object({
  token: z.string(),
});
