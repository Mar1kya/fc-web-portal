import z from "zod";
import { zEmail, zPassword, zPhone } from "./utils/validations";
import { MIN_NAME_LENGTH, MIN_PASSWORD_LENGTH } from "./constants";
import {
  EventType,
  MatchStatus,
  PlayerPosition,
  PostType,
  TeamContext,
} from "../../generated/prisma";

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

export const createPlayerSchema = z.object({
  name_uk: z.string().min(2, "Ім'я обов'язкове"),
  bio_uk: z.string().optional(),
  name_en: z.string().optional(),
  bio_en: z.string().optional(),
  number: z.coerce
    .number()
    .min(1, "Номер має бути більше 0")
    .max(99, "Номер має бути до 99"),
  position: z.nativeEnum(PlayerPosition),
  teamContext: z.nativeEnum(TeamContext),
  avatarUrl: z.string().optional(),
  isManualAvatar: z.boolean().default(false),
  mediaUrls: z.array(z.string()).default([]),
  birthDate: z.coerce.date().optional(),
  height: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  nationality: z.string().max(10).optional(),
  initialMatches: z.coerce.number().default(0),
  initialGoals: z.coerce.number().default(0),
  initialAssists: z.coerce.number().default(0),
  initialCleanSheets: z.coerce.number().default(0),
  initialGoalsConceded: z.coerce.number().default(0),
});

export const createCoachSchema = z.object({
  name_uk: z.string().min(2, "Ім'я обов'язкове"),
  role_uk: z.string().min(2, "Посада обов'язкова"),
  bio_uk: z.string().optional(),
  name_en: z.string().optional(),
  role_en: z.string().optional(),
  bio_en: z.string().optional(),
  teamContext: z.nativeEnum(TeamContext),
  avatarUrl: z.string().optional(),
  mediaUrls: z.array(z.string()).default([]),
  birthDate: z.coerce.date().optional(),
  nationality: z.string().max(10).optional(),
});

export const seasonSchema = z
  .object({
    name: z.string().min(4, "Назва обов'язкова (наприклад: 2025/2026)"),
    sofascoreId: z.coerce.number().nullable().optional(),
    startDate: z
      .string({ required_error: "Оберіть дату початку" })
      .min(1, "Оберіть дату початку")
      .transform((str) => new Date(str)),
    endDate: z
      .string({ required_error: "Оберіть дату завершення" })
      .min(1, "Оберіть дату завершення")
      .transform((str) => new Date(str)),

    isActive: z.boolean().default(false),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "Дата завершення не може бути раніше дати початку",
    path: ["endDate"],
  });

export const tournamentSchema = z.object({
  name_uk: z.string().min(2, "Назва українською обов'язкова"),
  name_en: z.string().min(2, "Назва англійською обов'язкова"),
  sofascoreId: z.coerce.number().nullable().optional(),
  hasStandings: z.boolean().default(false),
});

export const dictionarySchema = z.object({
  name_uk: z.string().min(1, "Назва українською обов'язкова"),
  name_en: z.string().min(1, "Назва англійською обов'язкова"),
});

export const opponentSchema = z.object({
  name_uk: z.string().min(1, "Назва українською обов'язкова"),
  name_en: z.string().min(1, "Назва англійською обов'язкова"),
  sofascoreId: z.number().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
});

export const createManualMatchSchema = z.object({
  seasonId: z.string().min(1, "Оберіть сезон"),
  tournamentId: z.string().min(1, "Оберіть турнір"),
  opponentId: z.string().min(1, "Оберіть суперника"),
  date: z.date({ required_error: "Вкажіть дату матчу" }),
  isHomeGame: z.boolean(),
  teamContext: z.nativeEnum(TeamContext),
  stadium: z.string().optional(),
  homeCoachName: z.string().optional(),
  awayCoachName: z.string().optional(),
  round: z.coerce.number().optional(),
});

const lineupSchema = z.object({
  playerId: z.string(),
  isStarter: z.boolean().default(false),
  played: z.boolean().default(false),
});

const eventSchema = z.object({
  type: z.nativeEnum(EventType),
  minute: z.number().min(1).max(130),
  playerId: z.string().optional().nullable(),
  customPlayerName: z.string().optional().nullable(),
  isOpponent: z.boolean().default(false),
});

export const updateMatchSchema = z.object({
  seasonId: z.string().min(1, "Оберіть сезон"),
  tournamentId: z.string().min(1, "Оберіть турнір"),
  opponentId: z.string().min(1, "Оберіть суперника"),
  date: z.coerce.date({
    required_error: "Вкажіть дату матчу",
    invalid_type_error: "Невірна дата",
  }),
  isHomeGame: z.boolean(),
  teamContext: z.nativeEnum(TeamContext),
  status: z.nativeEnum(MatchStatus),
  round: z.coerce.number().optional().nullable(),
  homeScore: z.coerce.number().optional().nullable(),
  awayScore: z.coerce.number().optional().nullable(),
  stadium: z.string().optional().nullable(),
  homeCoachName: z.string().optional().nullable(),
  awayCoachName: z.string().optional().nullable(),
  highlightsUrl: z
    .string()
    .url("Невірний формат URL")
    .optional()
    .nullable()
    .or(z.literal("")),
  postMatchUrl: z
    .string()
    .url("Невірний формат URL")
    .optional()
    .nullable()
    .or(z.literal("")),
  emeraldGangLineup: z.array(lineupSchema).optional(),
  events: z.array(eventSchema).optional(),
});

export const createGallerySchema = z.object({
    title_uk: z.string().min(1, "Введіть назву галереї українською"),
    title_en: z.string().optional(),
    coverUrl: z.string().url("Некоректне посилання на обкладинку"),
    mediaUrls: z.array(z.string().url("Некоректне посилання на медіа")).min(1, "Додайте хоча б одне фото/відео"),
    matchId: z.string().optional().nullable(),
    publishedAt: z.coerce.date().optional(),
});