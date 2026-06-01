import z from "zod";
import { zEmail, zPassword, zPhone } from "./utils/validations";
import { MIN_NAME_LENGTH, MIN_PASSWORD_LENGTH } from "./constants";
import { PostType, TeamContext } from "../../generated/prisma";

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

export const createCheckoutSchema = (
  t: (key: string, values?: Record<string, string | number>) => string,
) =>
  z.object({
    firstName: z.string().min(2, t("tooShort")),
    lastName: z.string().min(2, t("tooShort")),
    email: zEmail(t("invalidEmail")),
    phone: zPhone(t("invalidPhone")),
    city: z.string().min(2, t("tooShort")),
    postalCode: z.string().optional(),
    address: z.string().optional(),
  });
export const createLinkOrderSchema = (
  t: (key: string, values?: Record<string, string | number>) => string,
) => {
  return z.object({
    orderId: z.string().min(1, t("orderIdRequired")),
    phone: zPhone(t("phoneRequired")),
  });
};

export const createPostSchema = z.object({
  title_uk: z.string().min(3, "Заголовок має містити мінімум 3 символи"),
  description_uk: z.string().optional(),
  content_uk: z.string().min(10, "Текст новини занадто короткий"),
  title_en: z.string().optional(),
  description_en: z.string().optional(),
  content_en: z.string().optional(),
  type: z.nativeEnum(PostType),
  teamContext: z.nativeEnum(TeamContext),
  isPublished: z.boolean().default(true),
  publishedAt: z.date().optional(),
  mentionedPlayers: z.array(z.string()).optional(),
  mentionedCoaches: z.array(z.string()).optional(),
  relatedMatches: z.array(z.string()).optional(),
  mediaUrls: z.array(z.string()).optional(),
});