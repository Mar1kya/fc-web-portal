"use client";

import { useState } from "react";
import Image from "next/image";

type StandingsTeamLogoProps = {
    src: string | null;
    alt: string;
    fallbackText: string;
};

export function StandingsTeamLogo({ src, alt, fallbackText }: StandingsTeamLogoProps) {
    const [hasError, setHasError] = useState(false);

    if (!src || hasError) {
        return (
            <div className="w-7 h-7 bg-muted rounded-full border shrink-0 flex items-center justify-center text-xs font-bold text-muted-foreground">
                {fallbackText.charAt(0)}
            </div>
        );
    }

    return (
        <div className="relative w-7 h-7 shrink-0">
            <Image
                src={src}
                alt={alt}
                fill
                sizes="28px"
                className="object-contain p-0.5 rounded-full"
                unoptimized
                referrerPolicy="no-referrer"
                onError={() => setHasError(true)}
            />
        </div>
    );
}