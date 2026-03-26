import H1 from "@/components/ui/heading"
import ProfileForm from "./_components/profile-form"
import { getTranslations } from "next-intl/server"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "ProfilePage.Metadata" });
    return {
        title: t("title"),
        description: t("description")
    }

}

export default async function ProfilePage() {
    const t = await getTranslations("ProfilePage")
    return <>
        <H1 className="pb-6 text-center lg:text-left">{t("title")}</H1>
        <ProfileForm />
    </>
}