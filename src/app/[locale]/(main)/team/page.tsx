import TeamTabs from "./_components/team-tabs";
import H1 from "@/components/ui/heading";
import { getTranslations } from "next-intl/server";

export default async function TeamPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const tEnums = await getTranslations("Enums");
    const resolvedSearchParams = await searchParams;
    const contextParam = typeof resolvedSearchParams.context === 'string' ? resolvedSearchParams.context : undefined;
    const currentContext = contextParam || "MAIN_TEAM";
    const pageTitle = tEnums(`TeamContext.${currentContext}`);

    return (
        <section className="container mx-auto">
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex justify-between items-end">
                    <H1>{pageTitle}</H1>
                </div>
                <TeamTabs />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-xl bg-card/50">

                </div>
            </div>
        </section>
    );
}