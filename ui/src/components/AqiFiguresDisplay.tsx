import { useEffect, useState } from "react";
import { getAqiFiguresByLatLon } from "../Api/ApiClient";
import type { AirQualityDataSetDto } from "../Api/ApiClient";
import "./AqiFiguresDisplay.css";
import { type LongLat } from "../components/FormComponents/FindDataForNearestStationForm";
import { getCurrentTimeForLocation } from "../utils/timeUtils";
import { PARTICLE_CONFIGS } from './AqiVisualiser/ParticleConfigs';
import { Card } from './ui components/card';
import { Switch } from './ui components/switch';
import { Label } from './ui components/label';

interface AqiFiguresDisplayProps {
  currentLongLat: LongLat;
  aqiForClosestStation: AirQualityDataSetDto | null;
  enabledSystems: Record<string, boolean>;
  onAqiChange: (coordinates: AirQualityDataSetDto) => void;
  onToggleSystem: (key:string) => void;
}

const AqiFigures: React.FC<AqiFiguresDisplayProps> = ({ 
  currentLongLat, 
  aqiForClosestStation,
  enabledSystems,
  onAqiChange,
  onToggleSystem
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');



  useEffect(() => {
    // Don't fetch data if coordinates are 0,0 (no location selected)
    if (currentLongLat.Latitude === 0 && currentLongLat.Longitude === 0) {
      return;
    }

    const fetchAqiData = async () => {
      try {
        const data = await getAqiFiguresByLatLon(currentLongLat.Latitude, currentLongLat.Longitude);
        onAqiChange(data);
      } catch (error) {
        console.error("Error fetching AQI data:", error);
      }
    };

        
   fetchAqiData();
  }, [currentLongLat.Latitude, currentLongLat.Longitude, onAqiChange]);

  // Update current time when location changes and every minute
  useEffect(() => {
    // Don't fetch time if coordinates are 0,0 (no location selected)
    if (currentLongLat.Latitude === 0 && currentLongLat.Longitude === 0) {
      setCurrentTime('');
      return;
    }

    const updateTime = async () => {
      const timeStr = await getCurrentTimeForLocation(currentLongLat.Latitude, currentLongLat.Longitude);
      setCurrentTime(timeStr || '');
    };

    // Update immediately
    updateTime();
    
    // Update every minute
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  }, [currentLongLat.Latitude, currentLongLat.Longitude]);


  return (
  //  <Card className="p-4 md:p-6 max-w-7xl mx-auto w-full">
  //   <div className="aqi bg-white p-4 flex flex-col w-200 rounded-md space-y-2 m-5">
  //     <div className="flex flex-row justify-between items-center">
  //       <div>
  //         <h3 className="font-bold text-lg mb-2">Air Quality Data</h3> 
  //         <p><strong>Location:</strong> {aqiForClosestStation?.data?.city?.name || 'Unknown'}</p>
  //       </div>
  //       {currentTime && (
  //         <div className="text-right">
  //           <p className="text-sm text-gray-600">Local Time</p>
  //           <p className="font-mono text-lg">{currentTime}</p>
  //         </div>
  //       )}
  //     </div>
  //     <div className="grid grid-cols-4 gap-4">
  //       <div className="">
  //         <p><strong>Overall AQI:</strong> {aqiForClosestStation?.data?.aqi || 'N/A'}</p>
          

  //       </div>
  //       <div>
  //         <p><strong>PM10:</strong> {aqiForClosestStation?.data?.iaqi?.pm10?.v || 'N/A'} μg/m³</p>
  //         <p><strong>PM2.5:</strong> {aqiForClosestStation?.data?.iaqi?.pm25?.v || 'N/A'} μg/m³</p>                 
          
          
  //       </div>
  //       <div>
  //         <p><strong>CO₂:</strong> {aqiForClosestStation?.data?.iaqi?.co2?.v || 'N/A'} μg/m³</p>
  //         <p><strong>CO:</strong> {aqiForClosestStation?.data?.iaqi?.co?.v || 'N/A'} μg/m³</p>
  //       </div>
  //       <div>
  //         <p><strong>NO₂:</strong> {aqiForClosestStation?.data?.iaqi?.no2?.v || 'N/A'} μg/m³</p>
  //         <p><strong>SO₂:</strong> {aqiForClosestStation?.data?.iaqi?.so2?.v || 'N/A'} μg/m³</p>  
  //       </div>
  //     </div>
  //     <div className="mt-2">
        
        
  //     </div>
  //   </div>
  //   </ Card>

    <Card className="p-4 md:p-6 max-w-7xl mx-auto w-full">
      <h3 className="font-bold text-lg mb-2">Air Quality Data</h3> 
      
      {/* Show message when no location is selected */}
      {currentLongLat.Latitude === 0 && currentLongLat.Longitude === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg mb-2">📍 No location selected</p>
          <p>Click on the map below or enter coordinates to view air quality data</p>
        </div>
      ) : (
        <>
          <div>
             <p><strong>Location:</strong> {aqiForClosestStation?.data?.city?.name || 'Loading...'}</p>
          </div>
          
           {currentTime && (
             <div className="text-right">
               <p className="text-sm text-gray-600">Local Time</p>
               <p className="font-mono text-lg">{currentTime}</p>
             </div>
             
           )}
        </>
      )}
       
       {/* Only show particle controls when location is selected */}
       {currentLongLat.Latitude !== 0 || currentLongLat.Longitude !== 0 ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
             {PARTICLE_CONFIGS.map((config: typeof PARTICLE_CONFIGS[0]) => {
              // Handle AQI differently since it's not in iaqi
              let pollutantData;
              let isAvailable;
              
              if (config.key === 'aqi') {
                pollutantData = aqiForClosestStation?.data?.aqi ? { v: aqiForClosestStation.data.aqi } : null;
                isAvailable = aqiForClosestStation?.data?.aqi !== undefined && aqiForClosestStation?.data?.aqi !== null;
              } else {
                pollutantData = aqiForClosestStation?.data?.iaqi?.[config.key as keyof typeof aqiForClosestStation.data.iaqi];
                isAvailable = pollutantData !== null && pollutantData !== undefined;
              }

              return (
                <div
                  key={config.key}
                  className={`flex flex-row sm:flex-col gap-3 sm:gap-2 p-3 rounded-lg border items-center sm:items-start ${!isAvailable ? 'opacity-50' : ''}`}
                  style={{
                    backgroundColor: isAvailable ? `${config.color}15` : 'transparent',
                    borderColor: isAvailable ? config.color : 'var(--border)',
                  }}
                >
                  <div className="flex items-center justify-between flex-1 sm:w-full">
                    <Label
                      htmlFor={config.key}
                      className="cursor-pointer"
                      style={{ color: isAvailable ? config.color : 'inherit' }}
                    >
                      {config.label}
                    </Label>
                    <Switch
                      id={config.key}
                      checked={enabledSystems[config.key] && isAvailable}
                      onCheckedChange={() => onToggleSystem(config.key)}
                      disabled={!isAvailable} />
                  </div>
                  {isAvailable && pollutantData && (
                    <div className="text-sm text-muted-foreground whitespace-nowrap sm:whitespace-normal">
                      Value: {pollutantData.v}
                    </div>
                  )}
                  {!isAvailable && (
                    <div className="text-sm text-muted-foreground">No data</div>
                  )}
                </div>
              );
            })}
          </div>
       ) : null}
    </Card>

  );
};

export default AqiFigures;
