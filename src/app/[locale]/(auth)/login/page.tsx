import LoginForm from "@/components/auth/login-form"
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LoginPage.Metadata" })
  return {
    title: t("title"),
    description: t("description")
  }
}

export default function LoginPage() {
  return (
    <LoginForm />
  )
}
