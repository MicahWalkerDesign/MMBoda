'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '../lib/i18n';

const WEDDING_DATE = new Date('2026-09-25T14:00:00+02:00'); // INFINITUM Beach Club, Salou, Spain (CEST)

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

function calculateTimeLeft(): TimeLeft {
    const now = new Date();
    const diff = WEDDING_DATE.getTime() - now.getTime();

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
    };
}

export default function CountdownTimer() {
    const { t } = useI18n();
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

    useEffect(() => {
        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const labels = [
        t('countdown.days'),
        t('countdown.hours'),
        t('countdown.minutes'),
        t('countdown.seconds'),
    ];

    if (!timeLeft) {
        return (
            <div className="flex gap-2 sm:gap-2.5 justify-center">
                {labels.map((label) => (
                    <div key={label} className="glass rounded-xl px-2.5 py-2 min-w-[58px] sm:min-w-[64px] text-center">
                        <div className="text-lg sm:text-2xl font-semibold text-terracotta font-[family-name:var(--font-poppins)]">--</div>
                        <div className="text-[10px] uppercase tracking-wider text-coffee/50 mt-0.5">{label}</div>
                    </div>
                ))}
            </div>
        );
    }

    const blocks = [
        { value: timeLeft.days, label: labels[0] },
        { value: timeLeft.hours, label: labels[1] },
        { value: timeLeft.minutes, label: labels[2] },
        { value: timeLeft.seconds, label: labels[3] },
    ];

    return (
        <div className="flex gap-2 sm:gap-2.5 justify-center">
            {blocks.map((block) => (
                <div
                    key={block.label}
                    className="glass rounded-xl px-2.5 py-2 sm:py-2.5 min-w-[58px] sm:min-w-[64px] text-center transition-all hover:scale-105"
                >
                    <div className="text-lg sm:text-2xl font-semibold text-terracotta font-[family-name:var(--font-poppins)] tabular-nums">
                        {String(block.value).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-coffee/55 mt-0.5 font-medium">
                        {block.label}
                    </div>
                </div>
            ))}
        </div>
    );
}
