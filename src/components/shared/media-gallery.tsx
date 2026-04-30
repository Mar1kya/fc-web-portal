"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoomIn, ImageOff } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Download from "yet-another-react-lightbox/plugins/download";
import Share from "yet-another-react-lightbox/plugins/share";

type MediaItem = {
    id: string;
    url: string;
};

type MediaGalleryProps = {
    media: MediaItem[];
};

export default function MediaGallery({ media }: MediaGalleryProps) {
    const [index, setIndex] = useState(-1);
    if (!media || media.length === 0) return null;
    const validMedia = media.filter(m => m.url && m.url.trim() !== "");
    const slides = validMedia.map(m => ({ src: m.url }));

    let lightboxIndex = 0;

    return (
        <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {media.map((item) => {
                    const isValid = item.url && item.url.trim() !== "";
                    const currentSlideIndex = isValid ? lightboxIndex++ : -1;

                    return (
                        <div
                            key={item.id}
                            className={`group relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-muted flex items-center justify-center border border-border/50 ${isValid ? "cursor-pointer" : "cursor-default"
                                }`}
                            onClick={() => isValid && setIndex(currentSlideIndex)}
                        >
                            {isValid ? (
                                <>
                                    <Image
                                        src={item.url}
                                        alt="Media"
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                    <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20 flex items-center justify-center">
                                        <ZoomIn className="w-10 h-10 text-emerald-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100 drop-shadow-md" />
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground/50 transition-transform duration-500 group-hover:scale-105 group-hover:text-emerald-600/50">
                                    <ImageOff className="w-12 h-12" strokeWidth={1.5} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <Lightbox
                index={index}
                open={index >= 0}
                close={() => setIndex(-1)}
                slides={slides}
                plugins={[Zoom, Fullscreen, Slideshow, Download, Share, Thumbnails]}
                styles={{ container: { backgroundColor: "#000000" } }}
                carousel={{ finite: slides.length < 4 }}
                thumbnails={{
                    position: "bottom",
                    width: 120,
                    height: 80,
                    border: 2,
                    borderRadius: 8,
                    padding: 4,
                    gap: 16,
                }}
                zoom={{
                    maxZoomPixelRatio: 3,
                    zoomInMultiplier: 2,
                }}
            />
        </>
    );
}