// Avatar will be uploaded via Supabase Storage from frontend
// This file contains helper functions for avatar management

/**
 * Validate avatar URL
 */
export const validateAvatarUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    // Check if it's from Supabase storage or a valid URL
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Sanitize avatar URL
 */
export const sanitizeAvatarUrl = (url: string): string | null => {
  if (!url) return null;
  if (validateAvatarUrl(url)) return url;
  return null;
};
