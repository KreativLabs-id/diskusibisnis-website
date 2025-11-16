import { supabase } from './supabase';

const BUCKET_NAME = 'question-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

export interface UploadResult {
  url: string;
  path: string;
  publicUrl: string;
}

export interface UploadError {
  message: string;
  code?: string;
}

/**
 * Validate image file before upload
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.'
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'Ukuran file terlalu besar. Maksimal 5MB.'
    };
  }

  return { valid: true };
};

/**
 * Generate unique filename with timestamp and random string
 */
const generateFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${random}.${extension}`;
};

/**
 * Upload image to Supabase Storage
 */
export const uploadImage = async (
  file: File,
  userId: string
): Promise<UploadResult> => {
  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Generate unique filename
    const fileName = generateFileName(file.name);
    const filePath = `${userId}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(error.message || 'Gagal upload gambar');
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath,
      publicUrl: urlData.publicUrl
    };
  } catch (error: any) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Upload multiple images
 */
export const uploadMultipleImages = async (
  files: File[],
  userId: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult[]> => {
  const results: UploadResult[] = [];
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    try {
      const result = await uploadImage(files[i], userId);
      results.push(result);
      
      // Report progress
      if (onProgress) {
        onProgress(((i + 1) / total) * 100);
      }
    } catch (error) {
      console.error(`Failed to upload file ${files[i].name}:`, error);
      // Continue with other files
    }
  }

  return results;
};

/**
 * Delete image from Supabase Storage
 */
export const deleteImage = async (filePath: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      throw new Error(error.message || 'Gagal menghapus gambar');
    }

    return true;
  } catch (error: any) {
    console.error('Error deleting image:', error);
    return false;
  }
};

/**
 * Delete multiple images
 */
export const deleteMultipleImages = async (filePaths: string[]): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePaths);

    if (error) {
      console.error('Delete multiple error:', error);
      throw new Error(error.message || 'Gagal menghapus gambar');
    }

    return true;
  } catch (error: any) {
    console.error('Error deleting multiple images:', error);
    return false;
  }
};

/**
 * Get image URL from path
 */
export const getImageUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return data.publicUrl;
};

/**
 * Compress image before upload (client-side)
 */
export const compressImage = async (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });

            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};
