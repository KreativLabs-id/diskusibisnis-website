'use client';

import React, { useState } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

// Generic blur placeholder - a light gray SVG
const shimmerBlur = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=';

interface ImageGalleryProps {
  images: string[];
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, className = '' }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  if (!images || images.length === 0) {
    return null;
  }

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
  };

  const goToPrevious = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  return (
    <>
      {/* Image Grid */}
      <div className={`grid gap-3 ${className}`}>
        {images.length === 1 && (
          <div className="relative aspect-video w-full max-w-2xl rounded-lg overflow-hidden border border-gray-200 cursor-pointer group bg-slate-100"
            onClick={() => openLightbox(0)}>
            <Image
              src={images[0]}
              alt="Question image"
              fill
              className={`object-contain transition-opacity duration-300 ${loadedImages.has(0) ? 'opacity-100' : 'opacity-0'}`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority /* First image should load with priority */
              placeholder="blur"
              blurDataURL={shimmerBlur}
              onLoad={() => setLoadedImages(prev => new Set(prev).add(0))}
            />
            <div className="absolute inset-0 bg-transparent group-hover:bg-black/20 transition-all flex items-center justify-center z-10">
              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        )}

        {images.length === 2 && (
          <div className="grid grid-cols-2 gap-3">
            {images.map((image, index) => (
              <div key={index}
                className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 cursor-pointer group bg-slate-100"
                onClick={() => openLightbox(index)}>
                <Image
                  src={image}
                  alt={`Question image ${index + 1}`}
                  fill
                  className={`object-contain transition-opacity duration-300 ${loadedImages.has(index) ? 'opacity-100' : 'opacity-0'}`}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={index === 0}
                  placeholder="blur"
                  blurDataURL={shimmerBlur}
                  onLoad={() => setLoadedImages(prev => new Set(prev).add(index))}
                />
                <div className="absolute inset-0 bg-transparent group-hover:bg-black/20 transition-all flex items-center justify-center z-10">
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length === 3 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-video col-span-2 rounded-lg overflow-hidden border border-gray-200 cursor-pointer group bg-slate-100"
              onClick={() => openLightbox(0)}>
              <Image
                src={images[0]}
                alt="Question image 1"
                fill
                className={`object-contain transition-opacity duration-300 ${loadedImages.has(0) ? 'opacity-100' : 'opacity-0'}`}
                sizes="(max-width: 768px) 100vw, 66vw"
                priority
                placeholder="blur"
                blurDataURL={shimmerBlur}
                onLoad={() => setLoadedImages(prev => new Set(prev).add(0))}
              />
              <div className="absolute inset-0 bg-transparent group-hover:bg-black/20 transition-all flex items-center justify-center z-10">
                <ZoomIn className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            {images.slice(1).map((image, index) => (
              <div key={index + 1}
                className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 cursor-pointer group bg-slate-100"
                onClick={() => openLightbox(index + 1)}>
                <Image
                  src={image}
                  alt={`Question image ${index + 2}`}
                  fill
                  className={`object-contain transition-opacity duration-300 ${loadedImages.has(index + 1) ? 'opacity-100' : 'opacity-0'}`}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  placeholder="blur"
                  blurDataURL={shimmerBlur}
                  onLoad={() => setLoadedImages(prev => new Set(prev).add(index + 1))}
                />
                <div className="absolute inset-0 bg-transparent group-hover:bg-black/20 transition-all flex items-center justify-center z-10">
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length >= 4 && (
          <div className="grid grid-cols-2 gap-3">
            {images.slice(0, 4).map((image, index) => (
              <div key={index}
                className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 cursor-pointer group bg-slate-100"
                onClick={() => openLightbox(index)}>
                <Image
                  src={image}
                  alt={`Question image ${index + 1}`}
                  fill
                  className={`object-contain transition-opacity duration-300 ${loadedImages.has(index) ? 'opacity-100' : 'opacity-0'}`}
                  sizes="(max-width: 768px) 50vw, 33vw"
                  priority={index === 0}
                  placeholder="blur"
                  blurDataURL={shimmerBlur}
                  onLoad={() => setLoadedImages(prev => new Set(prev).add(index))}
                />
                {index === 3 && images.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                    <span className="text-white text-2xl font-bold">
                      +{images.length - 4}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-transparent group-hover:bg-black/20 transition-all flex items-center justify-center z-10">
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-white bg-opacity-30 hover:bg-opacity-50 rounded-full transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Previous Button */}
          {selectedImageIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute left-4 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-colors z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Next Button */}
          {selectedImageIndex < images.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-4 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-white bg-opacity-30 rounded-full">
            <span className="text-white text-sm font-medium">
              {selectedImageIndex + 1} / {images.length}
            </span>
          </div>

          {/* Image */}
          <div
            className="relative max-w-7xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[selectedImageIndex]}
              alt={`Image ${selectedImageIndex + 1}`}
              width={1920}
              height={1080}
              className="max-w-full max-h-[90vh] object-contain rounded-lg w-auto h-auto"
              quality={90}
              priority
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
