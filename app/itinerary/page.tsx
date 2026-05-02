'use client';

import GlassCard from '../../components/GlassCard';
import { useI18n } from '../../lib/i18n';

const EVENT_KEYS = [
    { time: '14:00', key: 'e1', icon: '🥂' },
    { time: '15:00', key: 'e2', icon: '💍', highlight: true },
    { time: '16:00', key: 'e3', icon: '🍹' },
    { time: '17:30', key: 'e4', icon: '🍽️' },
    { time: '20:00', key: 'e5', icon: '💃' },
    { time: '00:00', key: 'e6', icon: '🌮' },
];

export default function ItineraryPage() {
    const { t } = useI18n();

    return (
        <div className="min-h-dvh px-4 py-8 max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2 animate-fade-in-up opacity-0">
                <h1 className="font-[family-name:var(--font-poppins)] text-2xl font-semibold text-terracotta">
                    {t('day.title')}
                </h1>
                <p className="text-sm text-coffee/60">{t('day.subtitle')}</p>
            </div>

            <div className="relative pl-8 space-y-0">
                <div className="absolute left-[13px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-terracotta/40 via-fuchsia/30 to-sage/30 rounded-full" />

                {EVENT_KEYS.map((event, i) => (
                    <div
                        key={event.key}
                        className="relative pb-6 last:pb-0 animate-fade-in-up opacity-0"
                        style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                    >
                        <div
                            className={`absolute -left-8 top-6 w-7 h-7 rounded-full flex items-center justify-center text-sm z-10 ${event.highlight
                                    ? 'bg-fuchsia shadow-lg shadow-fuchsia/30 scale-110'
                                    : 'glass'
                                }`}
                        >
                            {event.icon}
                        </div>

                        <GlassCard
                            heavy={event.highlight}
                            animate={false}
                            className={`ml-2 ${event.highlight ? '!border-fuchsia/20' : ''}`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-[family-name:var(--font-poppins)] text-sm font-semibold text-coffee">
                                        {t(`day.${event.key}.title`)}
                                    </h3>
                                    <p className="text-xs text-coffee/50 mt-1 leading-relaxed">
                                        {t(`day.${event.key}.desc`)}
                                    </p>
                                </div>
                                <span className="flex-none text-xs font-semibold text-terracotta bg-terracotta/10 rounded-full px-2.5 py-1">
                                    {event.time}
                                </span>
                            </div>
                        </GlassCard>
                    </div>
                ))}
            </div>

            <GlassCard delay={0.7} className="!p-4 text-center">
                <p className="text-xs text-coffee/50 leading-relaxed">⏰ {t('day.timesNote')}</p>
            </GlassCard>

            <GlassCard delay={0.8}>
                <div className="text-center space-y-2">
                    <span className="text-2xl">📍</span>
                    <h3 className="font-[family-name:var(--font-poppins)] text-sm font-semibold text-coffee">
                        {t('day.venueDetails')}
                    </h3>
                    <p className="text-xs text-coffee/50">{t('day.venueLocation')}</p>
                    <p className="text-[11px] text-coffee/35">{t('day.venueSoon')}</p>
                </div>
            </GlassCard>

            <div className="h-8" />
        </div>
    );
}
