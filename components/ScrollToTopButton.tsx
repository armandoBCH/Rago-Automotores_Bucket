
import React, { useState, useEffect } from 'react';
import { UpIcon } from '../constants';

const ScrollToTopButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    const size = 56;
    const strokeWidth = 4;
    const center = size / 2;
    const radius = center - (strokeWidth / 2);
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight;
            const winHeight = window.innerHeight;
            const scrollableHeight = docHeight - winHeight;

            if (scrollableHeight <= 0) {
                 setIsVisible(false);
                 setScrollProgress(0);
                 return;
            }

            const scrollPercent = (scrollTop / scrollableHeight) * 100;

            setIsVisible(scrollTop > 400); // Only show after 400px scroll
            setScrollProgress(scrollPercent > 100 ? 100 : scrollPercent);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const progressOffset = circumference - (scrollProgress / 100) * circumference;
    
    const buttonClasses = `
        fixed bottom-6 right-6 z-50
        w-14 h-14
        transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'}
    `;

    return (
        <button
            onClick={scrollToTop}
            className={buttonClasses}
            aria-label="Volver al inicio"
        >
            <div className="relative w-full h-full group">
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="absolute inset-0 transform -rotate-90"
                >
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        className="text-slate-300/30 dark:text-slate-700/50"
                    />
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={progressOffset}
                        strokeLinecap="round"
                        className="text-rago-burgundy transition-stroke-dashoffset"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-slate-900/90 rounded-full shadow-lg transition-all duration-300 group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:shadow-rago-lg backdrop-blur-sm">
                    <UpIcon className="h-7 w-7 text-rago-burgundy dark:text-slate-200" />
                </div>
            </div>
            <style>{`.transition-stroke-dashoffset { transition: stroke-dashoffset 0.1s linear; }`}</style>
        </button>
    );
};

export default ScrollToTopButton;