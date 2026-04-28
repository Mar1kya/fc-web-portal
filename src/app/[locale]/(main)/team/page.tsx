import { getTranslations } from "next-intl/server";
import TeamTabs from "./_components/team-tabs";
import H1 from "@/components/ui/heading";
import RosterList from "./_components/roster-list";

export default async function TeamPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ [key: string]: string | string[] | undefined }>; }) {
    const { locale } = await params;
    const resolvedSearchParams = await searchParams;
    const tEnums = await getTranslations("Enums");
    const currentContext = (resolvedSearchParams.context as string) || "MAIN_TEAM";
    const pageTitle = tEnums(`TeamContext.${currentContext}`);

    return (
        <section className="container mx-auto">
            <div className="flex flex-col gap-6 mb-8">
                <H1>{pageTitle}</H1>
                <TeamTabs />
            </div>
            <RosterList searchParams={resolvedSearchParams} locale={locale} />
        </section>
    );
}