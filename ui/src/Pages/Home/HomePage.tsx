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
    aqi: true,
    co: false,
    co2: false,
    no2: false,
    pm10: false,
    pm25: false,
    so2: false,
  });

  const fallbackIaqi: Iaqi = {
    co: { v: 0 },
    co2: { v: 0 },
    no2: { v: 0 },
    pm10: { v: 0 },
    pm25: { v: 0 },
    so2: { v: 0 },
  };

  const [currentLongLat, setCurrentLongLat] = useState<LongLat>({Longitude: 0, Latitude: 0});    
    const [aqiForClosestStation, setAqiForClosestStation] = useState<AirQualityDataSetDto | null>(null);
    
    return (
        
             <>

             <div className="flex w-screen mb-4 portrait:flex-col portrait:items-center ">
               <img src="High-Resolution-Color-Logo-on-Transparent-Background_edited.png" className="object-contain w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl h-auto portrait:mx-auto 3xl:absolute"></img>
            <div className="w-full max-w-4xl px-4 mt-5 mx-auto">
                 <FindDataForNearestStationForm currentLongLat={currentLongLat} onCoordinatesChange={setCurrentLongLat} />
               </div> 
               </div>



             <div className="min-h-95vh flex flex-col min-w-screen items-center space-y-6">
               

               <div className="flex justify-center">
                 <AqiVisualiser 
                   data={aqiForClosestStation?.data?.iaqi || fallbackIaqi} 
                   overallAqi={aqiForClosestStation?.data?.aqi}
                   enabledSystems={enabledSystems}
                   longitude={currentLongLat.Longitude}
                   latitude={currentLongLat.Latitude}
                 />
               </div>


               <div className="w-full max-w-6xl px-4">
                 <AqiFiguresDisplay 
                   currentLongLat={currentLongLat} 
                   aqiForClosestStation={aqiForClosestStation} 
                   enabledSystems={enabledSystems}
                   onAqiChange={setAqiForClosestStation}
                   onToggleSystem={(key: string) => {
                     setEnabledSystems(prev => ({
                       ...prev,
                       [key]: !prev[key]
                     }));
                   }}
                 />
               </div>
               
             </div>
             <TickerTape />
           </>
        );
}
export default HomePage;