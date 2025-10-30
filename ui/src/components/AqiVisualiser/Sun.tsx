import { Sky } from "@react-three/drei";
import { useEffect, useState, useCallback, memo } from "react";
import { getTimezoneForLocation } from "../../utils/timeUtils";
import { toZonedTime } from "date-fns-tz";

interface SunProps {
  longitude?: number;
  latitude?: number;
}

export const Sun = memo(function Sun({ longitude, latitude }: SunProps) {
  // Calculate sun position based on time (local or location-based)
  const getSunPosition = useCallback(async () => {
    let timeDecimal: number;

    if (longitude !== undefined && latitude !== undefined) {
      // Get precise timezone for the coordinates
      try {
        const timezone = await getTimezoneForLocation(latitude, longitude);
        if (timezone) {
          const now = new Date();
          const locationTime = toZonedTime(now, timezone);
          const hours = locationTime.getHours();
          const minutes = locationTime.getMinutes();
          timeDecimal = hours + minutes / 60;
        } else {
          // Fallback: Calculate local time using longitude approximation
          // Rough approximation: 15° longitude = 1 hour time difference
          const timezoneOffsetHours = longitude / 15;
          const now = new Date();
          const utcHours = now.getUTCHours();
          const utcMinutes = now.getUTCMinutes();
          const localHours = utcHours + timezoneOffsetHours;
          const localMinutes = utcMinutes;
          timeDecimal = localHours + localMinutes / 60;
        }
      } catch (error) {
        console.warn(
          "Failed to get timezone for coordinates, falling back to longitude approximation:",
          error
        );
        // Fallback: Calculate local time using longitude approximation
        // Rough approximation: 15° longitude = 1 hour time difference
        const timezoneOffsetHours = longitude / 15;
        const now = new Date();
        const utcHours = now.getUTCHours();
        const utcMinutes = now.getUTCMinutes();
        const localHours = utcHours + timezoneOffsetHours;
        const localMinutes = utcMinutes;
        timeDecimal = localHours + localMinutes / 60;
      }
    } else {
      // Use local time (default behavior)
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      timeDecimal = hours + minutes / 60;
    }

    // Calculate sun angle based on time (sunrise ~6am, sunset ~18pm)
    // Map 6-18 hours to 0-180 degrees (sunrise to sunset)
    const sunAngle = ((timeDecimal - 6) / 12) * Math.PI; // 0 to π radians

    // Calculate sun position
    const sunHeight = Math.sin(sunAngle) * 100; // Height varies with sun angle
    const sunDistance = 150; // Distance from origin

    // Allow sun to go below horizon (negative Y values for night time)
    const clampedHeight = Math.max(-50, Math.min(100, sunHeight));

    // Position: x, y, z
    const sunX = Math.cos(sunAngle) * sunDistance;
    const sunY = clampedHeight;
    const sunZ = Math.sin(sunAngle) * sunDistance * 0.3; // Slight Z variation

    return [sunX, sunY, sunZ] as [number, number, number];
  }, [longitude, latitude]);

  const [sunPosition, setSunPosition] = useState<[number, number, number]>([
    0, 100, 100,
  ]);

  // Update sun position every minute and when longitude changes
  useEffect(() => {
    const updateSunPosition = async () => {
      const position = await getSunPosition();
      setSunPosition(position);
    };

    // Update immediately and then every minute
    updateSunPosition();
    const interval = setInterval(updateSunPosition, 60000);

    return () => clearInterval(interval);
  }, [longitude, latitude, getSunPosition]);

  return <Sky sunPosition={sunPosition} azimuth={0.25} />;
});