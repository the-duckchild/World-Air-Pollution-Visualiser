import { type JSX, useState } from "react";
import { useForm } from "react-hook-form";
import "./FindDataForNearestStationForm.css";
import { LocationMarkerMap } from "./LocationMarkerMap";
import { MapContainer, TileLayer } from "react-leaflet";
import { latLng, LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";

export function FindDataForNearestStationForm(): JSX.Element {
  interface FormData {
    Longitude: number;
    Latitude: number;
  }

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: { Longitude: 0, Latitude: 0 } });
  const onSubmit = (data: FormData): void => console.log(data);
  console.log(errors);
  const [position, setPosition] = useState<[number, number]>([0, 0]);

  return (
    <div>
     <div className="map-container">
        <MapContainer
          center={{ lat: 51.553124, lng: -0.142594 }}
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
      </div>
    <div className="container">
      
      <form onSubmit={handleSubmit(onSubmit)}>
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
        </p>
      </form>
     
    </div>
    </div>
  );
}
