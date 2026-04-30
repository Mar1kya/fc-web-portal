import NewsCard from "@/app/[locale]/(main)/news/_components/news-card";
import { getLocale } from "next-intl/server";

type PostForCard = {
    slug: string;
    type: string;
    teamContext: string;
    publishedAt: Date;
    translations: { language: string; title: string; }[];
    media: { url: string; }[];
};

type NewsGridProps = {
    posts: PostForCard[];
};

export default async function NewsGrid({ posts }: NewsGridProps) {
    const locale = await getLocale();
    if (!posts || posts.length === 0) return null;

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
                <NewsCard key={post.slug} post={post} locale={locale} />
            ))}
        </div>
    );
}