import RegisterForm from "@/components/auth/register-form"
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "RegisterPage.Metadata" })
  return {
    title: t("title"),
    description: t("description")
  }
}

export default function RegisterPage() {
  return (
    <RegisterForm />
  )
}
