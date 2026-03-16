import z from "zod";
import { zEmail } from "./utils/validations";

export const SignInSchema = z.object({
  email: zEmail(),
  password: z.string(),
});