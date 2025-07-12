
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from '../constants';

interface VerticalVideoPlayerProps {
    url: string;
    onClose: () => void;
}

type VideoSource = {
    type: 'iframe';
    url: string;
} | {
    type: 'video';
    url: string;
};

const getVideoSource = (videoUrl: string): VideoSource | null => {
    try {
        const url = new URL(videoUrl);
        // YouTube Shorts
        if (url.hostname.includes('youtube.com') && url.pathname.includes('/shorts/')) {
            const videoId = url.pathname.split('/shorts/')[1];
            return {
                type: 'iframe',
                url: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${videoId}`
            };
        }
        // Instagram Reels
        if (url.hostname.includes('instagram.com') && url.pathname.startsWith('/reel/')) {
            return {
                type: 'iframe',
                url: `${url.protocol}//${url.hostname}${url.pathname}embed/`
            };
        }
        // Cloudinary Video
        if (url.hostname.includes('res.cloudinary.com')) {
            return {
                type: 'video',
                url: videoUrl
            };
        }
    } catch (e) {
        console.error("Invalid video URL:", videoUrl, e);
        return null;
    }
    return null; // URL no soportada
};

const VerticalVideoPlayer: React.FC<VerticalVideoPlayerProps> = ({ url, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setModalRoot(document.getElementById('modal-root'));
    }, []);

    const videoSource = useMemo(() => getVideoSource(url), [url]);

    const handleClose = () => {
        setIsVisible(false);
    };

    useEffect(() => {
        if (!modalRoot || !videoSource) return;
        requestAnimationFrame(() => setIsVisible(true));
        
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [modalRoot, videoSource]);

    const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !isVisible) {
            onClose();
        }
    };
    
    if (!modalRoot || !videoSource) return null;

    const wrapperClasses = `fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ease-out ${isVisible ? 'opacity-100 bg-black/80 backdrop-blur-md' : 'opacity-0 bg-black/0 backdrop-blur-none'}`;
    const contentClasses = `relative w-full h-full max-h-[85vh] max-w-[calc(85vh*9/16)] bg-black rounded-2xl shadow-2xl overflow-hidden transition-transform duration-300 ease-out ${isVisible ? 'scale-100' : 'scale-90'}`;

    return createPortal(
        <div
            className={wrapperClasses}
            onTransitionEnd={handleTransitionEnd}
            onClick={handleClose}
            aria-modal="true"
            role="dialog"
        >
            <div className={contentClasses} onClick={e => e.stopPropagation()}>
                {videoSource.type === 'iframe' ? (
                    <iframe
                        src={videoSource.url}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        title="Reproductor de video"
                    ></iframe>
                ) : (
                     <video
                        src={videoSource.url}
                        className="w-full h-full object-contain"
                        autoPlay
                        muted
                        loop
                        playsInline
                        controls
                    >
                        Tu navegador no soporta el tag de video.
                    </video>
                )}
            </div>
             <button
                onClick={handleClose}
                aria-label="Cerrar video"
                className={`absolute top-4 right-4 md:top-6 md:right-6 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white transition-all duration-300 ease-out hover:scale-110 hover:bg-black/80 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
             >
                <XIcon className="h-7 w-7" />
            </button>
        </div>,
        modalRoot
    );
};

export default VerticalVideoPlayer;
