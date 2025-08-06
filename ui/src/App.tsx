import { TickerTape } from "./components/TickerTape";
import AqiFiguresDisplay from "./components/AqiFiguresDisplay";
import { FindDataForNearestStationForm } from "./components/FormComponents/FindDataForNearestStationForm";
import { LocationMarkerMap } from "./components/FormComponents/LocationMarkerMap";
import { useState } from "react";
import { latLng, LatLng } from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./styles/globals.css";
import "./styles/app.css";

function App() {
  const [position, setPosition] = useState<[number, number]>([51.505, -0.09]);
  const [value, setValue] = useState<string>("");

  return (
    <>
      <div className="min-h-95vh flex flex-col min-w-screen items-center mt-50 rounded-sm">
        <div className="flex">
          <AqiFiguresDisplay />
        </div>
        <FindDataForNearestStationForm />
      </div>
      <TickerTape />
    </>
  );
}

export default App;
