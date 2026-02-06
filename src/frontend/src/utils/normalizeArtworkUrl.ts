/**
 * Normalizes and validates artwork URLs from now-playing metadata.
 * Handles relative paths, protocol-relative URLs, and ensures HTTPS.
 * 
 * @param rawUrl - The raw artwork URL from the API
 * @returns A validated absolute HTTPS URL, or null if invalid
 */
export function normalizeArtworkUrl(rawUrl: string | undefined | null): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return null;
  }

  const trimmed = rawUrl.trim();
  
  if (!trimmed) {
    return null;
  }

  // Handle protocol-relative URLs (//example.com/path)
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  // Handle relative paths (assume mawalkingradio.app)
  if (trimmed.startsWith('/')) {
    return `https://www.mawalkingradio.app${trimmed}`;
  }

  // Handle absolute URLs
  try {
    const url = new URL(trimmed);
    
    // Only allow HTTPS URLs
    if (url.protocol !== 'https:') {
      console.warn('[normalizeArtworkUrl] Non-HTTPS URL rejected:', trimmed);
      return null;
    }
    
    return url.toString();
  } catch (error) {
    // If URL parsing fails, try treating as relative path
    if (!trimmed.includes('://')) {
      return `https://www.mawalkingradio.app/${trimmed.replace(/^\/+/, '')}`;
    }
    
    console.warn('[normalizeArtworkUrl] Invalid URL:', trimmed, error);
    return null;
  }
}
