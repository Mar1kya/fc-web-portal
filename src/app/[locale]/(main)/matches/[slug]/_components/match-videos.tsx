"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, ImageOff } from "lucide-react";
import { useTranslations } from "next-intl";

function getYoutubeVideoId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

type MatchVideosProps = {
    highlightsUrl?: string | null;
    postMatchUrl?: string | null;
};

export default function MatchVideos({ highlightsUrl, postMatchUrl }: MatchVideosProps) {
    const t = useTranslations("SingleMatchPage.Tabs");

    const videos = [];
    if (highlightsUrl) {
        videos.push({ id: "highlights", url: highlightsUrl, title: t("highlights") });
    }
    if (postMatchUrl) {
        videos.push({ id: "postMatch", url: postMatchUrl, title: t("postMatch") });
    }

    if (videos.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full mt-6">
            {videos.map((video) => {
                const ytId = getYoutubeVideoId(video.url);
                const isValid = !!video.url;

                const coverUrl = ytId
                    ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
                    : null;

                return (
                    <Link
                        key={video.id}
                        href={video.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col gap-4 group"
                    >
                        <div className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-muted flex items-center justify-center border border-border/50 shadow-sm ${isValid ? "cursor-pointer" : "cursor-default"}`}>
                            {coverUrl ? (
                                <>
                                    <Image
                                        src={coverUrl}
                                        alt={video.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        unoptimized
                                        referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-black/10 transition-colors duration-300 group-hover:bg-black/30 flex items-center justify-center">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-600/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-110">
                                            <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1.5 fill-white" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                                    <ImageOff className="w-12 h-12" strokeWidth={1.5} />
                                </div>
                            )}
                        </div>
                        <h3 className="font-bold text-foreground text-lg sm:text-xl px-1 group-hover:text-emerald-600 transition-colors leading-tight line-clamp-2">
                            {video.title}
                        </h3>
                    </Link>
                );
            })}
        </div>
    );
}