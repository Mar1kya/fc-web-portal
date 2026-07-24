import { getTranslations } from "next-intl/server";
import TeamTabs from "./_components/team-tabs";
import H1 from "@/components/ui/heading";
import RosterList from "./_components/roster-list";
import { TeamContext, PlayerPosition } from "../../../../../generated/prisma";
import { Suspense } from "react";
import RosterListSkeleton from "./_components/roster-list-skeleton";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const resolvedSearchParams = await searchParams;
    const tMeta = await getTranslations("TeamPage.Metadata");
    const tEnums = await getTranslations("Enums");
    const rawContext = typeof resolvedSearchParams.context === 'string' ? resolvedSearchParams.context : undefined;
    const currentContext = rawContext && Object.values(TeamContext).includes(rawContext as TeamContext)
        ? rawContext
        : "MAIN_TEAM";

    const teamName = tEnums(`TeamContext.${currentContext}`);
    const rawPos = typeof resolvedSearchParams.pos === 'string' ? resolvedSearchParams.pos : "all";

    let tabName = "";

    if (rawPos === "COACH") {
        tabName = tMeta("staffTab");
    } else if (Object.values(PlayerPosition).includes(rawPos as PlayerPosition)) {
        tabName = tEnums(`PlayerPosition.${rawPos}`);
    } else {
        tabName = "";
    }
    const pageTitle = tabName ? `${tabName} | ${teamName}` : `${teamName} | ${tMeta("roster")}`;
    const pageDescription = tabName
        ? tMeta("dynamicDescription", { team: teamName, category: tabName.toLowerCase() })
        : tMeta("description", { team: teamName });

    const canonicalUrl = currentContext === "MAIN_TEAM"
        ? "/team"
        : `/team?context=${currentContext}`;

    return {
        title: pageTitle,
        description: pageDescription,
        alternatives: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: pageTitle,
            description: pageDescription,
            images: [
                {
                    url: "/images/team.jpg",
                    width: 1200,
                    height: 630,
                    alt: pageTitle,
                }
            ],
            type: "website",
        },
    };
}

export default async function TeamPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ [key: string]: string | string[] | undefined }>; }) {
    const { locale } = await params;
    const resolvedSearchParams = await searchParams;
    const tEnums = await getTranslations("Enums");
    const rawContext = typeof resolvedSearchParams.context === 'string' ? resolvedSearchParams.context : undefined;
    const currentContext = rawContext && Object.values(TeamContext).includes(rawContext as TeamContext)
        ? rawContext
        : "MAIN_TEAM";

    const pageTitle = tEnums(`TeamContext.${currentContext}`);

    return (
        <>
            <div className="flex flex-col gap-6 mb-8">
                <H1>{pageTitle}</H1>
                <TeamTabs />
            </div>
            <Suspense key={JSON.stringify(resolvedSearchParams)} fallback={<RosterListSkeleton />}>
                <RosterList searchParams={resolvedSearchParams} locale={locale} />
            </Suspense>
        </>
    );
}