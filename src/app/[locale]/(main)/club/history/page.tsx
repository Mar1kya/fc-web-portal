import { getTranslations } from "next-intl/server";
import { Calendar, Trophy, MapPin, Shirt, Quote } from "lucide-react";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import Image from "next/image";


type TimelineEvent = {
    year: string;
    title: string;
    description: string;
    tag?: string;
};

type TrophyItem = {
    title: string;
    year: string;
};

type Legend = {
    name: string;
    role: string;
    description: string;
};


export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("HistoryPage.Metadata");

    return {
        title: t("title"),
        description: t("description"),
        openGraph: {
            title: t("title"),
            description: t("description"),
            type: "website",
            url: "/club/history",
            images: [
                {
                    url: "/images/history.jpg",
                    width: 1200,
                    height: 630,
                    alt: t("title"),
                },
            ],
        },
    };
}

export default async function ClubHistoryPage() {
    const t = await getTranslations("HistoryPage");

    const stats = [
        { icon: Calendar, label: t("Stats.founded"), value: t("Stats.foundedValue") },
        { icon: Trophy, label: t("Stats.achievement"), value: t("Stats.achievementValue") },
        { icon: MapPin, label: t("Stats.arena"), value: t("Stats.arenaValue") },
        { icon: Shirt, label: t("Stats.colors"), value: t("Stats.colorsValue") },
    ];

    const timeline = t.raw("Timeline.events") as TimelineEvent[];
    const trophies = t.raw("Trophies.items") as TrophyItem[];
    const legends = t.raw("Legends.people") as Legend[];

    return (
        <div className="flex flex-col gap-20">
            <section className="relative overflow-hidden rounded-2xl">
                <div className="relative flex min-h-105 flex-col justify-end px-6 py-12 sm:px-12 sm:py-16 overflow-hidden">
                    <Image
                        src="/images/history.jpg"
                        alt=""
                        fill
                        priority
                        className="object-cover -z-10"
                    />
                    <div
                        className="absolute inset-0 -z-10"
                        style={{
                            background:
                                "linear-gradient(180deg, oklch(0.22 0.05 155 / 0.55) 0%, oklch(0.14 0.04 155 / 0.92) 100%)",
                        }}
                    />
                    <span className="mb-3 text-sm font-medium tracking-wide" style={{ color: "oklch(0.85 0.1 95)" }}>
                        {t("Hero.eyebrow")}
                    </span>
                    <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white leading-[1.05] sm:text-6xl">
                        {t("Hero.title")}
                    </h1>
                    <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                        {t("Hero.description")}
                    </p>
                </div>
            </section>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:grid-cols-4">
                {stats.map(({ icon: Icon, label, value }) => (
                    <Card key={label} className="flex-row items-center gap-4 px-5 py-4">
                        <CardContent className="flex items-center gap-4 p-0">
                            <div
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                                style={{ background: "oklch(0.32 0.08 155)" }}
                            >
                                <Icon
                                    className="h-5 w-5"
                                    style={{ color: "oklch(0.85 0.1 155)" }}
                                    strokeWidth={2}
                                />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm leading-tight text-muted-foreground">{label}</p>
                                <p className="truncate text-lg font-semibold leading-tight">{value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </section>
            <section className="px-2">
                <div className="mb-12">
                    <h2 className="mb-3 text-3xl font-bold tracking-tight">
                        {t("Timeline.heading")}
                    </h2>
                    <p className="leading-relaxed text-muted-foreground">
                        {t("Timeline.description")}
                    </p>
                </div>
                <div className="relative">
                    <div className="absolute left-1/2 top-0 bottom-0 hidden w-px -translate-x-1/2 bg-border md:block" />
                    <div className="absolute left-14 top-0 bottom-0 w-px bg-border md:hidden" />
                    {timeline.map((event, index) => {
                        const isLeft = index % 2 === 0;
                        const isLast = index === timeline.length - 1;

                        return (
                            <div className="relative" key={`${event.year}-${event.title}`}>
                                <div className={cn("relative pl-22 md:hidden", !isLast && "pb-10")}>
                                    <span
                                        className="absolute left-14 top-1 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 bg-background"
                                        style={{ borderColor: "oklch(0.55 0.13 155)" }}
                                    />
                                    <span
                                        className="absolute left-[-1] top-0 text-2xl font-bold leading-none tracking-tight"
                                        style={{ color: "oklch(0.6 0.13 155)" }}
                                    >
                                        {event.year}
                                    </span>
                                    <div className="mt-9">
                                        <div className="mb-1.5 flex items-center gap-2">
                                            <h3 className="text-base font-semibold">{event.title}</h3>
                                            {event.tag && (
                                                <Badge
                                                    variant="outline"
                                                    className="rounded-full text-[11px] font-medium"
                                                    style={{ borderColor: "oklch(0.65 0.13 95)", color: "oklch(0.7 0.13 95)" }}
                                                >
                                                    {event.tag}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                            {event.description}
                                        </p>
                                    </div>
                                </div>
                                <div
                                    className={cn(
                                        "hidden md:grid md:grid-cols-[1fr_auto_1fr] md:gap-8",
                                        !isLast && "md:pb-14"
                                    )}
                                >
                                    <div className={isLeft ? "text-right" : ""}>
                                        {isLeft && (
                                            <div className="inline-block max-w-md text-left">
                                                <div
                                                    className={cn(
                                                        "mb-1.5 flex items-center gap-2",
                                                        "justify-end flex-row-reverse"
                                                    )}
                                                >
                                                    {event.tag && (
                                                        <Badge
                                                            variant="outline"
                                                            className="rounded-full text-[11px] font-medium"
                                                            style={{
                                                                borderColor: "oklch(0.65 0.13 95)",
                                                                color: "oklch(0.7 0.13 95)",
                                                            }}
                                                        >
                                                            {event.tag}
                                                        </Badge>
                                                    )}
                                                    <h3 className="text-lg font-semibold">{event.title}</h3>
                                                </div>
                                                <p className="text-right text-sm leading-relaxed text-muted-foreground">
                                                    {event.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span
                                            className="mb-3 text-2xl font-bold leading-none tracking-tight"
                                            style={{ color: "oklch(0.6 0.13 155)" }}
                                        >
                                            {event.year}
                                        </span>
                                        <span
                                            className="h-4 w-4 shrink-0 rounded-full border-2 bg-background"
                                            style={{ borderColor: "oklch(0.55 0.13 155)" }}
                                        />
                                    </div>
                                    <div>
                                        {!isLeft && (
                                            <div className="inline-block max-w-md text-left">
                                                <div className="mb-1.5 flex items-center gap-2">
                                                    <h3 className="text-lg font-semibold">{event.title}</h3>
                                                    {event.tag && (
                                                        <Badge
                                                            variant="outline"
                                                            className="rounded-full text-[11px] font-medium"
                                                            style={{
                                                                borderColor: "oklch(0.65 0.13 95)",
                                                                color: "oklch(0.7 0.13 95)",
                                                            }}
                                                        >
                                                            {event.tag}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm leading-relaxed text-muted-foreground">
                                                    {event.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
            <section>
                <h2 className="mb-8 text-3xl font-bold tracking-tight">{t("Trophies.heading")}</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                    {trophies.map((item) => (
                        <Card key={`${item.title}-${item.year}`} className="p-6">
                            <CardContent className="p-0">
                                <Trophy
                                    className="mb-3 h-6 w-6"
                                    style={{ color: "oklch(0.65 0.13 95)" }}
                                    strokeWidth={2}
                                />
                                <p className="font-semibold leading-snug">{item.title}</p>
                                <p className="mt-1 text-sm text-muted-foreground">{item.year}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
            <section>
                <h2 className="mb-8 text-3xl font-bold tracking-tight">{t("Legends.heading")}</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                    {legends.map((legend) => (
                        <Card key={legend.name} className="p-6">
                            <CardContent className="p-0">
                                <p className="font-semibold">{legend.name}</p>
                                <p className="mb-2 text-xs font-medium" style={{ color: "oklch(0.6 0.13 155)" }}>
                                    {legend.role}
                                </p>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {legend.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
            <section
                className="rounded-2xl px-8 py-14 text-center sm:px-16 sm:py-20"
                style={{ background: "oklch(0.3 0.05 155)" }}
            >
                <Quote
                    className="mx-auto mb-6 h-8 w-8"
                    style={{ color: "oklch(0.75 0.1 155)" }}
                    strokeWidth={2}
                />
                <p className="mx-auto max-w-2xl text-xl font-medium leading-snug sm:text-2xl">
                    {t("Quote.text")}
                </p>
                <p className="mt-5 text-sm text-muted-foreground">{t("Quote.author")}</p>
            </section>
        </div>
    );
}