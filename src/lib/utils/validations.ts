import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "../constants";

export const zEmail = (errorMessage?: string) =>
  z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: errorMessage,
  });

export const zPassword = (errorMessage?: string) =>
  z
    .string()
    .min(MIN_PASSWORD_LENGTH, { message: errorMessage })
    .regex(
      new RegExp(
        `^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*?&]{${MIN_PASSWORD_LENGTH},}$`,
      ),
      {
        message: errorMessage,
      },
    );

export const zPhone = (errorMessage?: string) =>
  z.string().regex(/^\+?[1-9]\d{7,14}$/, { message: errorMessage });
