import { useMapEvents, Marker, Tooltip } from 'react-leaflet'
import { LatLng, type LeafletMouseEvent  } from 'leaflet'
import { type UseFormSetValue } from "react-hook-form";
import 'leaflet/dist/leaflet.css';


type LocationMarkerProps = {
  position: LatLng;
  setPosition: (position: LatLng) => void;
  setValue: UseFormSetValue<{
    Latitude: number;
    Longitude: number;
    }>;
}

export function LocationMarkerMap( locationMarkerProps: LocationMarkerProps) {
    
  useMapEvents({
    click(e: LeafletMouseEvent) {
        locationMarkerProps.setValue("Longitude", parseFloat(e.latlng.lng.toFixed(5)));
      locationMarkerProps.setValue("Latitude", parseFloat(e.latlng.lat.toFixed(5)));
      locationMarkerProps.setPosition(e.latlng)
    }
  })
  

  return (
    <Marker position={locationMarkerProps.position}>
      <Tooltip direction="top" offset={[-13, -20]} opacity={1} permanent>Select Air Quality Location</Tooltip>
    </Marker>
  )
}