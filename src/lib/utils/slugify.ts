import slugify from "slugify";

export function generateSlug(text: string): string {
  const baseSlug = slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });

  return `${baseSlug}-${Date.now().toString().slice(-6)}`;
}
export function generatePlayerSlug(name: string, number: number): string {
  const baseSlug = slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });

  return `${baseSlug}-${number}`;
}