

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '../constants';
import { optimizeUrl } from '../utils/image';
import FullscreenImageViewer from './FullscreenImageViewer';

interface ImageCarouselProps {
    images: string[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoaded, setIsLoaded] = useState(true); // Start as true to prevent initial animation
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    
    const touchStartX = useRef<number | null>(null);
    const touchMoveX = useRef<number | null>(null);

    const currentImage = images?.[currentIndex] || '';

    useEffect(() => {
        // Preload next and previous images for a smoother carousel experience
        if (images.length > 1) {
            const nextIndex = (currentIndex + 1) % images.length;
            const prevIndex = (currentIndex - 1 + images.length) % images.length;
            
            const nextImage = new Image();
            nextImage.src = optimizeUrl(images[nextIndex], { w: 1200, h: 900, fit: 'cover', output: 'webp', q: 80 });

            const prevImage = new Image();
            prevImage.src = optimizeUrl(images[prevIndex], { w: 1200, h: 900, fit: 'cover', output: 'webp', q: 80 });
        }
    }, [currentIndex, images]);
    
    if (!images || images.length === 0) {
        return <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500">No Image</div>
    }

    const changeSlide = (newIndex: number) => {
        if(newIndex === currentIndex) return;
        setIsLoaded(false);
        setTimeout(() => {
            setCurrentIndex(newIndex);
            // The image `onLoad` will set isLoaded back to true
        }, 150); // a small delay to allow fade-out effect
    };

    const goToPrevious = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        const isFirstImage = currentIndex === 0;
        const newIndex = isFirstImage ? images.length - 1 : currentIndex - 1;
        changeSlide(newIndex);
    };

    const goToNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        const isLastImage = currentIndex === images.length - 1;
        const newIndex = isLastImage ? 0 : currentIndex + 1;
        changeSlide(newIndex);
    };

    const goToSlide = (index: number) => {
        changeSlide(index);
    }
    
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
        touchMoveX.current = e.targetTouches[0].clientX;
    };
    
    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStartX.current !== null) {
            touchMoveX.current = e.targetTouches[0].clientX;
        }
    };
    
    const handleTouchEnd = () => {
        if (touchStartX.current === null || touchMoveX.current === null) return;
        
        const deltaX = touchStartX.current - touchMoveX.current;
        const swipeThreshold = 50;
        const tapThreshold = 5;

        if (Math.abs(deltaX) > swipeThreshold) {
            if (deltaX > 0) {
                goToNext();
            } else {
                goToPrevious();
            }
        } else if (Math.abs(deltaX) <= tapThreshold) {
            setIsViewerOpen(true);
        }
        
        touchStartX.current = null;
        touchMoveX.current = null;
    };
    
    const handleImageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (touchStartX.current === null) {
             setIsViewerOpen(true);
        }
    };

    const placeholderUrl = optimizeUrl(currentImage, { w: 40, h: 30, fit: 'cover', blur: 2, output: 'webp' });
    const srcSet = [600, 800, 1200, 1600]
        .map(w => `${optimizeUrl(currentImage, { w, h: Math.round(w * 0.75), fit: 'cover', output: 'webp', q: 80 })} ${w}w`)
        .join(', ');

    return (
        <>
            <div 
                className="relative w-full h-full bg-cover bg-center cursor-zoom-in active:cursor-grabbing overflow-hidden" 
                style={{ backgroundImage: `url(${placeholderUrl})` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleImageClick}
                role="button"
                aria-label="Ampliar imagen"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleImageClick(e as any); }}
            >
                <img
                    key={currentImage}
                    className={`w-full h-full object-cover transition-all duration-500 ease-in-out ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                    src={optimizeUrl(currentImage, { w: 1200, h: 900, fit: 'cover', output: 'webp', q: 80 })}
                    srcSet={srcSet}
                    sizes="(max-width: 1023px) 100vw, 60vw"
                    alt={`Vehicle image ${currentIndex + 1}`}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setIsLoaded(true)}
                />
                {images.length > 1 && (
                    <>
                        <button onClick={goToPrevious} className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white transition-opacity z-10 hidden md:block">
                            <ArrowLeftIcon className="h-6 w-6" />
                        </button>
                        <button onClick={goToNext} className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white transition-opacity z-10 hidden md:block">
                            <ArrowRightIcon className="h-6 w-6" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 transform hover:scale-125 ${currentIndex === index ? 'bg-white scale-125' : 'bg-gray-400/70'}`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
            {isViewerOpen && (
                <FullscreenImageViewer 
                    images={images} 
                    startIndex={currentIndex} 
                    onClose={() => setIsViewerOpen(false)}
                />
            )}
            <style>{`.cursor-zoom-in { cursor: zoom-in; }`}</style>
        </>
    );
};

export default ImageCarousel;