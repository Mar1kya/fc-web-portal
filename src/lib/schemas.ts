import z from "zod";
import { zEmail, zPassword } from "./utils/validations";
import { MIN_NAME_LENGTH, MIN_PASSWORD_LENGTH } from "./constants";

export const SignInSchema = z.object({
  email: zEmail(),
  password: z.string(),
});

export const createLoginSchema = (
  t: (key: string, values?: Record<string, string | number>) => string,
) =>
  z.object({
    email: zEmail(t("invalidEmail")),
    password: zPassword(t("weakPassword", { min: MIN_PASSWORD_LENGTH })),
  });

export const createRegisterSchema = (
  t: (key: string, values?: Record<string, string | number>) => string,
) =>
  z.object({
    name: z.string().min(MIN_NAME_LENGTH, {
      message: t("invalidName", { min: MIN_NAME_LENGTH }),
    }),
    email: zEmail(t("invalidEmail")),
    password: zPassword(t("weakPassword", { min: MIN_PASSWORD_LENGTH })),
  });
