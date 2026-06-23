import { email, z } from "zod";

export const singupPayloadModel = z.object({
  firstName: z.string().min(2),
  lastName: z.string().nullable().optional(),
  email: z.email(),
  password: z.string().min(6),
});
