'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import GlassCard from '../components/GlassCard';
import PhotoCarousel from '../components/PhotoCarousel';
import PhotoDropzone, { FileWithPreview } from '../components/PhotoDropzone';
import Lightbox from '../components/Lightbox';
import RsvpModal, { readStoredRsvp, RsvpData } from '../components/RsvpModal';
import CountdownTimer from '../components/CountdownTimer';
import { useI18n } from '../lib/i18n';
import { asset } from '../lib/paths';
import {
  GALLERY_REFRESH_MS,
  driveThumb,
  fetchLivePhotos,
  type DrivePhoto,
} from '../lib/galleryFeed';
import { uploadPhotos } from '../lib/uploadPhoto';

const DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1hfwpx4Ifxxi-XH-MpMEgH3xm1S-yss52';
// Replace with your deployed Google Apps Script Web App URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbytpRJvfdeZHWyE9M7ijlMnhFc-ljWb_NsDkN4xzhr93wnn3yv-YJMkcyMhbOit-JCn/exec';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

const EVENT_KEYS = [
  { time: '14:00', key: 'e1', icon: '🥂' },
  { time: '15:00', key: 'e2', icon: '💍', highlight: true },
  { time: '16:00', key: 'e3', icon: '🍹' },
  { time: '17:30', key: 'e4', icon: '🍽️' },
  { time: '20:00', key: 'e5', icon: '💃' },
  { time: '00:00', key: 'e6', icon: '🌮' },
];

const IBAN_VALUE = 'ES10 0081 0169 3600 0658 5164';

