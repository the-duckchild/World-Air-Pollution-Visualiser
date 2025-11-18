import { type JSX, useState, useEffect, useCallback, useRef } from "react";
import { LocationMarkerMap } from "./LocationMarkerMap";
import { MapContainer, TileLayer } from "react-leaflet";
import { latLng, LatLng } from "leaflet";
import { LONDON_COORDS } from "../../utils/constants";
import "leaflet/dist/leaflet.css";

export interface LongLat {
  Longitude: number;
  Latitude: number;
}

export interface MapComponentProps {
  mapVisible: boolean;
  onCoordinatesChange?: (coordinates: LongLat) => void;
  setValue: (name: "Latitude" | "Longitude", value: number) => void;
  initialCoordinates?: LongLat;
}

export function MapComponent({
  mapVisible,
  onCoordinatesChange,
  setValue,
  initialCoordinates,
}: MapComponentProps): JSX.Element {
  // Use initialCoordinates if provided and not 0,0, otherwise use default position
  const hasValidCoordinates = initialCoordinates && 
    (initialCoordinates.Latitude !== 0 || initialCoordinates.Longitude !== 0);
  
  const [position, setPosition] = useState<[number, number]>([
    hasValidCoordinates ? initialCoordinates.Latitude : LONDON_COORDS.Latitude, 
    hasValidCoordinates ? initialCoordinates.Longitude : LONDON_COORDS.Longitude,
  ]);

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update position when initialCoordinates changes
  useEffect(() => {
    if (
      initialCoordinates &&
      (initialCoordinates.Latitude !== 0 || initialCoordinates.Longitude !== 0)
    ) {
      setPosition([initialCoordinates.Latitude, initialCoordinates.Longitude]);
    }
  }, [initialCoordinates]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Auto-submit when map position changes (debounced)
  const handleMapPositionChange = useCallback((pos: LatLng) => {
    setPosition([pos.lat, pos.lng]);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce the API call to avoid excessive requests while dragging
    debounceTimerRef.current = setTimeout(() => {
      const formData: LongLat = {
        Latitude: parseFloat(pos.lat.toFixed(5)),
        Longitude: parseFloat(pos.lng.toFixed(5)),
      };

      if (onCoordinatesChange) {
        onCoordinatesChange(formData);
      }
    }, 500); // Wait 500ms after user stops dragging
  }, [onCoordinatesChange]);

  return (
    <>
      {mapVisible && (
        <div
          key="map"
          style={{
            width: "75vw",
            height: "45vh",
            border: "5px solid #ffffff",
            borderRadius: "25px",
            overflow: "hidden",
          }}
        >
          <MapContainer
            center={{ 
              lat: hasValidCoordinates ? initialCoordinates.Latitude : LONDON_COORDS.Latitude, 
              lng: hasValidCoordinates ? initialCoordinates.Longitude : LONDON_COORDS.Longitude 
            }}
            maxBounds={[
              [-90, -180],
              [90, 180],
            ]}
            maxBoundsViscosity={1}
            minZoom={2.5}
            zoom={hasValidCoordinates ? 7 : 1}
            scrollWheelZoom={true}
            style={{ width: "100%", height: "100%", borderRadius: "25px" }}
          >
        <TileLayer
          id="tileLayer"
          noWrap={true}
          bounds={[
            [-90, -180],
            [90, 180],
          ]}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarkerMap
          position={latLng(position[0], position[1])}
          setPosition={handleMapPositionChange}
          setValue={setValue}
        />
      </MapContainer>
    </div>
      )}
    </>
  );
}
