import H1 from "@/components/ui/heading"
import ProfileForm from "./_components/profile-form"
import { getLocale, getTranslations } from "next-intl/server"
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";
import { Suspense } from "react";
import { ProfileData } from "./_components/profile-data";
import ProfileFormSkeleton from "./_components/profile-form-skeleton";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "ProfilePage.Metadata" });
    return {
        title: t("title"),
        description: t("description")
    }
}

export default async function ProfilePage() {
    const t = await getTranslations("ProfilePage");
    const locale = await getLocale();
    const session = await auth();

    if (!session?.user) {
        return redirect({ locale, href: "/login" });
    }

    return (
        <>
            <H1 className="pb-6 text-center lg:text-left">{t("title")}</H1>
            <Suspense fallback={<ProfileFormSkeleton />}>
                <ProfileData email={session.user.email!} locale={locale} />
            </Suspense>
        </>
    );
}