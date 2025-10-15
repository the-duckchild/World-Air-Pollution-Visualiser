import { useState } from "react";

import { TickerTape } from "../.././components/TickerTape";
import AqiFiguresDisplay from "../.././components/AqiFiguresDisplay";
import {AqiVisualiser} from "../../components/AqiVisualiser/AqiVisualiser";
import type { AirQualityDataSetDto, Iaqi } from "../.././Api/ApiClient";
import { FindDataForNearestStationForm, type LongLat } from "../.././components/FormComponents/FindDataForNearestStationForm";
import "leaflet/dist/leaflet.css";
import "../.././styles/globals.css";
import "../.././styles/app.css";

const HomePage = () => {
  const [enabledSystems, setEnabledSystems] = useState<Record<string, boolean>>({
    co: true,
    co2: true,
    no2: true,
    pm10: true,
    pm25: true,
    so2: true,
  });

  const handleToggleSystem = (key: string) => {
    setEnabledSystems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Fallback iaqi data with zero values
  const fallbackIaqi: Iaqi = {
    co: { v: 0 },
    co2: { v: 0 },
    no2: { v: 0 },
    pm10: { v: 0 },
    pm25: { v: 0 },
    so2: { v: 0 },
  };

  const [currentLongLat, setCurrentLongLat] = useState<LongLat>({Longitude: 51.5072,Latitude: 0.1276});    
    const [aqiForClosestStation, setAqiForClosestStation] = useState<AirQualityDataSetDto | null>(null);
    return (
        
             <>
               
      <div className="min-h-95vh flex flex-col min-w-screen items-center rounded-sm">
        <div id="canvas-container" className="h-150 w-500 mt-50">
          <AqiVisualiser data={aqiForClosestStation?.data?.iaqi || fallbackIaqi} enabledSystems={enabledSystems}/>
          </div>
        <div className="flex mt-30 absolute">
          <AqiFiguresDisplay currentLongLat={currentLongLat} aqiForClosestStation={aqiForClosestStation} onAqiChange={setAqiForClosestStation}/>
        </div>
      
        <FindDataForNearestStationForm currentLongLat={currentLongLat} onCoordinatesChange={setCurrentLongLat} />
      </div>
      <TickerTape />
    </>

        
        );
}
export default HomePage;