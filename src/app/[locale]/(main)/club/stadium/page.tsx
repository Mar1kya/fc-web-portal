import { getTranslations } from "next-intl/server";
import {
    Calendar,
    Users,
    Ruler,
    MapPin,
    Lightbulb,
    Sprout,
    Newspaper,
    Stethoscope,
    Video,
    Quote,
    Navigation,
} from "lucide-react";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import Image from "next/image";
import MediaGallery from "@/components/shared/media-gallery";

type TimelineEvent = {
    year: string;
    title: string;
    description: string;
    tag?: string;
};

type FacilityItem = {
    title: string;
    description: string;
};

const FACILITY_ICONS = [Users, Sprout, Lightbulb, Newspaper, Stethoscope, Video];
const GALLERY_IMAGES = [
    "/images/main-stand.jpg",
    "/images/main-stand2.jpg",
    "/images/lighting.jpg",
    "/images/match-stands.jpg",
    "/images/exit.jpg",
    "/images/stadium-above.jpg",
];

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("StadiumPage.Metadata");

    return {
        title: t("title"),
        description: t("description"),
        openGraph: {
            title: t("title"),
            description: t("description"),
            type: "website",
            url: "/club/stadium",
            images: [
                {
                    url: "/images/stadium.jpg",
                    width: 1200,
                    height: 630,
                    alt: t("title"),
                },
            ],
        },
    };
}

export default async function ClubStadiumPage() {
    const t = await getTranslations("StadiumPage");

    const stats = [
        { icon: Calendar, label: t("Stats.opened"), value: t("Stats.openedValue") },
        { icon: Users, label: t("Stats.capacity"), value: t("Stats.capacityValue") },
        { icon: Ruler, label: t("Stats.pitch"), value: t("Stats.pitchValue") },
        { icon: MapPin, label: t("Stats.address"), value: t("Stats.addressValue") },
    ];

    const timeline = t.raw("Timeline.events") as TimelineEvent[];
    const facilities = t.raw("Facilities.items") as FacilityItem[];
    const galleryCaptions = t.raw("Gallery.images") as string[];
    const mapQuery = encodeURIComponent(t("Location.address"));
    const mapSrc = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
    const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;


    const galleryMedia = GALLERY_IMAGES.map((src, index) => ({
        id: src,
        url: src,
        caption: galleryCaptions[index] ?? undefined,
    }));

    return (
        <div className="flex flex-col gap-20">
            <section className="relative overflow-hidden rounded-2xl">
                <div className="relative flex min-h-105 flex-col justify-end px-6 py-12 sm:px-12 sm:py-16 overflow-hidden">
                    <Image
                        src="/images/stadium.jpg"
                        alt=""
                        fill
                        priority
                        className="object-cover object-[center_37%] -z-10"
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
                                    <div className="flex justify-end">
                                        {isLeft && (
                                            <div className="w-full max-w-md text-left">
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
                                            <div className="w-full max-w-md text-left">
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
                <div className="mb-8">
                    <h2 className="mb-3 text-3xl font-bold tracking-tight">{t("Facilities.heading")}</h2>
                    <p className="leading-relaxed text-muted-foreground">
                        {t("Facilities.description")}
                    </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {facilities.map((item, index) => {
                        const Icon = FACILITY_ICONS[index % FACILITY_ICONS.length];
                        return (
                            <Card key={item.title} className="p-6">
                                <CardContent className="p-0">
                                    <Icon
                                        className="mb-3 h-6 w-6"
                                        style={{ color: "oklch(0.6 0.13 155)" }}
                                        strokeWidth={2}
                                    />
                                    <p className="font-semibold leading-snug">{item.title}</p>
                                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                                        {item.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </section>
            <section>
                <div className="mb-8">
                    <h2 className="mb-3 text-3xl font-bold tracking-tight">{t("Location.heading")}</h2>
                    <p className="leading-relaxed text-muted-foreground">
                        {t("Location.description")}
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
                    <Card className="flex flex-col justify-between p-6">
                        <CardContent className="flex flex-col gap-4 p-0">
                            <div className="flex items-start gap-3">
                                <div
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                                    style={{ background: "oklch(0.32 0.08 155)" }}
                                >
                                    <MapPin
                                        className="h-5 w-5"
                                        style={{ color: "oklch(0.85 0.1 155)" }}
                                        strokeWidth={2}
                                    />
                                </div>
                                <div>
                                    <p className="text-sm leading-tight text-muted-foreground">
                                        {t("Location.addressLabel")}
                                    </p>
                                    <p className="text-lg font-semibold leading-snug">
                                        {t("Location.address")}
                                    </p>
                                </div>
                            </div>
                            <a
                                href={directionsHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                                style={{ background: "oklch(0.45 0.1 155)" }}
                            >
                                <Navigation className="h-4 w-4" strokeWidth={2} />
                                {t("Location.mapCta")}
                            </a>
                        </CardContent>
                    </Card>
                    <div className="overflow-hidden rounded-2xl border border-border">
                        <iframe
                            src={mapSrc}
                            className="h-64 w-full md:h-full"
                            style={{ border: 0 }}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={t("Location.addressLabel")}
                        />
                    </div>
                </div>
            </section>
            <section>
                <div className="mb-8">
                    <h2 className="mb-3 text-3xl font-bold tracking-tight">{t("Gallery.heading")}</h2>
                    <p className="leading-relaxed text-muted-foreground">
                        {t("Gallery.description")}
                    </p>
                </div>
                <MediaGallery media={galleryMedia} />
            </section>
        </div>
    );
}