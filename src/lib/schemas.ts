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

export const createProfileSchema = (
  t: (key: string, values?: Record<string, string | number>) => string,
) => {
  return z
    .object({
      name: z.string().min(MIN_NAME_LENGTH, t("nameTooShort")),
      image: z.string().nullish(),
      currentPassword: z.string().optional(),
      newPassword: z.preprocess(
        (val) => (val === "" ? undefined : val),
        zPassword(t("weakPassword", { min: MIN_PASSWORD_LENGTH })).optional(),
      ),
      confirmPassword: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.newPassword && !data.currentPassword) {
          return false;
        }
        return true;
      },
      {
        message: t("currentPasswordRequired"),
        path: ["currentPassword"],
      },
    )
    .refine(
      (data) => {
        if (data.newPassword && data.newPassword !== data.confirmPassword) {
          return false;
        }
        return true;
      },
      {
        message: t("passwordsDoNotMatch"),
        path: ["confirmPassword"],
      },
    );
};
