import LatestNews from "./_components/latest-news";
import { getLocale, getTranslations } from "next-intl/server"; 

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const resolvedSearchParams = await searchParams;
    const locale = await getLocale(); 
    const tNews = await getTranslations("NewsPage.Metadata");
    const tEnums = await getTranslations("Enums");
    const typeFilter = typeof resolvedSearchParams.type === 'string' ? resolvedSearchParams.type : undefined;
    const teamFilter = typeof resolvedSearchParams.team === 'string' ? resolvedSearchParams.team : undefined;
    const dateParam = typeof resolvedSearchParams.date === 'string' ? resolvedSearchParams.date : undefined;

    let pageTitle = tNews("title");
    let categoryName = tNews("title").toLowerCase(); 

    if (typeFilter && teamFilter) {
        const type = tEnums(`PostType.${typeFilter}`);
        const team = tEnums(`TeamContext.${teamFilter}`);
        pageTitle = `${type} | ${team}`;
        categoryName = locale === 'uk' 
            ? `${type.toLowerCase()} команди ${team}` 
            : `${type.toLowerCase()} from the ${team}`;
    } else if (typeFilter) {
        pageTitle = tEnums(`PostType.${typeFilter}`);
        categoryName = pageTitle.toLowerCase();
    } else if (teamFilter) {
        pageTitle = tEnums(`TeamContext.${teamFilter}`);
        categoryName = locale === 'uk' 
            ? `новини команди ${pageTitle}` 
            : `news from the ${pageTitle}`;
    }

    if (dateParam) {
        pageTitle = tNews("titleWithDate", { title: pageTitle, date: dateParam });
    }
    
    const pageDescription = (typeFilter || teamFilter || dateParam) 
        ? tNews("dynamicDescription", { category: categoryName })
        : tNews("description");

    return {
        title: pageTitle,
        description: pageDescription,
    };
}

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const resolvedSearchParams = await searchParams;
    return <>
        <LatestNews searchParams={resolvedSearchParams} />
    </>
}