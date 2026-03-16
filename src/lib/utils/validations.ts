import { z } from "zod";

export const zEmail = (errorMessage?: string) =>
  z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: errorMessage,
  });

export const zPassword = (errorMessage?: string) =>
  z
    .string()
    .min(8, { message: errorMessage })
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, {
      message: errorMessage,
    });

export const zPhone = (errorMessage?: string) =>
  z.string().regex(/^\+?[1-9]\d{7,14}$/, { message: errorMessage });
