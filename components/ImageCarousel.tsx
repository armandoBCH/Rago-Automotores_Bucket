
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, PlayIcon } from '../constants';
import { optimizeUrl } from '../utils/image';
import FullscreenImageViewer from './FullscreenImageViewer';

interface ImageCarouselProps {
    images: string[];
    videoUrl?: string | null;
    onPlayVideo: (url: string) => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, videoUrl, onPlayVideo }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoaded, setIsLoaded] = useState(true); // Start as true to prevent initial animation
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    
    const touchStartX = useRef<number | null>(null);
    const touchMoveX = useRef<number | null>(null);

    const hasVideo = !!videoUrl;
    const totalItems = images.length + (hasVideo ? 1 : 0);
    const displayItems = hasVideo ? ['video', ...images] : images;
    
    const currentItem = displayItems[currentIndex];
    const isVideoSlide = hasVideo && currentIndex === 0;

    useEffect(() => {
        if (images.length > 1) {
            const nextImageIndex = (currentIndex + 1) % images.length;
            const prevImageIndex = (currentIndex - 1 + images.length) % images.length;
            
            const nextImage = new Image();
            nextImage.src = optimizeUrl(images[nextImageIndex], { w: 1200, h: 900, fit: 'cover', output: 'webp', q: 80 });

            const prevImage = new Image();
            prevImage.src = optimizeUrl(images[prevImageIndex], { w: 1200, h: 900, fit: 'cover', output: 'webp', q: 80 });
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
        }, 150); 
    };

    const goToPrevious = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        const newIndex = currentIndex === 0 ? totalItems - 1 : currentIndex - 1;
        changeSlide(newIndex);
    };

    const goToNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        const newIndex = currentIndex === totalItems - 1 ? 0 : currentIndex + 1;
        changeSlide(newIndex);
    };

    const goToSlide = (index: number) => changeSlide(index);
    
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
        touchMoveX.current = e.targetTouches[0].clientX;
    };
    
    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStartX.current !== null) touchMoveX.current = e.targetTouches[0].clientX;
    };
    
    const handleTouchEnd = () => {
        if (touchStartX.current === null || touchMoveX.current === null) return;
        
        const deltaX = touchStartX.current - touchMoveX.current;
        const swipeThreshold = 50;
        const tapThreshold = 5;

        if (Math.abs(deltaX) > swipeThreshold) {
            if (deltaX > 0) goToNext();
            else goToPrevious();
        } else if (Math.abs(deltaX) <= tapThreshold) {
            handleSlideClick();
        }
        
        touchStartX.current = null;
        touchMoveX.current = null;
    };
    
    const handleSlideClick = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (touchStartX.current !== null) return; // Prevent click on swipe end
        if (isVideoSlide && videoUrl) {
            onPlayVideo(videoUrl);
        } else {
            setIsViewerOpen(true);
        }
    };
    
    const imageToDisplay = isVideoSlide ? images[0] : currentItem;
    const placeholderUrl = optimizeUrl(imageToDisplay, { w: 40, h: 30, fit: 'cover', blur: 2, output: 'webp' });
    const srcSet = [600, 800, 1200, 1600]
        .map(w => `${optimizeUrl(imageToDisplay, { w, h: Math.round(w * 0.75), fit: 'cover', output: 'webp', q: 80 })} ${w}w`)
        .join(', ');

    return (
        <>
            <div 
                className="relative w-full h-full bg-cover bg-center active:cursor-grabbing overflow-hidden" 
                style={{ backgroundImage: `url(${placeholderUrl})` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleSlideClick}
                role="button"
                aria-label={isVideoSlide ? "Reproducir video" : "Ampliar imagen"}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSlideClick(e as any); }}
            >
                <img
                    key={imageToDisplay}
                    className={`w-full h-full object-cover transition-all duration-500 ease-in-out ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                    src={optimizeUrl(imageToDisplay, { w: 1200, h: 900, fit: 'cover', output: 'webp', q: 80 })}
                    srcSet={srcSet}
                    sizes="(max-width: 1023px) 100vw, 60vw"
                    alt={`Vehicle image ${currentIndex + 1}`}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setIsLoaded(true)}
                />
                
                {isVideoSlide && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                        <div className="w-20 h-20 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-full text-white border-2 border-white/50 transition-transform duration-300 transform scale-100 group-hover:scale-110">
                            <PlayIcon className="w-10 h-10 ml-1" />
                        </div>
                    </div>
                )}
                
                {totalItems > 1 && (
                    <>
                        <button onClick={goToPrevious} className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white transition-opacity z-10 hidden md:block">
                            <ArrowLeftIcon className="h-6 w-6" />
                        </button>
                        <button onClick={goToNext} className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white transition-opacity z-10 hidden md:block">
                            <ArrowRightIcon className="h-6 w-6" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                            {displayItems.map((_, index) => (
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
                    startIndex={hasVideo ? currentIndex -1 : currentIndex} 
                    onClose={() => setIsViewerOpen(false)}
                />
            )}
        </>
    );
};

export default ImageCarousel;