export default function HomePage() {
  const { t } = useI18n();

  // RSVP modal state
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [storedRsvp, setStoredRsvp] = useState<RsvpData | null>(null);

  // Photo upload state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [guestName, setGuestName] = useState('');
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadCount, setUploadCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadProgressLabel, setUploadProgressLabel] = useState('');
  const [uploadResetSignal, setUploadResetSignal] = useState(0);

  // Live gallery photos pulled from the shared Drive folder.
  const [livePhotos, setLivePhotos] = useState<DrivePhoto[] | null>(null);
  const galleryImages: string[] = livePhotos ? livePhotos.map((p) => driveThumb(p.id, 1600)) : [];
  const galleryLoading = livePhotos === null;
  const galleryEmpty = livePhotos !== null && livePhotos.length === 0;

  // IBAN copy
  const [ibanCopied, setIbanCopied] = useState(false);

  // Auto-open the RSVP modal on first visit (after a short delay so the hero is visible)
  useEffect(() => {
    const existing = readStoredRsvp();
    setStoredRsvp(existing);
    if (!existing) {
      const timer = setTimeout(() => setRsvpOpen(true), 900);
      return () => clearTimeout(timer);
    }
  }, []);

  // Pull live photos from Drive on mount, then refresh every 15 min.
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    const load = async () => {
      const photos = await fetchLivePhotos(controller.signal);
      if (!cancelled) setLivePhotos(photos);
    };
    load();
    const id = setInterval(load, GALLERY_REFRESH_MS);
    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(id);
    };
  }, []);

  const handleRsvpSubmitted = (data: RsvpData) => {
    setStoredRsvp(data);
  };

  const copyIban = async () => {
    try {
      await navigator.clipboard.writeText(IBAN_VALUE);
      setIbanCopied(true);
      setTimeout(() => setIbanCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleUpload = async (files: FileWithPreview[]) => {
    setUploadStatus('uploading');
    setUploadProgress(0);
    setUploadProgressLabel(`0/${files.length}`);

    const items = files.map(({ base64, bytes, mime, file }) => {
      // The compressor re-encodes to JPEG; rename the source extension so
      // Drive shows a sensible name.
      const baseName = file.name.replace(/\.(heic|heif|png|webp|tiff?|bmp|gif)$/i, '');
      const filename = mime === 'image/jpeg' && !/\.jpe?g$/i.test(baseName)
        ? `${baseName}.jpg`
        : file.name;
      return {
        base64,
        bytes,
        filename: guestName ? `${guestName}_${filename}` : `guest_${filename}`,
        filetype: mime,
      };
    });

    const { successCount } = await uploadPhotos(SCRIPT_URL, items, {
      concurrency: 3,
      onProgress: (p) => {
        setUploadProgress(p.fraction);
        setUploadProgressLabel(`${p.completedFiles}/${p.totalFiles}`);
      },
    });

    if (successCount > 0) {
      setUploadCount((prev) => prev + successCount);
      setUploadStatus('success');
      // Clear the dropzone queue and reload so the new uploads appear in
      // the gallery carousel after the success message has been seen.
      setUploadResetSignal((n) => n + 1);
      setTimeout(() => {
        if (typeof window !== 'undefined') window.location.reload();
      }, 2500);
    } else {
      setUploadStatus('error');
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadProgress(0);
        setUploadProgressLabel('');
      }, 4000);
    }
  };

  const uploadedText =
    uploadCount === 1
      ? t('upload.counted', { n: uploadCount })
      : t('upload.countedPlural', { n: uploadCount });

  return (
    <div className="min-h-dvh overflow-x-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[85dvh] flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={asset('/images/IMG_2283.jpeg')}
            alt="Mónica & Micah"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          {/* Cream wash so type stays legible — 10% lighter than before
              so the photo shows through more, with stronger text contrast below. */}
          <div className="absolute inset-0 bg-gradient-to-b from-cream/45 via-cream/25 to-cream" />
        </div>

        <div className="relative z-10 text-center w-full max-w-md mx-auto space-y-5 py-10">
          {/* Logo */}
          <div className="animate-fade-in-up opacity-0">
            <Image
              src={asset('/images/Logo.png')}
              alt="M&M Wedding Logo"
              width={110}
              height={110}
              className="mx-auto drop-shadow-lg animate-float"
              priority
            />
          </div>

          {/* Names + welcome */}
          <div className="animate-fade-in-up opacity-0 delay-100 space-y-1">
            <h1 className="font-[family-name:var(--font-script)] text-4xl sm:text-5xl text-terracotta leading-tight">
              Mónica & Micah
            </h1>
            <p className="text-sm text-coffee/65 font-medium tracking-wide">
              {t('hero.welcome')}
            </p>
          </div>

          {/* Date · Time · Place */}
          <div className="animate-fade-in-up opacity-0 delay-200">
            <div className="glass rounded-2xl px-5 py-3.5 max-w-xs mx-auto space-y-1">
              <p className="font-[family-name:var(--font-poppins)] text-sm sm:text-base font-semibold text-coffee">
                {t('hero.date')}
              </p>
              <p className="text-xs text-terracotta font-semibold">
                {t('hero.time')}
              </p>
              <p className="text-xs text-sage-dark flex items-start justify-center gap-1.5">
                <svg className="w-3 h-3 mt-0.5 text-sage flex-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span>{t('hero.place')}</span>
              </p>
            </div>
          </div>

          {/* Countdown */}
          <div className="animate-fade-in-up opacity-0 delay-300 space-y-2">
            <p
              className="text-[11px] uppercase tracking-[0.18em] text-coffee font-semibold font-[family-name:var(--font-poppins)] [text-shadow:_0_1px_2px_rgba(251,245,236,0.85)]"
            >
              {t('hero.countdownTitle')}
            </p>
            <CountdownTimer />
          </div>

          {/* Scroll hint */}
          <div className="animate-fade-in-up opacity-0 delay-400 pt-1">
            <a
              href="#rsvp"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-coffee hover:text-terracotta transition-colors [text-shadow:_0_1px_2px_rgba(251,245,236,0.85)]"
            >
              <span>{t('hero.scrollHint')}</span>
              <svg className="w-3.5 h-3.5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ===== WELCOME / INTRO ===== */}
      <section className="px-6 py-10">
        <div className="max-w-sm mx-auto">
          <GlassCard delay={0.1}>
            <div className="text-center space-y-3">
              <p className="font-[family-name:var(--font-script)] text-2xl text-terracotta leading-none">
                {t('welcome.title')}
              </p>
              <h2 className="font-[family-name:var(--font-poppins)] text-base font-semibold text-coffee">
                {t('welcome.headline')}
              </h2>
              <p className="text-xs text-coffee/55 leading-relaxed">{t('welcome.body')}</p>
              <p className="text-xs text-fuchsia-dark font-semibold">{t('welcome.cta')}</p>
              <p className="text-xs text-coffee/55 italic">{t('welcome.signoff')}</p>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ===== RSVP SECTION ===== */}
      <section id="rsvp" className="px-6 py-10 scroll-mt-20">
        <div className="max-w-sm mx-auto space-y-4">
          <div className="text-center space-y-1.5 animate-fade-in-up opacity-0">
            <h2 className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-terracotta">
              💌 {t('rsvp.title')}
            </h2>
            <p className="text-xs text-coffee/55 leading-relaxed px-2">{t('rsvp.subtitle')}</p>
          </div>

          <GlassCard delay={0.1}>
            {storedRsvp ? (
              (() => {
                const primary = storedRsvp.guests[0];
                const partySize = storedRsvp.guests.length;
                const anyAttending = storedRsvp.guests.some((g) => g.attending === 'yes');
                const mealLabel = (m: string) =>
                  m === 'meat'
                    ? t('rsvp.meat')
                    : m === 'fish'
                      ? t('rsvp.fish')
                      : m === 'vegetarian'
                        ? t('rsvp.vegetarian')
                        : '';
                return (
                  <div className="text-center space-y-2">
                    <div className="text-3xl">{anyAttending ? '🎉' : '💛'}</div>
                    <p className="font-[family-name:var(--font-poppins)] text-sm font-semibold text-sage-dark">
                      {t('rsvp.thanks')}
                    </p>
                    <p className="text-xs text-coffee/55">
                      {primary.firstName} {primary.lastName}
                      {partySize > 1 ? ` +${partySize - 1}` : ''} —{' '}
                      {primary.attending === 'yes'
                        ? `${t('rsvp.attending')}${primary.meal ? ' · ' + mealLabel(primary.meal) : ''}`
                        : t('rsvp.notAttending')}
                    </p>
                    {partySize > 1 && (
                      <p className="text-[11px] text-coffee/40">
                        {t('rsvp.partySummary', { n: partySize })}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => setRsvpOpen(true)}
                      className="text-xs text-terracotta hover:text-terracotta-dark font-semibold underline-offset-2 hover:underline transition-colors"
                    >
                      {t('rsvp.edit')}
                    </button>
                  </div>
                );
              })()
            ) : (
              <div className="text-center space-y-3">
                <p className="text-xs text-coffee/55 leading-relaxed">{t('welcome.cta')}</p>
                <button
                  type="button"
                  onClick={() => setRsvpOpen(true)}
                  className="w-full bg-terracotta text-white rounded-xl px-5 py-3 text-sm font-semibold font-[family-name:var(--font-poppins)] shadow-lg shadow-terracotta/20 hover:bg-terracotta-dark active:scale-[0.98] transition-all"
                >
                  {t('rsvp.openButton')}
                </button>
              </div>
            )}
          </GlassCard>
        </div>
      </section>

      {/* ===== DIVIDER ===== */}
      <div className="max-w-[200px] mx-auto">
        <div className="h-px bg-gradient-to-r from-transparent via-terracotta/15 to-transparent" />
      </div>

      {/* ===== UPDATES / BLOG ===== */}
      <section id="updates" className="px-6 py-10 scroll-mt-20">
        <div className="max-w-sm mx-auto space-y-4">
          <div className="text-center space-y-1.5 animate-fade-in-up opacity-0">
            <h2 className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-terracotta">
              📝 {t('updates.title')}
            </h2>
          </div>

          {/* Intro / heads-up post */}
          <GlassCard delay={0.1}>
            <div className="space-y-2">
              <h3 className="font-[family-name:var(--font-poppins)] text-sm font-semibold text-coffee">
                {t('updates.headline')}
              </h3>
              <p className="text-xs text-coffee/60 leading-relaxed">{t('updates.body')}</p>
            </div>
          </GlassCard>

          {/* Beach-hut pre-wedding post */}
          <GlassCard delay={0.2}>
            <div className="space-y-2.5">
              <h3 className="font-[family-name:var(--font-poppins)] text-sm font-semibold text-coffee">
                {t('updates.beachTitle')}
              </h3>
              <div className="space-y-1 text-[11px] text-coffee/55">
                <p className="flex items-center gap-1.5">
                  <span aria-hidden>🗓️</span>
                  <span>{t('updates.beachWhen')}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span aria-hidden>📍</span>
                  <span>{t('updates.beachWhere')}</span>
                </p>
              </div>
              <p className="text-xs text-coffee/60 leading-relaxed pt-1 border-t border-terracotta/10">
                {t('updates.beachBody')}
              </p>
            </div>
          </GlassCard>

          {/* Timeline teaser */}
          <GlassCard delay={0.3}>
            <div className="space-y-2">
              <h3 className="font-[family-name:var(--font-poppins)] text-sm font-semibold text-coffee">
                {t('updates.timelineTitle')}
              </h3>
              <p className="text-xs text-coffee/60 leading-relaxed">{t('updates.timelineBody')}</p>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ===== DIVIDER ===== */}
      <div className="max-w-[200px] mx-auto">
        <div className="h-px bg-gradient-to-r from-transparent via-terracotta/15 to-transparent" />
      </div>

      {/* ===== ITINERARY SECTION ===== */}
      <section id="itinerary" className="px-6 py-10 scroll-mt-20">
        <div className="max-w-sm mx-auto space-y-5">
          <div className="text-center space-y-1.5 animate-fade-in-up opacity-0">
            <h2 className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-terracotta">
              🗓️ {t('day.title')}
            </h2>
            <p className="text-xs text-coffee/50">{t('day.subtitle')}</p>
          </div>

          {/* Timeline is not locked yet — we still render the events so guests
              get a feel for the shape of the day, but blur the times/details
              and overlay a "Coming soon" badge. */}
          <div className="relative">
            <div
              className="relative pl-10 space-y-0 select-none pointer-events-none filter blur-[3px]"
              aria-hidden="true"
            >
              <div className="absolute left-[15px] top-7 bottom-7 w-0.5 bg-gradient-to-b from-terracotta/30 via-fuchsia/20 to-sage/20 rounded-full" />

              {EVENT_KEYS.map((event, i) => (
                <div
                  key={event.key}
                  className="relative pb-4 last:pb-0 animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                >
                  <div
                    className={`absolute -left-10 top-4 w-7 h-7 rounded-full flex items-center justify-center text-sm z-10 ${event.highlight ? 'bg-fuchsia shadow-lg shadow-fuchsia/25 scale-110' : 'glass'
                      }`}
                  >
                    {event.icon}
                  </div>

                  <GlassCard
                    heavy={event.highlight}
                    animate={false}
                    className={`!p-3.5 ${event.highlight ? '!border-fuchsia/15' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-[family-name:var(--font-poppins)] text-sm font-semibold text-coffee">
                          {t(`day.${event.key}.title`)}
                        </h3>
                        <p className="text-xs text-coffee/45 mt-0.5 leading-relaxed">
                          {t(`day.${event.key}.desc`)}
                        </p>
                      </div>
                      <span className="flex-none text-[11px] font-bold text-terracotta bg-terracotta/8 rounded-full px-2 py-0.5 mt-0.5">
                        {event.time}
                      </span>
                    </div>
                  </GlassCard>
                </div>
              ))}
            </div>

            {/* Coming-soon overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="glass-heavy rounded-full px-5 py-2 shadow-lg flex items-center gap-2">
                <span aria-hidden>🔒</span>
                <span className="text-xs font-semibold text-coffee font-[family-name:var(--font-poppins)] tracking-wide">
                  {t('day.tbaBadge')}
                </span>
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] text-coffee/55 pt-1 leading-relaxed">
            {t('day.tbaNote')}
          </p>
        </div>
      </section>

      {/* ===== DIVIDER ===== */}
      <div className="max-w-[200px] mx-auto">
        <div className="h-px bg-gradient-to-r from-transparent via-terracotta/15 to-transparent" />
      </div>

      {/* ===== GIFTS ===== */}
      <section id="gifts" className="px-6 py-10 scroll-mt-20">
        <div className="max-w-sm mx-auto space-y-4">
          <div className="text-center space-y-1.5 animate-fade-in-up opacity-0">
            <h2 className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-terracotta">
              🎁 {t('gifts.title')}
            </h2>
          </div>
          <GlassCard delay={0.1}>
            <div className="space-y-3 text-center">
              <p className="text-xs text-coffee/55 leading-relaxed">{t('gifts.body')}</p>
              <div className="bg-white/50 border border-terracotta/15 rounded-xl px-3 py-3 space-y-1.5">
                <p className="text-xs font-semibold text-coffee">{t('gifts.holder')}</p>
                <p className="text-[11px] font-mono text-coffee/70 break-all">{t('gifts.iban')}</p>
                <button
                  type="button"
                  onClick={copyIban}
                  className="text-[11px] text-terracotta hover:text-terracotta-dark font-semibold transition-colors"
                >
                  {ibanCopied ? `✓ ${t('gifts.copied')}` : `📋 ${t('gifts.copy')}`}
                </button>
              </div>
              <p className="text-xs text-coffee/55 italic">{t('gifts.thanks')}</p>
            </div>
          </GlassCard>

          {/* Questions */}
          <GlassCard delay={0.2}>
            <div className="text-center space-y-2">
              <h3 className="font-[family-name:var(--font-poppins)] text-sm font-semibold text-coffee">
                💬 {t('questions.title')}
              </h3>
              <p className="text-xs text-coffee/55 leading-relaxed">{t('questions.body')}</p>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ===== DIVIDER ===== */}
      <div className="max-w-[200px] mx-auto">
        <div className="h-px bg-gradient-to-r from-transparent via-terracotta/15 to-transparent" />
      </div>

      {/* ===== GALLERY / CAROUSEL SECTION ===== */}
      <section id="gallery" className="py-10 scroll-mt-20">
        <div className="px-6 text-center space-y-1.5 animate-fade-in-up opacity-0 mb-5">
          <h2 className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-terracotta">
            🖼️ {t('gallery.title')}
          </h2>
          <p className="text-xs text-coffee/50">{t('gallery.subtitle')}</p>
        </div>

        <div className="animate-fade-in-up opacity-0 delay-200 px-4">
          {galleryLoading ? (
            <div className="flex gap-3 overflow-hidden pb-2 pl-2 pr-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-none w-[200px] h-[270px] sm:w-[240px] sm:h-[320px] rounded-2xl bg-coffee/5 animate-pulse"
                />
              ))}
            </div>
          ) : galleryEmpty ? (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-coffee/50 text-sm">{t('gallery.empty')}</p>
            </div>
          ) : (
            <PhotoCarousel
              images={galleryImages}
              onImageClick={(i) => setLightboxIndex(i)}
            />
          )}
          {!galleryLoading && !galleryEmpty && (
            <p className="text-center text-[11px] text-coffee/40 mt-2">{t('gallery.live')}</p>
          )}
        </div>

        <div className="text-center px-6 mt-6 animate-fade-in-up opacity-0 delay-300">
          <a
            href={DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-terracotta text-white rounded-xl px-5 py-3 text-sm font-semibold font-[family-name:var(--font-poppins)] shadow-lg shadow-terracotta/20 hover:bg-terracotta-dark active:scale-[0.98] transition-all"
          >
            {t('gallery.viewAll')}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
          <p className="text-[11px] text-coffee/30 mt-2">{t('gallery.noSignin')}</p>
        </div>
      </section>

      {/* ===== DIVIDER ===== */}
      <div className="max-w-[200px] mx-auto">
        <div className="h-px bg-gradient-to-r from-transparent via-terracotta/15 to-transparent" />
      </div>

      {/* ===== UPLOAD SECTION ===== */}
      <section id="upload" className="px-6 py-10 scroll-mt-20">
        <div className="max-w-sm mx-auto space-y-4">
          <div className="text-center space-y-1.5 animate-fade-in-up opacity-0">
            <h2 className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-terracotta">
              📸 {t('upload.title')}
            </h2>
            <p className="text-xs text-coffee/50 leading-relaxed px-2">{t('upload.subtitle')}</p>
          </div>

          <GlassCard delay={0.1}>
            <label className="block text-xs font-medium text-coffee/60 mb-1.5 font-[family-name:var(--font-poppins)]">
              {t('upload.nameLabel')} <span className="text-coffee/30">{t('upload.optional')}</span>
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder={t('upload.namePlaceholder')}
              className="w-full px-4 py-3 rounded-xl bg-white/60 border border-terracotta/15
                text-sm text-coffee placeholder:text-coffee/25
                focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta/30
                transition-all shadow-sm"
            />
          </GlassCard>

          <GlassCard delay={0.2}>
            <PhotoDropzone
              onUpload={handleUpload}
              isUploading={uploadStatus === 'uploading'}
              progress={uploadProgress}
              progressLabel={uploadProgressLabel}
              resetSignal={uploadResetSignal}
            />
          </GlassCard>

          {uploadStatus === 'success' && (
            <div className="glass rounded-2xl p-4 text-center animate-fade-in-up border-sage/30 border">
              <div className="text-2xl mb-1">🎉</div>
              <p className="text-sm font-semibold text-sage-dark font-[family-name:var(--font-poppins)]">
                {t('upload.success')}
              </p>
              <p className="text-xs text-coffee/50 mt-0.5">{t('upload.successDesc')}</p>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="glass rounded-2xl p-4 text-center animate-fade-in-up border-fuchsia/30 border">
              <div className="text-2xl mb-1">😕</div>
              <p className="text-sm font-semibold text-fuchsia-dark font-[family-name:var(--font-poppins)]">
                {t('upload.error')}
              </p>
              <p className="text-xs text-coffee/50 mt-0.5">{t('upload.errorDesc')}</p>
            </div>
          )}

          {uploadCount > 0 && (
            <div className="text-center animate-fade-in">
              <p className="text-xs text-coffee/35">
                {uploadedText.split(String(uploadCount))[0]}
                <span className="font-semibold text-terracotta">{uploadCount}</span>
                {uploadedText.split(String(uploadCount))[1]} 📸
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 px-6 border-t border-terracotta/8">
        <p className="font-[family-name:var(--font-script)] text-xl text-terracotta/40">M & M</p>
        <p className="text-[10px] text-coffee/25 mt-1">{t('footer.tag')}</p>
      </footer>

      {/* Lightbox */}
      {lightboxIndex !== null && galleryImages.length > 0 && (
        <Lightbox
          images={galleryImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* RSVP Modal */}
      <RsvpModal
        open={rsvpOpen}
        onClose={() => setRsvpOpen(false)}
        onSubmitted={handleRsvpSubmitted}
        initial={storedRsvp ?? undefined}
        dismissible
      />
    </div>
  );
}
