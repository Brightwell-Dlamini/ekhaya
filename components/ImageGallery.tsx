// components/ImageGallery.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize,
  Minimize,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: string[];
  alt?: string;
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function ImageGallery({
  images,
  alt = 'Property image',
  className,
  autoPlay = true,
  autoPlayInterval = 5000,
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);

  const validImages = images.length > 0 ? images : ['/placeholder-image.jpg'];

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
    setIsLoading(true);
  }, [validImages.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
    setIsLoading(true);
  }, [validImages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape' && isFullscreen) toggleFullscreen();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext, isFullscreen]);

  // Auto-play
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying && validImages.length > 1) {
      interval = setInterval(goToNext, autoPlayInterval);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext, autoPlayInterval, validImages.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
      setIsZoomed(false);
    }
  };

  const toggleZoom = () => setIsZoomed(!isZoomed);
  const toggleAutoPlay = () => setIsAutoPlaying(!isAutoPlaying);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement) setIsZoomed(false);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // If only one image, show it without controls
  if (validImages.length === 1) {
    return (
      <div className={cn('relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800', className)}>
        <img
          src={validImages[0]}
          alt={alt}
          className="w-full h-full object-cover max-h-[600px]"
        />
      </div>
    );
  }

  return (
    <div className={cn('relative group', className)}>
      {/* Main Image */}
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800',
          isFullscreen && 'rounded-none h-screen'
        )}
        style={{ aspectRatio: isFullscreen ? 'auto' : '16/10' }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={validImages[currentIndex]}
            alt={`${alt} ${currentIndex + 1}`}
            className={cn(
              'w-full h-full object-contain transition-all duration-300',
              isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: isZoomed ? 1.5 : 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            onClick={toggleZoom}
          />
        </AnimatePresence>

        {/* Image counter */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-sm font-medium px-3 py-1.5 rounded-full">
          {currentIndex + 1} / {validImages.length}
        </div>

        {/* Navigation Controls */}
        <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={goToPrevious}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={toggleAutoPlay}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors shadow-lg text-xs"
          >
            {isAutoPlaying ? '⏸' : '▶'}
          </button>
          <button
            onClick={toggleZoom}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors shadow-lg"
          >
            {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors shadow-lg"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = validImages[currentIndex];
              link.download = `image-${currentIndex + 1}.jpg`;
              link.click();
            }}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors shadow-lg"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Auto-play progress bar */}
        {isAutoPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
            <motion.div
              className="h-full bg-emerald-500"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{
                duration: autoPlayInterval / 1000,
                ease: 'linear',
                repeat: Infinity,
              }}
            />
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-thin">
        {validImages.map((image, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              setIsLoading(true);
            }}
            className={cn(
              'relative flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden transition-all duration-200',
              currentIndex === index
                ? 'ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/25'
                : 'opacity-60 hover:opacity-100'
            )}
          >
            <img
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
