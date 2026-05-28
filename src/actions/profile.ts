"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { createLinkOrderSchema, createProfileSchema } from "@/lib/schemas";

export type ProfileState = {
  errors?: {
    name?: string[];
    currentPassword?: string[];
    newPassword?: string[];
    confirmPassword?: string[];
    image?: string[];
  };
  message?: string;
  success?: boolean;
};
export type LinkOrderState = {
  errors?: {
    orderId?: string[];
    phone?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function updateProfile(
  imageUrl: string | null,
  _prevState: ProfileState | undefined,
  formData: FormData,
): Promise<ProfileState | undefined> {
  const t = await getTranslations("ProfilePage.ProfileForm.Errors");
  const session = await auth();

  if (!session?.user?.email) {
    return { message: t("unauthorized") };
  }

  const ProfileSchema = createProfileSchema(t);

  const formValues = Object.fromEntries(formData.entries());
  const validatedFields = ProfileSchema.safeParse({
    ...formValues,
    image: imageUrl,
  });

  if (!validatedFields.success) {
    const flattened = validatedFields.error.flatten();
    return {
      errors: flattened.fieldErrors,
      message: t("invalidData"),
    };
  }

  const { name, image, currentPassword, newPassword } = validatedFields.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!existingUser) {
      return { message: t("userNotFound") };
    }

    const dataToUpdate: { name: string; image?: string; password?: string } = {
      name,
    };

    if (image) {
      dataToUpdate.image = image;
    }

    if (newPassword && currentPassword) {
      if (!existingUser.password) {
        return { message: t("noPasswordSetOAuth") };
      }
      const passwordsMatch = await bcrypt.compare(
        currentPassword,
        existingUser.password,
      );

      if (!passwordsMatch) {
        return {
          errors: { currentPassword: [t("wrongCurrentPassword")] },
          message: t("invalidData"),
        };
      }
      dataToUpdate.password = await bcrypt.hash(newPassword, 10);
    }

    await prisma.user.update({
      where: { id: existingUser.id },
      data: dataToUpdate,
    });

    const locale = await getLocale();
    revalidatePath(`/${locale}/profile`);

    return {
      success: true,
      message: t("profileUpdated"),
    };
  } catch {
    return {
      message: t("defaultError"),
    };
  }
}
export async function linkGuestOrder(
  _prevState: LinkOrderState | undefined,
  formData: FormData,
): Promise<LinkOrderState | undefined> {
  const t = await getTranslations("ProfilePage.LinkOrder.Errors");
  const session = await auth();

  if (!session?.user?.id) {
    return { message: t("unauthorized") };
  }

  const LinkOrderSchema = createLinkOrderSchema(t);
  const formValues = Object.fromEntries(formData.entries());
  const validatedFields = LinkOrderSchema.safeParse(formValues);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: t("invalidData"),
    };
  }

  const { orderId, phone } = validatedFields.data;

  const cleanOrderId = orderId.replace("#", "").trim().toLowerCase();

  try {
    const order = await prisma.order.findFirst({
      where: {
        id: { endsWith: cleanOrderId },
        phone: phone,
      },
    });

    if (!order) {
      return { message: t("notFound") };
    }

    if (order.userId === session.user.id) {
      return { message: t("alreadyLinked") };
    }

    if (order.userId !== null) {
      return { message: t("notFound") };
    }
    await prisma.order.update({
      where: { id: order.id },
      data: { userId: session.user.id },
    });

    const locale = await getLocale();
    revalidatePath(`/${locale}/profile/history`);

    return {
      success: true,
    };
  } catch {
    return { message: t("defaultError") };
  }
}
