import pool from '../config/database';

/**
 * Generate a URL-friendly slug from a string
 */
export const generateSlug = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

/**
 * Generate a unique slug by appending a number if slug already exists
 */
export const generateUniqueSlug = async (
  baseSlug: string,
  tableName: string,
  existingId?: string
): Promise<string> => {
  let slug = generateSlug(baseSlug);
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const query = existingId
      ? `SELECT id FROM public.${tableName} WHERE slug = $1 AND id != $2`
      : `SELECT id FROM public.${tableName} WHERE slug = $1`;
    
    const params = existingId ? [slug, existingId] : [slug];
    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      isUnique = true;
    } else {
      slug = `${generateSlug(baseSlug)}-${counter}`;
      counter++;
    }
  }

  return slug;
};
