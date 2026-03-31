import LatestNews from "./_components/latest-news";

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const resolvedSearchParams = await searchParams;
    return <>
        <LatestNews searchParams={resolvedSearchParams} />
    </>
}