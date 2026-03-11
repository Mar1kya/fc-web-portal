import { getTranslations } from "next-intl/server"

export default async function HomePage() {
  const t = await getTranslations("HomePage");

  return (
    <div>
      {t('title')}
    </div>)
}
