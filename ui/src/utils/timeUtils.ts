import { find } from 'browser-geo-tz';
import { toZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';

/**
 * Gets the current local time for the given coordinates
 * Returns formatted time string or null if coordinates are invalid
 */
export const getCurrentTimeForLocation = async (latitude: number, longitude: number): Promise<string | null> => {
  try {
    const timezones = await find(latitude, longitude);
    if (timezones.length > 0) {
      const timezone = timezones[0];
      const now = new Date();
      const locationTime = toZonedTime(now, timezone);
      
      // Format as "HH:mm (Timezone)"
      return `${format(locationTime, 'HH:mm')} (${timezone})`;
    } else {
      // Fallback: Calculate local time using longitude approximation
      // Rough approximation: 15° longitude = 1 hour time difference
      const timezoneOffsetHours = longitude / 15;
      const now = new Date();
      const utcHours = now.getUTCHours();
      const utcMinutes = now.getUTCMinutes();
      const localHours = (utcHours + timezoneOffsetHours + 24) % 24; // Handle day wraparound
      const localMinutes = utcMinutes;
      
      // Format time
      const timeStr = `${Math.floor(localHours).toString().padStart(2, '0')}:${localMinutes.toString().padStart(2, '0')}`;
      const offsetStr = timezoneOffsetHours >= 0 ? `+${timezoneOffsetHours.toFixed(1)}` : timezoneOffsetHours.toFixed(1);
      
      return `${timeStr} (UTC${offsetStr})`;
    }
  } catch (error) {
    console.warn('Failed to get time for coordinates, using longitude approximation:', error);
    // Fallback: Calculate local time using longitude approximation
    // Rough approximation: 15° longitude = 1 hour time difference
    const timezoneOffsetHours = longitude / 15;
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const localHours = (utcHours + timezoneOffsetHours + 24) % 24; // Handle day wraparound
    const localMinutes = utcMinutes;
    
    // Format time
    const timeStr = `${Math.floor(localHours).toString().padStart(2, '0')}:${localMinutes.toString().padStart(2, '0')}`;
    const offsetStr = timezoneOffsetHours >= 0 ? `+${timezoneOffsetHours.toFixed(1)}` : timezoneOffsetHours.toFixed(1);
    
    return `${timeStr} (UTC${offsetStr})`;
  }
};

/**
 * Gets just the timezone identifier for the given coordinates
 */
export const getTimezoneForLocation = async (latitude: number, longitude: number): Promise<string | null> => {
  try {
    const timezones = await find(latitude, longitude);
    return timezones.length > 0 ? timezones[0] : null;
  } catch (error) {
    console.warn('Failed to get timezone for coordinates:', error);
    return null;
  }
};