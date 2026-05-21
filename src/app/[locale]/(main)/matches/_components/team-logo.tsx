"use client";

import { useState } from "react";
import Image from "next/image";
import { Shield } from "lucide-react"; 

type TeamLogoProps = {
    src: string;
    alt: string;
};

export default function TeamLogo({ src, alt }: TeamLogoProps) {
    const [hasError, setHasError] = useState(false);

    if (!src || hasError) {
        return (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-muted/30">
                <Shield className="h-4 w-4 text-muted-foreground/50" strokeWidth={2} />
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill
            sizes="42px"
            className="object-contain"
            unoptimized
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)} 
        />
    );
}