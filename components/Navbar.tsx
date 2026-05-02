'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '../lib/i18n';
import LangToggle from './LangToggle';

export default function Navbar() {
    const { t } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const NAV_LINKS = [
        { href: '#rsvp', label: t('nav.rsvp') },
        { href: '#updates', label: t('nav.updates') },
        { href: '#itinerary', label: t('nav.day') },
        { href: '#gallery', label: t('nav.gallery') },
        { href: '#upload', label: t('nav.upload') },
    ];

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = () => {
        setIsOpen(false);
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'glass-heavy shadow-md'
                    : 'bg-transparent'
                }`}
        >
            <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group" onClick={handleNavClick}>
                    <Image
                        src="/images/Logo.png"
                        alt="M&M Wedding"
                        width={44}
                        height={44}
                        className="rounded-full group-hover:scale-105 transition-transform"
                    />
                    <span className="font-[family-name:var(--font-script)] text-xl text-terracotta hidden sm:inline">
                        M&M
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 text-coffee hover:bg-terracotta/10"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <LangToggle />

                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-full hover:bg-terracotta/10 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <span className={`block w-5 h-0.5 bg-coffee transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
                        <span className={`block w-5 h-0.5 bg-coffee transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
                        <span className={`block w-5 h-0.5 bg-coffee transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="glass-heavy mx-4 mb-3 rounded-2xl p-2">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={handleNavClick}
                            className="block px-4 py-3 rounded-xl text-sm font-medium transition-all text-coffee hover:bg-terracotta/10"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>
            </div>
        </nav>
    );
}
