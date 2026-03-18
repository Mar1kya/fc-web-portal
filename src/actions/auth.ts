"use server";

import { z } from "zod";
import { createAuthSchema } from "@/lib/schemas";
import { getLocale, getTranslations } from "next-intl/server";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "@/i18n/navigation";

export type LoginState = {
  errors?: {
    email?: string[];
    password?: string[];
  };
  message?: string | null;
};

export async function login(
  _prevState: LoginState | undefined,
  formData: FormData,
): Promise<LoginState | undefined> {
  const t = await getTranslations("Auth.LoginErrors");
  const locale = await getLocale();

  const LoginSchema = createAuthSchema(t);
  const validatedFields = LoginSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validatedFields.success) {
    const flattened = z.flattenError(validatedFields.error);
    return {
      errors: flattened.fieldErrors,
      message: t("invalidData"),
    };
  }
  const { email, password } = validatedFields.data;
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { message: t("invalidCredentials") };
        default:
          return { message: t("defaultError") };
      }
    }
    throw error;
  }
  redirect({ href: "/", locale: locale });
}
