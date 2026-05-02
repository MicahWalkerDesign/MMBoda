'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useI18n } from '../lib/i18n';

const STORAGE_KEY = 'mm-wedding-rsvp';

// Same Google Apps Script endpoint used by the photo uploader.
// The script can branch on the `type` field to write RSVPs to a sheet.
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwAkmszoeZ_Fz2jpylO3fmNxCCzz2dzQKTezYvAoFvwfNJon4JLQVdGpi0_Bf44Sq0/exec';

export interface RsvpData {
  firstName: string;
  lastName: string;
  attending: 'yes' | 'no';
  meal: 'meat' | 'fish' | 'vegetarian' | '';
  dietary: string;
  message: string;
  submittedAt: string;
}

type Status = 'idle' | 'sending' | 'success' | 'error';

interface RsvpModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitted?: (data: RsvpData) => void;
  initial?: Partial<RsvpData>;
  /** Allow dismissing without submitting (e.g. when re-opened from the page) */
  dismissible?: boolean;
}

export default function RsvpModal({
  open,
  onClose,
  onSubmitted,
  initial,
  dismissible = true,
}: RsvpModalProps) {
  const { t } = useI18n();
  const [firstName, setFirstName] = useState(initial?.firstName ?? '');
  const [lastName, setLastName] = useState(initial?.lastName ?? '');
  const [attending, setAttending] = useState<'yes' | 'no' | ''>(initial?.attending ?? '');
  const [meal, setMeal] = useState<'meat' | 'fish' | 'vegetarian' | ''>(initial?.meal ?? '');
  const [dietary, setDietary] = useState(initial?.dietary ?? '');
  const [message, setMessage] = useState(initial?.message ?? '');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  // Lock scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim() || !attending) {
      setError(t('rsvp.errorRequired'));
      return;
    }
    if (attending === 'yes' && !meal) {
      setError(t('rsvp.errorRequired'));
      return;
    }

    const data: RsvpData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      attending,
      meal: attending === 'yes' ? meal : '',
      dietary: dietary.trim(),
      message: message.trim(),
      submittedAt: new Date().toISOString(),
    };

    setStatus('sending');

    try {
      // Best-effort POST to Apps Script (no-cors -> response is opaque).
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ type: 'rsvp', ...data }),
      });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        /* ignore */
      }
      setStatus('success');
      onSubmitted?.(data);
    } catch {
      setStatus('error');
      setError(t('rsvp.errorSend'));
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-4 py-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rsvp-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-coffee/40 backdrop-blur-sm"
        onClick={() => dismissible && onClose()}
        tabIndex={-1}
      />

      {/* Sheet */}
      <div className="relative glass-heavy rounded-3xl w-full max-w-sm max-h-[92dvh] overflow-y-auto shadow-2xl border border-terracotta/15 animate-fade-in-up">
        <div className="p-5 sm:p-6 space-y-4">
          {status === 'success' ? (
            <div className="text-center space-y-3 py-4">
              <div className="text-4xl">{attending === 'yes' ? '🎉' : '💛'}</div>
              <h2
                id="rsvp-title"
                className="font-[family-name:var(--font-poppins)] text-xl font-semibold text-terracotta"
              >
                {t('rsvp.thanks')}
              </h2>
              <p className="text-sm text-coffee/60 leading-relaxed">
                {attending === 'yes' ? t('rsvp.thanksAttending') : t('rsvp.thanksDeclined')}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 inline-flex items-center justify-center bg-terracotta text-white rounded-xl px-5 py-2.5 text-sm font-semibold font-[family-name:var(--font-poppins)] shadow-md shadow-terracotta/20 hover:bg-terracotta-dark active:scale-[0.98] transition-all"
              >
                ✓
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2
                    id="rsvp-title"
                    className="font-[family-name:var(--font-script)] text-3xl text-terracotta leading-none"
                  >
                    {t('rsvp.title')}
                  </h2>
                  <p className="text-xs text-coffee/55 mt-1.5 leading-relaxed">
                    {t('rsvp.subtitle')}
                  </p>
                </div>
                {dismissible && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="flex-none w-8 h-8 rounded-full hover:bg-terracotta/10 flex items-center justify-center text-coffee/50 hover:text-terracotta transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <form onSubmit={submit} className="space-y-3.5">
                {/* Names */}
                <div className="grid grid-cols-2 gap-2.5">
                  <Field
                    label={t('rsvp.firstName')}
                    value={firstName}
                    onChange={setFirstName}
                    required
                  />
                  <Field
                    label={t('rsvp.lastName')}
                    value={lastName}
                    onChange={setLastName}
                    required
                  />
                </div>

                {/* Attendance */}
                <div>
                  <label className="block text-xs font-medium text-coffee/60 mb-1.5 font-[family-name:var(--font-poppins)]">
                    {t('rsvp.attendance')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Choice
                      active={attending === 'yes'}
                      onClick={() => setAttending('yes')}
                      label={t('rsvp.attending')}
                      icon="✓"
                      tone="sage"
                    />
                    <Choice
                      active={attending === 'no'}
                      onClick={() => setAttending('no')}
                      label={t('rsvp.notAttending')}
                      icon="✕"
                      tone="fuchsia"
                    />
                  </div>
                </div>

                {/* Meal — always visible */}
                <div>
                  <label className="block text-xs font-medium text-coffee/60 mb-1.5 font-[family-name:var(--font-poppins)]">
                    {t('rsvp.meal')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <Choice
                      active={meal === 'meat'}
                      onClick={() => setMeal('meat')}
                      label={t('rsvp.meat')}
                      icon="🥩"
                      tone="terracotta"
                    />
                    <Choice
                      active={meal === 'fish'}
                      onClick={() => setMeal('fish')}
                      label={t('rsvp.fish')}
                      icon="🐟"
                      tone="terracotta"
                    />
                    <Choice
                      active={meal === 'vegetarian'}
                      onClick={() => setMeal('vegetarian')}
                      label={t('rsvp.vegetarian')}
                      icon="🥦"
                      tone="terracotta"
                    />
                  </div>
                </div>

                {/* Dietary */}
                <div>
                  <label className="block text-xs font-medium text-coffee/60 mb-1 font-[family-name:var(--font-poppins)]">
                    {t('rsvp.dietary')}{' '}
                    <span className="text-coffee/30">{t('upload.optional')}</span>
                  </label>
                  <input
                    type="text"
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    placeholder={t('rsvp.dietaryPlaceholder')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/60 border border-terracotta/15 text-sm text-coffee placeholder:text-coffee/25 focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta/30 transition-all shadow-sm"
                  />
                  <p className="text-[11px] text-coffee/40 mt-1 leading-snug">
                    {t('rsvp.dietaryHelp')}
                  </p>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-medium text-coffee/60 mb-1 font-[family-name:var(--font-poppins)]">
                    {t('rsvp.message')}
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('rsvp.messagePlaceholder')}
                    rows={2}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/60 border border-terracotta/15 text-sm text-coffee placeholder:text-coffee/25 focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta/30 transition-all shadow-sm resize-none"
                  />
                </div>

                {error && (
                  <p className="text-[11px] text-fuchsia-dark bg-fuchsia/10 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full bg-terracotta text-white rounded-xl px-5 py-3 text-sm font-semibold font-[family-name:var(--font-poppins)] shadow-lg shadow-terracotta/20 hover:bg-terracotta-dark active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? t('rsvp.sending') : t('rsvp.submit')}
                </button>

                {dismissible && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="block mx-auto text-[11px] text-coffee/40 hover:text-terracotta transition-colors"
                  >
                    {t('rsvp.skip')}
                  </button>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}

function Field({ label, value, onChange, required }: FieldProps) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-coffee/60 mb-1 font-[family-name:var(--font-poppins)]">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3.5 py-2.5 rounded-xl bg-white/60 border border-terracotta/15 text-sm text-coffee placeholder:text-coffee/25 focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta/30 transition-all shadow-sm"
      />
    </label>
  );
}

interface ChoiceProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
  tone: 'sage' | 'fuchsia' | 'terracotta';
}

function Choice({ active, onClick, label, icon, tone }: ChoiceProps) {
  const toneClasses = {
    sage: active
      ? 'bg-sage text-white border-sage shadow-md shadow-sage/25'
      : 'bg-white/60 text-coffee border-sage/20 hover:border-sage/50',
    fuchsia: active
      ? 'bg-fuchsia text-white border-fuchsia shadow-md shadow-fuchsia/25'
      : 'bg-white/60 text-coffee border-fuchsia/20 hover:border-fuchsia/50',
    terracotta: active
      ? 'bg-terracotta text-white border-terracotta shadow-md shadow-terracotta/25'
      : 'bg-white/60 text-coffee border-terracotta/20 hover:border-terracotta/50',
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold font-[family-name:var(--font-poppins)] border transition-all active:scale-[0.97] ${toneClasses}`}
    >
      <span className="text-base leading-none">{icon}</span>
      <span className="leading-tight text-left">{label}</span>
    </button>
  );
}

/** Read RSVP from localStorage (used by the page to know whether to auto-open the modal). */
export function readStoredRsvp(): RsvpData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RsvpData;
  } catch {
    return null;
  }
}

export const RSVP_STORAGE_KEY = STORAGE_KEY;
