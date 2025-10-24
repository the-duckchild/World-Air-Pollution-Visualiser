import { type JSX, useState } from "react";
import { useForm } from "react-hook-form";
import { AnimatePresence , motion } from "motion/react"
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
  currentLongLat, 
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
    if (mapVisible) {toggleMap()};

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
            setPosition={(pos: LatLng) => setPosition([pos.lat, pos.lng])}
            setValue={setValue}
          />
        </MapContainer>
      </motion.div>)}
      </AnimatePresence>
    <div className="container">
      
      <form onSubmit={handleSubmit(submitForm)}>
        <p className="font-medium">
          Click Map to select location
        </p>

        <div></div>
        <div className="flex flex-row justify-center">
          <div className="flex flex-col justify-center self-center">
            <p className="">Longitude</p>
            <input
              className="font-medium align-items-center"
              type="text"
              placeholder="Longitude"
              {...register("Longitude", {
                required: true,
                pattern: /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)/i,
              })}
            />
          </div>
          <div className="flex flex-col justify-self-center">
            <p className=" m-1px">Latitude</p>
            <input
              className="font-medium"
              type="text"
              placeholder="Latitude"
              {...register("Latitude", {
                required: true,
                pattern: /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)/i,
              })}
            />
          </div>
        </div>
        <p>
          <input className="font-medium" type="submit" />
          <button className="map-button" type="button" onClick={toggleMap}> {mapVisible ? 'Hide Map' : 'Show Map'}</button>
          </p>
         {currentLongLat && currentLongLat.Latitude !== undefined && currentLongLat.Longitude !== undefined && (
            <p>Current Location: {currentLongLat.Latitude.toFixed(4)}, {currentLongLat.Longitude.toFixed(4)}</p>
          )}
      </form>
     
    </div>
    
    </div>
  );
}
