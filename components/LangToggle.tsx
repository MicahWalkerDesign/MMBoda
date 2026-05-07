'use client';

import { useI18n, type Lang } from '../lib/i18n';

const OPTIONS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'de', label: 'DE' },
];

export default function LangToggle({ className = '' }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div
      className={`inline-flex items-center bg-white/40 border border-terracotta/15 rounded-full p-0.5 text-[11px] font-semibold font-[family-name:var(--font-poppins)] ${className}`}
      role="group"
      aria-label="Language"
    >
      {OPTIONS.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`px-2.5 py-1 rounded-full transition-all ${
            lang === code
              ? 'bg-terracotta text-white shadow-sm'
              : 'text-coffee/60 hover:text-terracotta'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
