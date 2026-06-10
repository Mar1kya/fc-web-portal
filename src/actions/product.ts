"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { LOCALES } from "@/lib/constants";
import { productSchema } from "@/lib/schemas";
import { z } from "zod";
import slugify from "slugify";

function revalidateProductPaths(slug?: string) {
  LOCALES.forEach((locale) => {
    revalidatePath(`/${locale}/admin/shop/products`);
    revalidatePath(`/${locale}/shop`, "layout");
    revalidatePath(`/${locale}/admin`);
    if (slug) revalidatePath(`/${locale}/shop/${slug}`);
  });
}

export type BoundProductData = z.infer<typeof productSchema>;

export type ProductFormState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function softDeleteProduct(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN")
    return { success: false, message: "Немає прав" };

  try {
    await prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isArchived: true,
      },
    });

    revalidateProductPaths();
    return { success: true, message: "Товар переміщено в архів" };
  } catch {
    return { success: false, message: "Помилка архівації товару" };
  }
}

export async function restoreProduct(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    await prisma.product.update({
      where: { id },
      data: {
        deletedAt: null,
        isArchived: false,
      },
    });

    revalidateProductPaths();
    return { success: true, message: "Товар успішно відновлено!" };
  } catch {
    return { success: false, message: "Помилка відновлення товару" };
  }
}

export async function hardDeleteProduct(id: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { success: false, message: "Немає прав" };
  }

  try {
    await prisma.product.delete({ where: { id } });

    revalidateProductPaths();
    return {
      success: true,
      message: "Товар остаточно видалено з бази даних!",
    };
  } catch (error) {
    console.error("Hard delete product error:", error);
    return {
      success: false,
      message:
        "Не вдалося видалити товар. Можливо, він прив'язаний до існуючих замовлень.",
    };
  }
}

