'use client';

import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadImage, deleteImage, validateImageFile, compressImage } from '@/lib/image-upload';

interface ImageUploadProps {
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  userId: string;
  disabled?: boolean;
}

export interface UploadedImage {
  url: string;
  path: string;
  file?: File;
  preview?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesChange,
  maxImages = 5,
  userId,
  disabled = false
}) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Check max images
    if (images.length + files.length > maxImages) {
      setError(`Maksimal ${maxImages} gambar`);
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    const newImages: UploadedImage[] = [];
    const totalFiles = files.length;
    let completed = 0;

    // Tampilkan preview IMMEDIATELY sebelum upload
    const tempPreviews: UploadedImage[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateImageFile(file);
      if (validation.valid) {
        tempPreviews.push({
          url: '',
          path: '',
          file: file,
          preview: URL.createObjectURL(file)
        });
      }
    }
    
    // Set preview dulu biar langsung keliatan
    setImages([...images, ...tempPreviews]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        // Validate file
        const validation = validateImageFile(file);
        if (!validation.valid) {
          setError(validation.error || 'File tidak valid');
          continue;
        }
        
        // Compress image before upload
        const compressedFile = await compressImage(file);
        
        // Upload to Supabase
        const result = await uploadImage(compressedFile, userId);

        newImages.push({
          url: result.url,
          path: result.path,
          file: file,
          preview: URL.createObjectURL(file)
        });

        // Update progress
        completed++;
        setUploadProgress((completed / totalFiles) * 100);
      } catch (err: any) {
        console.error('Upload error:', err);
        setError(err.message || 'Gagal upload gambar');
      }
    }

    // Update dengan hasil upload yang sebenarnya
    const updatedImages = [...images.slice(0, images.length - tempPreviews.length), ...newImages];
    setImages(updatedImages);
    onImagesChange(updatedImages);
    setUploading(false);
    setUploadProgress(0);
  };

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = images[index];

    try {
      // Delete from Supabase Storage
      await deleteImage(imageToRemove.path);

      // Revoke object URL to free memory
      if (imageToRemove.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      const updatedImages = images.filter((_, i) => i !== index);
      setImages(updatedImages);
      onImagesChange(updatedImages);
    } catch (err: any) {
      console.error('Delete error:', err);
      setError('Gagal menghapus gambar');
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files);
    }
  }, [images, maxImages, userId]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!disabled ? handleButtonClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={(e) => handleImageUpload(e.target.files)}
          className="hidden"
          disabled={disabled || uploading}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          {uploading ? (
            <>
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-600">
                Uploading... {Math.round(uploadProgress)}%
              </p>
            </>
          ) : (
            <>
              <div className="p-3 bg-gray-100 rounded-full">
                <Upload className="w-8 h-8 text-gray-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  Klik atau drag & drop gambar di sini
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, GIF, WebP (Maks. 5MB per file)
                </p>
                <p className="text-xs text-gray-500">
                  Maksimal {maxImages} gambar
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white"
            >
              {(image.preview || image.url) ? (
                <img
                  src={image.preview || image.url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
              )}
              
              {/* Remove Button */}
              {(image.preview || image.url) && (
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="
                    absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full
                    opacity-0 group-hover:opacity-100 transition-opacity
                    hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500
                  "
                  disabled={disabled}
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Image Overlay on Hover (made fully transparent to avoid black box) */}
              <div className="
                absolute inset-0 bg-transparent group-hover:bg-black/10
                transition-all duration-200
              " />
            </div>
          ))}
        </div>
      )}

      {/* Image Counter */}
      {images.length > 0 && (
        <p className="text-sm text-gray-500 text-center">
          {images.length} dari {maxImages} gambar
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
