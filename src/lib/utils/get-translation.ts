interface TranslatableEntity<T> {
  translations: (T & { language: string })[];
}
export function getTranslation<T>(
  entity: TranslatableEntity<T> | null | undefined, 
  locale: string, 
  defaultLocale = "uk"
): T | null {
  if (!entity || !entity.translations) return null;
  const translation = entity.translations.find((t) => t.language === locale);

  if (translation) return translation;
  const fallback = entity.translations.find((t) => t.language === defaultLocale);
  
  if (fallback) return fallback;

  return entity.translations[0] || null;
}