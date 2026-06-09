import slugify from "slugify";

const createBaseSlug = (text: string) => {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
    locale: "uk",
  });
};

export function generateSlug(text: string): string {
  const baseSlug = createBaseSlug(text);
  return `${baseSlug}-${Date.now().toString(36)}`;
}

export function generatePlayerSlug(name: string, number: number): string {
  const baseSlug = createBaseSlug(name);
  return `${baseSlug}-${number}`;
}

export function generateGallerySlug(
  titleEn?: string | null,
  titleUk?: string | null,
): string {
  let textToSlugify = "gallery";

  if (titleEn && titleEn.trim() !== "") {
    textToSlugify = titleEn;
  } else if (titleUk && titleUk.trim() !== "") {
    textToSlugify = titleUk;
  }

  const baseSlug = createBaseSlug(textToSlugify);
  const finalBase = baseSlug || "gallery";

  return `${finalBase}-${Date.now().toString(36)}`;
}
