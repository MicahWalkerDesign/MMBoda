'use client';

import { useState } from 'react';
import Lightbox from '../../components/Lightbox';
import { useI18n } from '../../lib/i18n';
import { driveThumb } from '../../lib/galleryFeed';
import { useLiveGallery } from '../../lib/useLiveGallery';
import { DRIVE_FOLDER_URL, GALLERY_PAGE_LIMIT } from '../../lib/weddingConfig';

export default function GalleryPage() {
    const { t } = useI18n();
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const {
        photos: livePhotos,
        error,
        refresh,
        isLoading,
    } = useLiveGallery(GALLERY_PAGE_LIMIT);

    const isEmpty = livePhotos !== null && livePhotos.length === 0 && !error;
    const images: string[] = livePhotos ? livePhotos.map((p) => driveThumb(p.id, 1600)) : [];

    return (
        <div className="min-h-dvh px-4 py-8 max-w-lg mx-auto space-y-6">
            <div className="text-center space-y-2 animate-fade-in-up opacity-0">
                <h1 className="font-[family-name:var(--font-poppins)] text-2xl font-semibold text-terracotta">
                    {t('gallery.title')}
                </h1>
                <p className="text-sm text-coffee/60">{t('gallery.subtitleStandalone')}</p>
                <p className="text-[11px] text-coffee/45 pt-1">
                    {isLoading ? t('gallery.loading') : error && images.length === 0 ? t('gallery.error') : isEmpty ? t('gallery.empty') : t('gallery.live')}
                </p>
                {error && images.length === 0 && (
                    <button
                        type="button"
                        onClick={() => refresh()}
                        className="text-xs font-semibold text-terracotta hover:text-terracotta-dark"
                    >
                        {t('gallery.retry')}
                    </button>
                )}
            </div>

            {!isLoading && !isEmpty && (
                <div className="columns-2 gap-3 space-y-3 animate-fade-in-up opacity-0 delay-100">
                    {images.map((src, i) => (
                        <button
                            key={`${src}-${i}`}
                            onClick={() => setLightboxIndex(i)}
                            className="block w-full rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group break-inside-avoid"
                            style={{ animationDelay: `${0.1 + i * 0.05}s` }}
                        >
                            <div className="relative overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={src}
                                    alt={`Photo ${i + 1}`}
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-coffee/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                                    <span className="glass rounded-full px-3 py-1 text-xs text-white font-medium">
                                        {t('gallery.view')}
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {isLoading && (
                <div className="columns-2 gap-3 space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-2xl bg-coffee/5 break-inside-avoid animate-pulse"
                            style={{ height: i % 3 === 0 ? 220 : i % 3 === 1 ? 160 : 190 }}
                        />
                    ))}
                </div>
            )}

            <div className="text-center pt-4 animate-fade-in-up opacity-0 delay-300">
                <a
                    href={DRIVE_FOLDER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-terracotta text-white rounded-xl px-6 py-3.5 text-sm font-semibold font-[family-name:var(--font-poppins)] shadow-lg shadow-terracotta/25 hover:bg-terracotta-dark active:scale-[0.98] transition-all"
                >
                    {t('gallery.viewAllLong')}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                </a>
                <p className="text-xs text-coffee/40 mt-2">{t('gallery.noSignin')}</p>
            </div>

            <div className="h-8" />

            {lightboxIndex !== null && images.length > 0 && (
                <Lightbox
                    images={images}
                    initialIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                />
            )}
        </div>
    );
}
