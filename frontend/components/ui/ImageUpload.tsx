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

  const handleImageUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Check max images - use current state via functional update
    if (images.length + files.length > maxImages) {
      setError(`Maksimal ${maxImages} gambar`);
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    const totalFiles = files.length;
    let completed = 0;

    // Buat preview sementara untuk file yang valid
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

    // Simpan jumlah gambar yang sudah ada SEBELUM preview ditambah
    const existingCount = images.length;

    // Tambahkan preview ke state yang ADA (bukan replace)
    setImages(prev => [...prev, ...tempPreviews]);

    // Upload satu per satu
    const newImages: UploadedImage[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
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

        completed++;
        setUploadProgress((completed / totalFiles) * 100);
      } catch (err: any) {
        console.error('Upload error:', err);
        setError(err.message || 'Gagal upload gambar');
      }
    }

    // Ganti temp previews dengan hasil upload yang sebenarnya
    const finalImages = [...images, ...newImages];
    setImages(finalImages);
    onImagesChange(finalImages);

    setUploading(false);
    setUploadProgress(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, maxImages, userId, onImagesChange]);


  const handleRemoveImage = async (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
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
  }, [handleImageUpload]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          relative border border-dashed rounded-xl p-3.5 sm:p-4 transition-colors
          ${dragActive ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-400 dark:hover:border-slate-600'}
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

        <div className="flex items-center justify-center gap-2.5">
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Mengunggah... {Math.round(uploadProgress)}%
              </p>
            </>
          ) : (
            <>
              <div className="p-1.5 bg-slate-200/70 dark:bg-slate-800 rounded-lg shrink-0">
                <Upload className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Pilih atau seret gambar
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-1.5">
                  (Maks. {maxImages} file, 5MB)
                </span>
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
                  type="button"
                  onClick={(e) => handleRemoveImage(e, index)}
                  className="
                    absolute top-1.5 right-1.5 p-1.5 bg-slate-900/60 hover:bg-red-500 text-white rounded-full
                    backdrop-blur-sm transition-all z-10
                    focus:outline-none focus:ring-2 focus:ring-red-500
                  "
                  disabled={disabled || uploading}
                >
                  <X className="w-3.5 h-3.5" />
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
