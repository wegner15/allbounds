/**
 * Utility functions for text processing
 */

/**
 * Strips HTML tags from a string and returns plain text
 * @param html - The HTML string to strip
 * @returns Plain text without HTML tags
 */
export function stripHtml(html: string): string {
  if (!html) return '';

  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Get text content which automatically strips HTML tags
  return tempDiv.textContent || tempDiv.innerText || '';
}

/**
 * Truncates text to a specified length and adds ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Strips HTML and truncates text for display in cards
 * @param html - The HTML string to process
 * @param maxLength - Maximum length before truncation (optional)
 * @returns Clean text ready for display
 */
export function cleanTextForDisplay(html: string, maxLength?: number): string {
  const cleanText = stripHtml(html);
  return maxLength ? truncateText(cleanText, maxLength) : cleanText;
}