'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface LightboxProps {
    images: string[];
    initialIndex: number;
    onClose: () => void;
}

export default function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchDelta, setTouchDelta] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);

    const goNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const goPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        };
        window.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [onClose, goNext, goPrev]);

    // Touch swipe with visual feedback
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientX);
        setTouchDelta(0);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStart === null) return;
        const delta = e.touches[0].clientX - touchStart;
        setTouchDelta(delta);
    };

    const handleTouchEnd = () => {
        if (touchStart === null) return;
        if (Math.abs(touchDelta) > 60) {
            if (touchDelta < 0) goNext();
            else goPrev();
        }
        setTouchStart(null);
        setTouchDelta(0);
    };

    // Download handler
    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const src = images[currentIndex];
            const response = await fetch(src);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `wedding-photo-${currentIndex + 1}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch {
            // Fallback: open in new tab for mobile save
            window.open(images[currentIndex], '_blank');
        }
        setIsDownloading(false);
    };

    return (
        <div
            className="fixed inset-0 z-[100] bg-coffee/95 flex flex-col animate-fade-in"
            onClick={onClose}
        >
            {/* Top bar — with safe area padding */}
            <div className="flex items-center justify-between px-5 pt-[env(safe-area-inset-top,12px)] pb-2 relative z-10">
                {/* Counter */}
                <div className="glass rounded-full px-3 py-1.5 text-xs text-white/80 font-medium">
                    {currentIndex + 1} / {images.length}
                </div>

                <div className="flex items-center gap-2.5">
                    {/* Download button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                        disabled={isDownloading}
                        className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-white/20 transition-colors active:scale-90"
                        aria-label="Save photo"
                    >
                        {isDownloading ? (
                            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                        )}
                    </button>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-white/20 transition-colors active:scale-90"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Image area */}
            <div
                className="flex-1 flex items-center justify-center px-4 pb-20 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    className="relative w-full max-w-md h-full max-h-[70dvh] transition-transform duration-150 ease-out"
                    style={{ transform: `translateX(${touchDelta * 0.4}px)` }}
                >
                    <Image
                        src={images[currentIndex]}
                        alt={`Photo ${currentIndex + 1}`}
                        fill
                        className="object-contain rounded-lg select-none"
                        sizes="100vw"
                        priority
                        draggable={false}
                    />
                </div>
            </div>

            {/* Bottom: dots + hint — with safe area padding */}
            <div className="absolute bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom,24px)] pt-3">
                {/* Dot indicators */}
                {images.length > 1 && images.length <= 12 && (
                    <div className="flex justify-center gap-1.5 mb-2">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                                className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-white w-5' : 'bg-white/25 w-2'
                                    }`}
                                aria-label={`Go to photo ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
                <p className="text-center text-[10px] text-white/25 pb-1">
                    Swipe to browse · Tap save to download
                </p>
            </div>

            {/* Desktop nav arrows */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); goPrev(); }}
                        className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass items-center justify-center text-white hover:bg-white/20 transition-colors"
                        aria-label="Previous"
                    >
                        ‹
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); goNext(); }}
                        className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass items-center justify-center text-white hover:bg-white/20 transition-colors"
                        aria-label="Next"
                    >
                        ›
                    </button>
                </>
            )}
        </div>
    );
}