export async function createProduct(
  boundData: BoundProductData,
  _prevState: ProductFormState | undefined,
  _formData: FormData,
): Promise<ProductFormState | undefined> {
  const session = await auth();

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { message: "Немає прав для виконання цієї дії" };
  }

  try {
    const validatedFields = productSchema.safeParse(boundData);

    if (!validatedFields.success) {
      const flattened = validatedFields.error.flatten();
      return {
        errors: flattened.fieldErrors,
        message: "Перевірте правильність заповнення полів форми",
      };
    }

    const data = validatedFields.data;
    const baseSlug = slugify(data.name_en, { lower: true, strict: true });
    const randomString = Math.random().toString(36).substring(2, 6);
    const slug = `${baseSlug}-${randomString}`;

    if (data.isOnSale && (!data.salePrice || data.salePrice >= data.price)) {
      return {
        message: "Акційна ціна повинна бути меншою за звичайну ціну",
        errors: { salePrice: ["Некоректна акційна ціна"] },
      };
    }

    await prisma.product.create({
      data: {
        slug,
        price: data.price,
        salePrice: data.salePrice,
        isOnSale: data.isOnSale,
        isFeatured: data.isFeatured,
        isArchived: data.isArchived,
        demographic: data.demographic,
        color: data.color || null,
        apparelType: data.apparelType || null,
        seasonYear: data.seasonYear || null,
        matchType: data.matchType || null,

        category: {
          connect: { id: data.categoryId },
        },
        translations: {
          create: [
            {
              language: "uk",
              name: data.name_uk,
              description: data.description_uk,
            },
            {
              language: "en",
              name: data.name_en,
              description: data.description_en,
            },
          ],
        },
        variants: {
          create: data.variants.map((variant, index) => ({
            size: variant.size,
            stock: variant.stock,
            sku: variant.sku || null,
            position: index,
          })),
        },
        media:
          data.mediaUrls && data.mediaUrls.length > 0
            ? {
                create: data.mediaUrls.map((url) => ({
                  url,
                  type: "IMAGE",
                })),
              }
            : undefined,
        relatedPlayers:
          data.relatedPlayerIds && data.relatedPlayerIds.length > 0
            ? {
                connect: data.relatedPlayerIds.map((id) => ({ id })),
              }
            : undefined,
      },
    });

    revalidateProductPaths(slug);

    return {
      success: true,
      message: "Товар успішно додано до каталогу!",
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      message: "Сталася системна помилка при створенні товару",
    };
  }
}
export async function updateProduct(
  id: string,
  boundData: BoundProductData,
  _prevState: ProductFormState | undefined,
  _formData: FormData,
): Promise<ProductFormState | undefined> {
  const session = await auth();

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return { message: "Немає прав для виконання цієї дії" };
  }

  try {
    const validatedFields = productSchema.safeParse(boundData);

    if (!validatedFields.success) {
      const flattened = validatedFields.error.flatten();
      return {
        errors: flattened.fieldErrors,
        message: "Перевірте правильність заповнення полів форми",
      };
    }

    const data = validatedFields.data;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { slug: true },
    });

    if (!existingProduct) {
      return { message: "Товар не знайдено в базі даних" };
    }

    if (data.isOnSale && (!data.salePrice || data.salePrice >= data.price)) {
      return {
        message: "Акційна ціна повинна бути меншою за звичайну ціну",
        errors: { salePrice: ["Некоректна акційна ціна"] },
      };
    }

    const slug = existingProduct.slug;

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          price: data.price,
          salePrice: data.isOnSale ? data.salePrice : null,
          isOnSale: data.isOnSale,
          isFeatured: data.isFeatured,
          isArchived: data.isArchived,
          demographic: data.demographic,
          color: data.color || null,
          apparelType: data.apparelType || null,
          seasonYear: data.seasonYear || null,
          matchType: data.matchType || null,
          category: {
            connect: { id: data.categoryId },
          },
          relatedPlayers: {
            set: data.relatedPlayerIds?.map((pId) => ({ id: pId })) ?? [],
          },
        },
      });

      await tx.productTranslation.deleteMany({ where: { productId: id } });
      await tx.productTranslation.createMany({
        data: [
          {
            productId: id,
            language: "uk",
            name: data.name_uk,
            description: data.description_uk,
          },
          {
            productId: id,
            language: "en",
            name: data.name_en,
            description: data.description_en,
          },
        ],
      });

      const mediaUrls = data.mediaUrls ?? [];

      const existingMedia =
        mediaUrls.length > 0
          ? await tx.media.findMany({
              where: { url: { in: mediaUrls } },
              select: { id: true, url: true },
            })
          : [];

      const existingUrls = new Set(existingMedia.map((m) => m.url));

      const newUrlsToCreate = mediaUrls.filter((url) => !existingUrls.has(url));

      const createdMedia =
        newUrlsToCreate.length > 0
          ? await Promise.all(
              newUrlsToCreate.map((url) =>
                tx.media.create({
                  data: { url, type: "IMAGE" },
                  select: { id: true },
                }),
              ),
            )
          : [];

      await tx.product.update({
        where: { id },
        data: {
          media: {
            set: [
              ...existingMedia.map((m) => ({ id: m.id })),
              ...createdMedia.map((m) => ({ id: m.id })),
            ],
          },
        },
      });

      const incomingSizes = data.variants.map((v) =>
        v.size.toUpperCase().trim(),
      );

      await tx.productVariant.deleteMany({
        where: {
          productId: id,
          size: { notIn: incomingSizes },
        },
      });

      for (const [index, variant] of data.variants.entries()) {
        const normalizedSize = variant.size.toUpperCase().trim();

        await tx.productVariant.upsert({
          where: {
            productId_size: { productId: id, size: normalizedSize },
          },
          update: {
            stock: variant.stock,
            sku: variant.sku || null,
            position: index,
          },
          create: {
            productId: id,
            size: normalizedSize,
            stock: variant.stock,
            sku: variant.sku || null,
            position: index,
          },
        });
      }
    });

    revalidateProductPaths(slug);

    return {
      success: true,
      message: "Товар успішно оновлено!",
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      message: "Сталася системна помилка при оновленні товару",
    };
  }
}
