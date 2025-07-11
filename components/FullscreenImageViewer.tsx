import React, { useEffect, useCallback, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XIcon, ArrowLeftIcon, ArrowRightIcon } from '../constants';
import { optimizeUrl } from '../utils/image';

interface FullscreenImageViewerProps {
    images: string[];
    startIndex: number;
    onClose: () => void;
}

const LoadingSpinner = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
        <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

const FullscreenImageViewer: React.FC<FullscreenImageViewerProps> = ({ images, startIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

    const touchStartX = useRef<number | null>(null);
    
    useEffect(() => {
        setModalRoot(document.getElementById('modal-root'));
    }, []);

    const handleClose = useCallback(() => {
        setIsVisible(false);
    }, []);

    const goToPrevious = useCallback(() => {
        if (images.length <= 1) return;
        setIsLoaded(false);
        setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images.length]);

    const goToNext = useCallback(() => {
        if (images.length <= 1) return;
        setIsLoaded(false);
        setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    }, [images.length]);

    useEffect(() => {
        if (!modalRoot) return;

        requestAnimationFrame(() => setIsVisible(true));
        
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
            if (e.key === 'ArrowLeft') goToPrevious();
            if (e.key === 'ArrowRight') goToNext();
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [modalRoot, handleClose, goToPrevious, goToNext]);

    useEffect(() => {
        setIsLoaded(false);
        const currentImageSrc = optimizeUrl(images[currentIndex], { fit: 'contain', w: 1920, output: 'webp' });
        const img = new Image();
        img.src = currentImageSrc;
        img.onload = () => setIsLoaded(true);
        
        if (images.length > 1) {
            const nextIndex = (currentIndex + 1) % images.length;
            const nextImage = new Image();
            nextImage.src = optimizeUrl(images[nextIndex], { fit: 'contain', w: 1920, output: 'webp' });
        }
    }, [currentIndex, images]);

    const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !isVisible) {
            onClose();
        }
    };
    
    const handleTouchStart = (e: React.TouchEvent) => touchStartX.current = e.targetTouches[0].clientX;
    
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const touchEndX = e.changedTouches[0].clientX;
        const deltaX = touchStartX.current - touchEndX;
        const swipeThreshold = 50;

        if (Math.abs(deltaX) > swipeThreshold) {
            if (deltaX > 0) goToNext();
            else goToPrevious();
        }
        touchStartX.current = null;
    };

    const currentImage = images[currentIndex];
    const wrapperClasses = `fixed inset-0 z-[200] select-none transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`;
    const contentClasses = `w-full h-full transition-transform duration-300 ease-out ${isVisible ? 'scale-100' : 'scale-95'}`;

    const viewerContent = (
        <div
            className={wrapperClasses}
            onTransitionEnd={handleTransitionEnd}
            aria-modal="true"
            role="dialog"
        >
            {/* --- DESKTOP VIEW --- */}
            <div className="hidden md:flex fixed inset-0 bg-black/90">
                <div className={contentClasses + " flex"}>
                    {/* Thumbnails */}
                    <div className="w-24 flex-shrink-0 bg-black/50 overflow-y-auto p-2 space-y-2 thumbnail-scrollbar">
                        {images.map((img, index) => (
                            <button key={index} onClick={() => setCurrentIndex(index)} className={`w-full aspect-[4/3] rounded-md overflow-hidden transition-all ring-offset-2 ring-offset-black ${currentIndex === index ? 'ring-2 ring-white' : 'opacity-60 hover:opacity-100'}`}>
                                <img
                                    src={optimizeUrl(img, { w: 100, h: 75, fit: 'cover', output: 'webp' })}
                                    alt={`Miniatura ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>

                    {/* Main Content */}
                    <div className="flex-grow h-full w-full flex items-center justify-center relative p-4">
                        <div className="absolute top-4 right-4 flex items-center gap-4 text-white z-10">
                            <span className="font-mono text-lg select-none">{currentIndex + 1} / {images.length}</span>
                            <button onClick={handleClose} aria-label="Cerrar visor" className="hover:opacity-75 transition-opacity">
                                <XIcon className="h-9 w-9" />
                            </button>
                        </div>
                        
                        <div className="w-full h-full flex items-center justify-center">
                             {!isLoaded && <LoadingSpinner />}
                            <img
                                key={currentImage + '-desktop'}
                                src={optimizeUrl(currentImage, { fit: 'contain', w: 1920, h: 1080, output: 'webp' })}
                                alt={`Vehículo - Imagen ${currentIndex + 1}`}
                                className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                            />
                        </div>

                        {images.length > 1 && (
                            <>
                                <button onClick={goToPrevious} className="absolute left-5 top-1/2 -translate-y-1/2 p-3 bg-black/30 text-white rounded-full hover:bg-black/50 transition-all" aria-label="Imagen anterior">
                                    <ArrowLeftIcon className="h-8 w-8" />
                                </button>
                                <button onClick={goToNext} className="absolute right-5 top-1/2 -translate-y-1/2 p-3 bg-black/30 text-white rounded-full hover:bg-black/50 transition-all" aria-label="Siguiente imagen">
                                    <ArrowRightIcon className="h-8 w-8" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* --- MOBILE VIEW --- */}
            <div className="md:hidden fixed inset-0 bg-black flex flex-col">
                 <div className={contentClasses + " flex flex-col h-full"}>
                    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white z-10 bg-gradient-to-b from-black/60 to-transparent">
                        <button onClick={handleClose} aria-label="Volver" className="p-2 -ml-2">
                            <ArrowLeftIcon className="h-7 w-7" />
                        </button>
                        <span className="font-mono text-lg">{currentIndex + 1} / {images.length}</span>
                        <div className="w-9 h-9"></div> {/* Spacer to balance title */}
                    </div>
                    
                    <div 
                        className="flex-grow flex items-center justify-center h-full w-full"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        {!isLoaded && <LoadingSpinner />}
                        <img
                            key={currentImage + '-mobile'}
                            src={optimizeUrl(currentImage, { fit: 'contain', w: 1080, output: 'webp' })}
                            alt={`Vehículo - Imagen ${currentIndex + 1}`}
                            className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                        />
                    </div>
                    
                    {images.length > 1 && (
                        <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center items-center h-20 bg-gradient-to-t from-black/60 to-transparent">
                            <div className="flex space-x-2.5">
                                {images.map((_, index) => (
                                    <div key={index} className={`h-2 w-2 rounded-full transition-colors duration-300 ${currentIndex === index ? 'bg-white' : 'bg-white/50'}`}></div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                .thumbnail-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .thumbnail-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.2);
                }
                .thumbnail-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(255,255,255,0.4);
                    border-radius: 4px;
                }
                .thumbnail-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(255,255,255,0.6);
                }
            `}</style>
        </div>
    );

    if (!modalRoot) {
        return null;
    }

    return createPortal(viewerContent, modalRoot);
};

export default FullscreenImageViewer;