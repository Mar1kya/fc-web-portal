import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTranslation } from "@/lib/utils/get-translation";
import { getLocale, getTranslations } from "next-intl/server";
import sanitizeHtml from 'sanitize-html';
import NewsGrid from "@/components/shared/news-grid";
import MediaGallery from "@/components/shared/media-gallery";
import ProfileTabs from "../../_components/profile-tabs";
import StaffHero from "../_components/staff-hero";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const locale = await getLocale();
    const tMeta = await getTranslations("StaffProfile.Metadata");

    const coach = await prisma.coach.findUnique({
        where: { slug, deletedAt: null },
        include: { translations: true },
    });

    if (!coach) {
        return {}
    }

    const translation = getTranslation(coach, locale);
    const staffName = translation?.name || (locale === "uk" ? "Без назви" : "Untitled");
    const staffRole = translation?.role || (locale === "uk" ? "Персонал" : "Staff");
    const pageTitle = `${staffName} | ${staffRole}`;
    const pageDescription = tMeta("description", { name: staffName, role: staffRole.toLowerCase() });
    const imageUrl = coach.avatar ? coach.avatar : "/images/team.jpg";

    return {
        title: pageTitle,
        description: pageDescription,
        openGraph: {
            title: pageTitle,
            description: pageDescription,
            images: [
                {
                    url: imageUrl,
                    width: 800,
                    height: 800,
                    alt: staffName,
                }
            ],
            type: "profile",
        },
    };
}

export default async function StaffProfilePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const locale = await getLocale()
    const t = await getTranslations("ProfileTabs");

    const coach = await prisma.coach.findUnique({
        where: { slug, deletedAt: null },
        include: {
            translations: true,
            mentionedInPosts: {
                where: { deletedAt: null },
                include: { translations: true, media: true },
                orderBy: { publishedAt: "desc" }
            },
            media: {
                where: { deletedAt: null },
            }
        },
    });

    if (!coach) {
        notFound();
    }

    const translation = getTranslation(coach, locale);
    let cleanBio = null;
    if (translation?.bio) {
        cleanBio = sanitizeHtml(translation.bio, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
            allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                'img': ['src', 'alt', 'width', 'height']
            }
        });
    }

    return (
        <div className="container mx-auto py-8">
            <StaffHero coach={coach} />
            <ProfileTabs
                bioContent={
                    cleanBio ? (
                        <article
                            className="prose prose-emerald dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: cleanBio }}
                        />
                    ) : (
                        <p className="text-muted-foreground">{t("emptyBio")}</p>
                    )
                }
                newsContent={
                    coach.mentionedInPosts.length > 0 ? (
                        <NewsGrid posts={coach.mentionedInPosts} />
                    ) : (
                        <p className="text-muted-foreground">{t("emptyNews")}</p>
                    )
                }
                mediaContent={
                    coach.media.length > 0 ? (
                        <MediaGallery media={coach.media} />
                    ) : (
                        <p className="text-muted-foreground">{t("emptyMedia")}</p>
                    )
                }
            />
        </div>
    );
}