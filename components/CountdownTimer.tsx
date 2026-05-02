'use client';

import { useState, useEffect } from 'react';

const WEDDING_DATE = new Date('2026-09-25T15:00:00+02:00'); // Salou, Spain (CEST)

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
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

    useEffect(() => {
        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (!timeLeft) {
        return (
            <div className="flex gap-3 justify-center">
                {['Days', 'Hours', 'Min', 'Sec'].map((label) => (
                    <div key={label} className="glass rounded-xl px-3 py-2 min-w-[60px] text-center">
                        <div className="text-xl font-semibold text-terracotta font-[family-name:var(--font-poppins)]">--</div>
                        <div className="text-[10px] uppercase tracking-wider text-coffee/50 mt-0.5">{label}</div>
                    </div>
                ))}
            </div>
        );
    }

    const blocks = [
        { value: timeLeft.days, label: 'Days' },
        { value: timeLeft.hours, label: 'Hours' },
        { value: timeLeft.minutes, label: 'Min' },
        { value: timeLeft.seconds, label: 'Sec' },
    ];

    return (
        <div className="flex gap-2.5 justify-center">
            {blocks.map((block) => (
                <div
                    key={block.label}
                    className="glass rounded-xl px-3 py-2.5 min-w-[62px] text-center transition-all hover:scale-105"
                >
                    <div className="text-xl sm:text-2xl font-semibold text-terracotta font-[family-name:var(--font-poppins)] tabular-nums">
                        {String(block.value).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-coffee/50 mt-0.5 font-medium">
                        {block.label}
                    </div>
                </div>
            ))}
        </div>
    );
}
