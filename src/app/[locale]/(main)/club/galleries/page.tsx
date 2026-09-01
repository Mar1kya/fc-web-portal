import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { Suspense } from "react";
import H1 from "@/components/ui/heading";
import Galleries from "./_components/galleries";
import GalleriesSkeleton from "./_components/galleries-skeleton";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("GalleriesPage.Metadata");

    return {
        title: t("title"),
        description: t("description"),
        openGraph: {
            title: t("title"),
            description: t("description"),
            type: "website",
            url: "/club/galleries",
        },
    };
}


export default async function GalleriesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const t = await getTranslations("GalleriesPage");
    const resolvedSearchParams = await searchParams;

    return (
        <>
            <div className="flex justify-between items-end mb-8 border-b pb-4 border-border">
                <H1>{t("title")}</H1>
            </div>
            <Suspense fallback={<GalleriesSkeleton />}>
                <Galleries searchParams={resolvedSearchParams} />
            </Suspense>
        </>
    );
}