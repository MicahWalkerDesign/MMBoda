'use client';

import { useI18n } from '../lib/i18n';

export default function LangToggle({ className = '' }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div
      className={`inline-flex items-center bg-white/40 border border-terracotta/15 rounded-full p-0.5 text-[11px] font-semibold font-[family-name:var(--font-poppins)] ${className}`}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        className={`px-2.5 py-1 rounded-full transition-all ${
          lang === 'en' ? 'bg-terracotta text-white shadow-sm' : 'text-coffee/60 hover:text-terracotta'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('es')}
        aria-pressed={lang === 'es'}
        className={`px-2.5 py-1 rounded-full transition-all ${
          lang === 'es' ? 'bg-terracotta text-white shadow-sm' : 'text-coffee/60 hover:text-terracotta'
        }`}
      >
        ES
      </button>
    </div>
  );
}
