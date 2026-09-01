import { getTranslations } from "next-intl/server";
import {
    Phone,
    Mail,
    MapPin,
    Clock,
    Navigation,
    Users,
    Newspaper,
    Ticket,
    Handshake,
    Facebook,
    Instagram,
    Youtube,
    Send,
} from "lucide-react";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Metadata } from "next";

type ContactPerson = {
    name: string;
    role: string;
    email: string;
    phone: string;
};

type SocialLink = {
    label: string;
    href: string;
};

const DEPARTMENT_ICONS = [Users, Newspaper, Ticket, Handshake];

const SOCIAL_ICONS: Record<string, typeof Facebook> = {
    facebook: Facebook,
    instagram: Instagram,
    youtube: Youtube,
    telegram: Send,
};

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("ContactsPage.Metadata");

    return {
        title: t("title"),
        description: t("description"),
        openGraph: {
            title: t("title"),
            description: t("description"),
            type: "website",
            url: "/club/contacts",
        },
    };
}

export default async function ClubContactsPage() {
    const t = await getTranslations("ContactsPage");

    const quickContacts = [
        { icon: Phone, label: t("Quick.phone"), value: t("Quick.phoneValue"), href: `tel:${t("Quick.phoneValue")}` },
        { icon: Mail, label: t("Quick.email"), value: t("Quick.emailValue"), href: `mailto:${t("Quick.emailValue")}` },
        { icon: MapPin, label: t("Quick.address"), value: t("Quick.addressValue") },
        { icon: Clock, label: t("Quick.hours"), value: t("Quick.hoursValue") },
    ];

    const departments = t.raw("Departments.items") as ContactPerson[];
    const socials = t.raw("Socials.items") as SocialLink[];

    const mapQuery = encodeURIComponent(t("Quick.addressValue"));
    const mapSrc = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
    const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;

    return (
        <div className="flex flex-col gap-20">
            <Card
                className="relative overflow-hidden rounded-2xl px-6 py-14 sm:px-12 sm:py-20"
            >
                <span className="mb-3 block text-sm font-medium tracking-wide" style={{ color: "oklch(0.85 0.1 95)" }}>
                    {t("Hero.eyebrow")}
                </span>
                <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white leading-[1.05] sm:text-6xl">
                    {t("Hero.title")}
                </h1>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                    {t("Hero.description")}
                </p>
            </Card>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:grid-cols-4">
                {quickContacts.map(({ icon: Icon, label, value, href }) => {
                    const content = (
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
                                <p className="line-clamp-1 text-lg font-semibold leading-tight">{value}</p>
                            </div>
                        </CardContent>
                    );

                    return href ? (
                        <a key={label} href={href}>
                            <Card className="flex-row items-center gap-4 px-5 py-4 transition-colors hover:border-emerald-600/50">
                                {content}
                            </Card>
                        </a>
                    ) : (
                        <Card key={label} className="flex-row items-center gap-4 px-5 py-4">
                            {content}
                        </Card>
                    );
                })}
            </section>
            <section className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
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
                                    {t("Quick.address")}
                                </p>
                                <p className="text-lg font-semibold leading-snug">
                                    {t("Quick.addressValue")}
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
                            {t("Quick.mapCta")}
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
                        title={t("Quick.address")}
                    />
                </div>
            </section>
            <section>
                <div className="mb-8">
                    <h2 className="mb-3 text-3xl font-bold tracking-tight">{t("Departments.heading")}</h2>
                    <p className="leading-relaxed text-muted-foreground">
                        {t("Departments.description")}
                    </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {departments.map((person, index) => {
                        const Icon = DEPARTMENT_ICONS[index % DEPARTMENT_ICONS.length];
                        return (
                            <Card key={person.email} className="p-6">
                                <CardContent className="p-0">
                                    <Icon
                                        className="mb-3 h-6 w-6"
                                        style={{ color: "oklch(0.6 0.13 155)" }}
                                        strokeWidth={2}
                                    />
                                    <p className="font-semibold leading-snug">{person.name}</p>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {person.role}
                                    </p>
                                    <div className="mt-3 flex flex-col gap-1 text-sm">
                                        <a
                                            href={`mailto:${person.email}`}
                                            className="truncate transition-colors hover:text-emerald-600"
                                            style={{ color: "oklch(0.6 0.13 155)" }}
                                        >
                                            {person.email}
                                        </a>
                                        <a
                                            href={`tel:${person.phone}`}
                                            className="text-muted-foreground transition-colors hover:text-emerald-600"
                                        >
                                            {person.phone}
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </section>
            <section>
                <div className="mb-8">
                    <h2 className="mb-3 text-3xl font-bold tracking-tight">{t("Socials.heading")}</h2>
                    <p className="leading-relaxed text-muted-foreground">
                        {t("Socials.description")}
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {socials.map((social) => {
                        const Icon = SOCIAL_ICONS[social.label.toLowerCase()] ?? Facebook;
                        return (
                            <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer">
                                <Card className="flex-row items-center gap-3 px-5 py-4 transition-colors hover:border-emerald-600/50">
                                    <CardContent className="flex items-center gap-3 p-0">
                                        <div
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                                            style={{ background: "oklch(0.32 0.08 155)" }}
                                        >
                                            <Icon
                                                className="h-5 w-5"
                                                style={{ color: "oklch(0.85 0.1 155)" }}
                                                strokeWidth={2}
                                            />
                                        </div>
                                        <p className="font-semibold leading-tight">{social.label}</p>
                                    </CardContent>
                                </Card>
                            </a>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}