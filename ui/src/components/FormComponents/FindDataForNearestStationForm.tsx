import { type JSX, useState } from "react";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion"
import { LocationMarkerMap } from "./LocationMarkerMap";
import { MapContainer, TileLayer } from "react-leaflet";
import { latLng, LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./FindDataForNearestStationForm.css";

 export interface LongLat {
    Longitude: number;
    Latitude: number;
  }
export interface FindDataForNearestStationFormProps {
  currentLongLat: {
    Longitude: number;
    Latitude: number;
  };
  onCoordinatesChange?: (coordinates: LongLat) => void; 
}

export function FindDataForNearestStationForm({ 
  onCoordinatesChange 
}: FindDataForNearestStationFormProps): JSX.Element {

  const {
    register,
    handleSubmit,
    setValue,
  } = useForm<LongLat>({ defaultValues: { Longitude: 0, Latitude: 0 } });

  const [position, setPosition] = useState<[number, number]>([16.766587, -3.0025615]);
  const [mapVisible, setMapVisible] = useState(false);

  const toggleMap = () => {
    setMapVisible(!mapVisible);
  }

  function submitForm(data: LongLat) {
    if (onCoordinatesChange) {
      onCoordinatesChange(data);
    }
    // Map visibility is now only controlled by the toggle button
  }

  // Auto-submit when map position changes
  const handleMapPositionChange = (pos: LatLng) => {
    setPosition([pos.lat, pos.lng]);
    
    // Create the data object and submit immediately
    const formData: LongLat = {
      Latitude: parseFloat(pos.lat.toFixed(5)),
      Longitude: parseFloat(pos.lng.toFixed(5))
    };
    
    // Submit the form automatically
    if (onCoordinatesChange) {
      onCoordinatesChange(formData);
    }
    
    // Map remains visible - user must click "Hide Map" to close it
  }

  return (
    <div>
      <AnimatePresence>
      {mapVisible && (
     <motion.div key="map" initial={{opacity: 0}} animate={{opacity: 1,}} exit={{ opacity: 0 }} transition={{ ease: "easeInOut", duration: 0.5 }} className="map-container">
        <MapContainer
          center={{ lat: 16.7665887, lng: -3.0025615 }}
          maxBounds={[
            [-90, -180],
            [90, 180],
          ]}
          maxBoundsViscosity={1}
          minZoom={2.5

          }
          zoom={1}
          scrollWheelZoom={true}>
          <TileLayer
          id="tileLayer"
          noWrap={true}
          bounds={[[-90, -180],
            [90, 180]]}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />{" "}
          <LocationMarkerMap
            position={latLng(position[0], position[1])}
            setPosition={handleMapPositionChange}
            setValue={setValue}
          />
        </MapContainer>
      </motion.div>)}
      </AnimatePresence>
    <div className="bg-white rounded-lg shadow-sm border p-2 mb-5 mx-auto">
      <form onSubmit={handleSubmit(submitForm)}>
        

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <p className="font-medium text-gray-700 mb-2">Click on the map to select location and view air quality data</p>
            

            <div className="flex gap-3">
              <div className="flex-1">
                <label className=" text-sm text-gray-600 mb-1 hidden">Latitude</label>
                <input
                  className="w-full px-3 py-2 border rounded-md hidden text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  placeholder="0.0000"
                  {...register("Latitude", {
                    required: true,
                    pattern: /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)/i,
                  })}
                />
              </div>
              <div className="flex-1">
                <label className=" text-sm text-gray-600 mb-1 hidden">Longitude</label>
                <input
                  className="hidden w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  placeholder="0.0000"
                  {...register("Longitude", {
                    required: true,
                    pattern: /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)/i,
                  })}
                />
              </div>
            </div>
          </div>
          
          {/* Action button */}
          <div className="flex gap-2 sm:w-auto w-full">
            <button 
              className={`px-4 py-2 text-white rounded-md text-sm font-medium flex-1 sm:flex-none sm:w-32 ${
                mapVisible 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              type="button" 
              onClick={toggleMap}
            > 
              {mapVisible ? 'Hide Map' : 'Show Map'}
            </button>
          </div>
        </div>

{/* 
        {currentLongLat && currentLongLat.Latitude !== 0 && currentLongLat.Longitude !== 0 && (
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            <strong>Current Location:</strong> {currentLongLat.Latitude.toFixed(4)}, {currentLongLat.Longitude.toFixed(4)}
          </div>
        )} */}
      </form>
    </div>
    
    </div>
  );
}
