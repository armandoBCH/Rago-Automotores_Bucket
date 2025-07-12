

import React from 'react';
import { Vehicle } from '../types';
import { WhatsAppIcon, FacebookIcon, ShareIcon } from '../constants';
import { trackEvent } from '../lib/analytics';

interface SocialShareButtonsProps {
    vehicle: Vehicle;
}

const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({ vehicle }) => {
    if (vehicle.is_sold) {
        return null;
    }

    const shareUrl = window.location.href;
    const title = `${vehicle.make} ${vehicle.model} (${vehicle.year})`;
    const text = `¡Mira este ${title} en Rago Automotores! Precio: $${vehicle.price.toLocaleString('es-AR')}.`;

    const shareTargets = [
        {
            name: 'WhatsApp',
            icon: <WhatsAppIcon className="h-6 w-6" />,
            url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${shareUrl}`)}`,
            colorClass: 'text-white bg-[#25D366] hover:bg-[#1DAE58]',
        },
        {
            name: 'Facebook',
            icon: <FacebookIcon className="h-6 w-6" />,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            colorClass: 'text-white bg-[#1877F2] hover:bg-[#166FE5]',
        },
    ];

    const handleShareClick = () => {
        trackEvent('click_share_vehicle', vehicle.id);
    };

    const handleNativeShare = async () => {
        handleShareClick();
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: text,
                    url: shareUrl,
                });
            } catch (error) {
                console.error('Error al compartir:', error);
            }
        }
    };
    
    // The native share button should only be visible if supported
    const showNativeShare = typeof navigator !== 'undefined' && !!navigator.share;


    return (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <h4 className="text-base font-semibold text-gray-600 dark:text-gray-400 mb-3 text-center lg:text-left">Compartir en:</h4>
            <div className="flex items-center justify-center lg:justify-start gap-3 flex-wrap">
                {shareTargets.map(({ name, icon, url, colorClass }) => (
                     <a
                        key={name}
                        href={url}
                        onClick={handleShareClick}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Compartir en ${name}`}
                        className={`group w-12 h-12 flex items-center justify-center rounded-full ${colorClass} transition-all duration-300 transform hover:scale-110`}
                    >
                        {icon}
                    </a>
                ))}
                {showNativeShare && (
                     <button
                        onClick={handleNativeShare}
                        aria-label="Más opciones para compartir"
                        className="group w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rago-burgundy hover:text-white transition-all duration-300 transform hover:scale-110"
                    >
                        <ShareIcon className="h-6 w-6" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default SocialShareButtons;