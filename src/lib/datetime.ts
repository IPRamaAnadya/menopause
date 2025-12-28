/**
 * DateTime utility functions for timezone handling
 * 
 * Convention:
 * - Server/API always stores and works with UTC time
 * - Client sends local time, which is converted to UTC before API calls
 * - API returns UTC time, which is converted to local time for display
 */

/**
 * Convert a local date/time to UTC ISO string for API submission
 * @param date Date object, ISO string, or string from datetime-local input
 * @returns UTC ISO string (e.g., "2024-01-15T10:30:00.000Z")
 */
export function toUTC(date: Date | string | null | undefined): string | undefined {
  if (!date) return undefined;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      console.warn('[DateTime] Invalid date provided:', date);
      return undefined;
    }
    
    return dateObj.toISOString();
  } catch (error) {
    console.error('[DateTime] Error converting to UTC:', error);
    return undefined;
  }
}

/**
 * Convert UTC date/time from API to local Date object
 * @param utcDate UTC date string from API
 * @returns Local Date object
 */
export function toLocalDate(utcDate: string | Date | null | undefined): Date | null {
  if (!utcDate) return null;
  
  try {
    const dateObj = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
    
    if (isNaN(dateObj.getTime())) {
      console.warn('[DateTime] Invalid UTC date provided:', utcDate);
      return null;
    }
    
    return dateObj;
  } catch (error) {
    console.error('[DateTime] Error converting to local:', error);
    return null;
  }
}

/**
 * Format UTC date from API to local datetime-local input format (YYYY-MM-DDTHH:mm)
 * Used for populating datetime-local input fields
 * @param utcDate UTC date string from API
 * @returns Local datetime string in YYYY-MM-DDTHH:mm format
 */
export function toLocalInputValue(utcDate: string | Date | null | undefined): string {
  const localDate = toLocalDate(utcDate);
  if (!localDate) return '';
  
  try {
    // Format: YYYY-MM-DDTHH:mm
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('[DateTime] Error formatting for input:', error);
    return '';
  }
}

/**
 * Format date for display in user's locale
 * @param date Date to format
 * @param options Intl.DateTimeFormatOptions
 * @param locale Locale string (defaults to browser locale)
 * @returns Formatted date string
 */
export function formatLocalDate(
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  locale?: string
): string {
  const localDate = toLocalDate(date);
  if (!localDate) return '';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };
  
  try {
    return localDate.toLocaleString(locale, defaultOptions);
  } catch (error) {
    console.error('[DateTime] Error formatting date:', error);
    return '';
  }
}

/**
 * Format date without time for display
 * @param date Date to format
 * @param locale Locale string (defaults to browser locale)
 * @returns Formatted date string (e.g., "January 15, 2024")
 */
export function formatLocalDateOnly(
  date: string | Date | null | undefined,
  locale?: string
): string {
  return formatLocalDate(date, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: undefined,
    minute: undefined,
  }, locale);
}

/**
 * Format time only for display
 * @param date Date to format
 * @param locale Locale string (defaults to browser locale)
 * @returns Formatted time string (e.g., "10:30 AM")
 */
export function formatLocalTimeOnly(
  date: string | Date | null | undefined,
  locale?: string
): string {
  return formatLocalDate(date, {
    hour: '2-digit',
    minute: '2-digit',
    year: undefined,
    month: undefined,
    day: undefined,
  }, locale);
}

/**
 * Get current UTC time as ISO string
 * @returns Current UTC time in ISO format
 */
export function nowUTC(): string {
  return new Date().toISOString();
}

/**
 * Check if a date is in the past (compared to current UTC time)
 * @param date Date to check
 * @returns True if date is in the past
 */
export function isPast(date: string | Date | null | undefined): boolean {
  const localDate = toLocalDate(date);
  if (!localDate) return false;
  return localDate.getTime() < Date.now();
}

/**
 * Check if a date is in the future (compared to current UTC time)
 * @param date Date to check
 * @returns True if date is in the future
 */
export function isFuture(date: string | Date | null | undefined): boolean {
  const localDate = toLocalDate(date);
  if (!localDate) return false;
  return localDate.getTime() > Date.now();
}
