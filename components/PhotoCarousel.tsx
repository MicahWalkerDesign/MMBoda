'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface PhotoCarouselProps {
    images: string[];
    onImageClick: (index: number) => void;
    expandLabel: string;
    initialCount?: number;
    batchSize?: number;
}

export default function PhotoCarousel({
    images,
    onImageClick,
    expandLabel,
    initialCount = images.length,
    batchSize = 3,
}: PhotoCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [visibleCount, setVisibleCount] = useState(() => Math.min(initialCount, images.length));
    const [isDragging, setIsDragging] = useState(false);
    const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
    const dragStart = useRef<{ x: number; scroll: number } | null>(null);
    const didDrag = useRef(false);
    const imagesKey = images.join('|');
    const visibleImages = images.slice(0, visibleCount);

    const revealNextBatch = useCallback(() => {
        setVisibleCount((count) => Math.min(count + batchSize, images.length));
    }, [batchSize, images.length]);

    const updateActiveIndex = useCallback(() => {
        const el = scrollRef.current;
        if (!el || !el.children.length) return;
        const firstChild = el.children[0] as HTMLElement;
        if (!firstChild) return;
        const itemWidth = firstChild.offsetWidth;
        const gap = 12;
        const index = Math.round(el.scrollLeft / (itemWidth + gap));
        setActiveIndex(Math.min(Math.max(index, 0), visibleCount - 1));

        const remaining = el.scrollWidth - el.clientWidth - el.scrollLeft;
        if (remaining < itemWidth) revealNextBatch();
    }, [revealNextBatch, visibleCount]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setVisibleCount(Math.min(initialCount, images.length));
            setActiveIndex(0);
            if (scrollRef.current) scrollRef.current.scrollLeft = 0;
        }, 0);
        return () => clearTimeout(timer);
    }, [imagesKey, images.length, initialCount]);

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
        didDrag.current = false;
        dragStart.current = { x: e.clientX, scroll: el.scrollLeft };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !dragStart.current || !scrollRef.current) return;
        e.preventDefault();
        const dx = e.clientX - dragStart.current.x;
        if (Math.abs(dx) > 5) didDrag.current = true;
        scrollRef.current.scrollLeft = dragStart.current.scroll - dx;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        dragStart.current = null;
    };

    const handleClick = (index: number) => {
        if (didDrag.current) {
            didDrag.current = false;
            return;
        }
        onImageClick(index);
    };

    const scrollByCard = (direction: -1 | 1) => {
        const el = scrollRef.current;
        const first = el?.children[0] as HTMLElement | undefined;
        if (!el || !first) return;
        const nearRenderedEnd = el.scrollWidth - el.clientWidth - el.scrollLeft < first.offsetWidth;
        if (direction === 1 && (nearRenderedEnd || activeIndex >= visibleCount - 2)) {
            revealNextBatch();
        }
        el.scrollBy({ left: direction * (first.offsetWidth + 12), behavior: 'smooth' });
    };

    if (images.length === 0) {
        return (
            <div className="glass rounded-2xl p-8 text-center">
                <p className="text-coffee/40 text-sm">No photos yet — be the first to share!</p>
            </div>
        );
    }

    return (
        <div className="relative max-w-5xl mx-auto space-y-3">
            {/* Carousel container with proper padding for edge peek */}
            <div
                ref={scrollRef}
                className={`flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 pl-2 pr-2 ${visibleImages.length <= 3 ? 'lg:justify-center' : ''} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
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

                {visibleImages.map((src, i) => (
                    <button
                        key={i}
                        onClick={() => handleClick(i)}
                        aria-label={`${expandLabel} ${i + 1}`}
                        className="flex-none snap-center active:scale-[0.97] transition-transform"
                    >
                        <div className="relative w-[200px] h-[270px] sm:w-[240px] sm:h-[320px] rounded-2xl overflow-hidden shadow-md">
                            {failedImages.has(i) ? (
                                <div className="absolute inset-0 bg-cream-dark flex items-center justify-center text-coffee/35 text-sm">
                                    {i + 1}
                                </div>
                            ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={src}
                                    alt={`Photo ${i + 1}`}
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                    draggable={false}
                                    onError={() => setFailedImages((prev) => new Set(prev).add(i))}
                                    className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                                />
                            )}
                            {/* Subtle gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-coffee/15 to-transparent" />
                            {/* Tap hint on first image only */}
                            {i === 0 && (
                                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 glass rounded-full px-2.5 py-1 text-[9px] text-white/90 font-medium whitespace-nowrap">
                                    {expandLabel}
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {visibleImages.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={() => scrollByCard(-1)}
                        aria-label="Previous photo"
                        className="hidden sm:flex absolute left-5 top-[42%] -translate-y-1/2 z-10 w-9 h-9 rounded-full glass items-center justify-center text-coffee/70 hover:text-terracotta"
                    >
                        ‹
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollByCard(1)}
                        aria-label="Next photo"
                        className="hidden sm:flex absolute right-5 top-[42%] -translate-y-1/2 z-10 w-9 h-9 rounded-full glass items-center justify-center text-coffee/70 hover:text-terracotta"
                    >
                        ›
                    </button>
                </>
            )}

            {/* Dot indicators */}
            {visibleImages.length > 1 && (
                <div className="flex justify-center gap-1.5">
                    {visibleImages.map((_, i) => (
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
