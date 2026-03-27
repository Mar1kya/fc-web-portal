"use server";

import { createLoginSchema, createRegisterSchema } from "@/lib/schemas";
import { getLocale, getTranslations } from "next-intl/server";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export type LoginState = {
  errors?: {
    email?: string[];
    password?: string[];
  };
  message?: string | null;
};

export type RegisterState = {
  errors?: {
    name?: string[];
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

  const LoginSchema = createLoginSchema(t);
  const validatedFields = LoginSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validatedFields.success) {
    const flattened = validatedFields.error.flatten();
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

export async function register(
  _prevState: RegisterState | undefined,
  formData: FormData,
): Promise<RegisterState | undefined> {
  const t = await getTranslations("Auth.RegisterErrors");
  const locale = await getLocale();

  const RegisterSchema = createRegisterSchema(t);
  const validatedFields = RegisterSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validatedFields.success) {
    const flattened = validatedFields.error.flatten();
    return {
      errors: flattened.fieldErrors,
      message: t("invalidData"),
    };
  }
  const { name, email, password } = validatedFields.data;
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      return {
        message: t("emailInUse"),
      };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
  } catch {
    return {
      message: t("defaultError"),
    };
  }
  redirect({ href: "/login", locale: locale });
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/profile" });
}
