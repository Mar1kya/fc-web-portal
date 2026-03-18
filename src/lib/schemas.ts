import z from "zod";
import { zEmail, zPassword } from "./utils/validations";

export const SignInSchema = z.object({
  email: zEmail(),
  password: z.string(),
});

export const createAuthSchema = (
  t: (key: string, values?: Record<string, string | number>) => string,
) =>
  z.object({
    email: zEmail(t("invalidEmail")),
    password: zPassword(t("weakPassword")),
  });
