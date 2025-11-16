'use client';

import React, { useState } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, className = '' }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

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
          <div className="relative aspect-video w-full max-w-2xl rounded-lg overflow-hidden border border-gray-200 cursor-pointer group bg-white"
               onClick={() => openLightbox(0)}>
            <img
              src={images[0]}
              alt="Question image"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        )}

        {images.length === 2 && (
          <div className="grid grid-cols-2 gap-3">
            {images.map((image, index) => (
              <div key={index}
                   className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 cursor-pointer group bg-white"
                   onClick={() => openLightbox(index)}>
                <img
                  src={image}
                  alt={`Question image ${index + 1}`}
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length === 3 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-video col-span-2 rounded-lg overflow-hidden border border-gray-200 cursor-pointer group bg-white"
                 onClick={() => openLightbox(0)}>
              <img
                src={images[0]}
                alt="Question image 1"
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                <ZoomIn className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            {images.slice(1).map((image, index) => (
              <div key={index + 1}
                   className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 cursor-pointer group bg-white"
                   onClick={() => openLightbox(index + 1)}>
                <img
                  src={image}
                  alt={`Question image ${index + 2}`}
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
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
                   className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 cursor-pointer group bg-white"
                   onClick={() => openLightbox(index)}>
                <img
                  src={image}
                  alt={`Question image ${index + 1}`}
                  className="w-full h-full object-contain"
                />
                {index === 3 && images.length > 4 && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      +{images.length - 4}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
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
            className="relative max-w-7xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedImageIndex]}
              alt={`Image ${selectedImageIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
