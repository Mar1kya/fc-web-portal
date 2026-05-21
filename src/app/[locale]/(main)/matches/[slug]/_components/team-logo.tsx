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
                <Shield className="h-14 w-14 text-muted-foreground/50" strokeWidth={2} />
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill
            sizes="112px"
            className="object-contain drop-shadow-md"
            unoptimized
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)} 
        />
    );
}