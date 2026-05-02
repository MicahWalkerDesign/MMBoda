'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface PhotoCarouselProps {
    images: string[];
    onImageClick: (index: number) => void;
}

export default function PhotoCarousel({ images, onImageClick }: PhotoCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef<{ x: number; scroll: number } | null>(null);

    const updateActiveIndex = useCallback(() => {
        const el = scrollRef.current;
        if (!el || !el.children.length) return;
        const firstChild = el.children[0] as HTMLElement;
        if (!firstChild) return;
        const itemWidth = firstChild.offsetWidth;
        const gap = 12;
        const index = Math.round(el.scrollLeft / (itemWidth + gap));
        setActiveIndex(Math.min(Math.max(index, 0), images.length - 1));
    }, [images.length]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener('scroll', updateActiveIndex, { passive: true });
        return () => el.removeEventListener('scroll', updateActiveIndex);
    }, [updateActiveIndex]);

    // Mouse drag for desktop
    const handleMouseDown = (e: React.MouseEvent) => {
        const el = scrollRef.current;
        if (!el) return;
        setIsDragging(true);
        dragStart.current = { x: e.clientX, scroll: el.scrollLeft };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !dragStart.current || !scrollRef.current) return;
        e.preventDefault();
        const dx = e.clientX - dragStart.current.x;
        scrollRef.current.scrollLeft = dragStart.current.scroll - dx;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        dragStart.current = null;
    };

    const handleClick = (index: number) => {
        if (!isDragging) {
            onImageClick(index);
        }
    };

    if (images.length === 0) {
        return (
            <div className="glass rounded-2xl p-8 text-center">
                <p className="text-coffee/40 text-sm">No photos yet — be the first to share!</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Carousel container with proper padding for edge peek */}
            <div
                ref={scrollRef}
                className={`flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 pl-2 pr-2 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
                    }`}
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Hide scrollbar */}
                <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>

                {images.map((src, i) => (
                    <button
                        key={i}
                        onClick={() => handleClick(i)}
                        className="flex-none snap-center active:scale-[0.97] transition-transform"
                    >
                        <div className="relative w-[200px] h-[270px] sm:w-[240px] sm:h-[320px] rounded-2xl overflow-hidden shadow-md">
                            <Image
                                src={src}
                                alt={`Photo ${i + 1}`}
                                fill
                                className="object-cover select-none pointer-events-none"
                                sizes="240px"
                                draggable={false}
                            />
                            {/* Subtle gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-coffee/15 to-transparent" />
                            {/* Tap hint on first image only */}
                            {i === 0 && (
                                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 glass rounded-full px-2.5 py-1 text-[9px] text-white/90 font-medium whitespace-nowrap">
                                    Tap to expand
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Dot indicators */}
            {images.length > 1 && (
                <div className="flex justify-center gap-1.5">
                    {images.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex
                                    ? 'w-4 bg-terracotta'
                                    : 'w-1.5 bg-terracotta/15'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
