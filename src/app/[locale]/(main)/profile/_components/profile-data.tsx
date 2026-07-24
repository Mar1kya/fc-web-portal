import { prisma } from "@/lib/prisma";
import ProfileForm from "./profile-form";
import { redirect } from "@/i18n/navigation";

export async function ProfileData({ email, locale }: { email: string; locale: string }) {
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        return redirect({ locale, href: "/login" });
    }

    const userField = {
        name: user.name,
        email: user.email,
        image: user.image,
    };

    return <ProfileForm user={userField} />;
}