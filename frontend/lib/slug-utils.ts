/**
 * Generate URL-friendly slug from text
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        // Replace spaces and special characters with hyphens
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        // Remove leading/trailing hyphens
        .replace(/^-|-$/g, '');
}

/**
 * Generate unique slug by checking database
 */
export async function generateUniqueSlug(
    text: string, 
    checkExistence: (slug: string) => Promise<boolean>
): Promise<string> {
    let baseSlug = generateSlug(text);
    let slug = baseSlug;
    let counter = 1;
    
    // Keep trying until we find a unique slug
    while (await checkExistence(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    
    return slug;
}
