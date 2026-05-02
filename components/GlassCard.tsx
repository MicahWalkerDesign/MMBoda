'use client';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    heavy?: boolean;
    animate?: boolean;
    delay?: number;
}

export default function GlassCard({
    children,
    className = '',
    heavy = false,
    animate = true,
    delay = 0
}: GlassCardProps) {
    return (
        <div
            className={`
        ${heavy ? 'glass-heavy' : 'glass'} 
        rounded-2xl p-6
        ${animate ? 'animate-fade-in-up opacity-0' : ''}
        ${className}
      `}
            style={delay ? { animationDelay: `${delay}s` } : undefined}
        >
            {children}
        </div>
    );
}
