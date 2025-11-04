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

interface AirQualityLevel {
  color: string;
  label: string;
}

const getAirQualityLevel = (value: number): AirQualityLevel => {
  if (value >= 0 && value <= 50) {
    return { color: '#22c55e', label: 'Good' }; // green
  } else if (value >= 51 && value <= 100) {
    return { color: '#eab308', label: 'Moderate' }; // yellow
  } else if (value >= 101 && value <= 150) {
    return { color: '#f97316', label: 'Unhealthy for sensitive individuals' }; // orange
  } else if (value >= 151 && value <= 200) {
    return { color: '#ef4444', label: 'Unhealthy' }; // red
  } else if (value >= 201 && value <= 300) {
    return { color: '#a855f7', label: 'Very Unhealthy' }; // purple
  } else {
    return { color: '#800000', label: 'Hazardous' }; // maroon
  }
};

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


    <Card className="p-4 md:p-3 max-w-7xl mx-auto w-full">
      <h3 className="font-bold text-lg ml-2">AQI Data</h3> 
      
      {/* Show message when no location is selected */}
      {currentLongLat.Latitude === 0 && currentLongLat.Longitude === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <p className="text-lg">📍 No location selected</p>
          <p>Choose location with the map to view air quality data</p>
        </div>
      ) : (
        <>
          {/* Header section with location and time */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b portrait:gap-0.5 portrait:pb-1">
            <div>
              <p className="text-lg portrait:text-sm font-medium text-gray-700">
                <span className="text-gray-600">Location:</span> {aqiForClosestStation?.data?.city?.name || 'Loading...'}
              </p>
            </div>
            
            {currentTime && (
              <div className="text-left sm:text-right mt-2 portrait:mt-0 sm:mt-0">  
                <p className="text-sm portrait:text-xs font-medium text-gray-700">Local Time: {currentTime}</p>
              </div>
            )}
          </div>
        </>
      )}
       
       {/* Only show particle controls when location is selected */}
       {currentLongLat.Latitude !== 0 || currentLongLat.Longitude !== 0 ? (
         <div>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
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
                  className={`flex flex-col md:flex-col md:min-h-[140px] gap-2 p-4 md:p-4 portrait:p-2 portrait:flex-row portrait:items-center portrait:gap-2 portrait:min-h-0 rounded-lg border transition-all duration-200 hover:shadow-md ${!isAvailable ? 'opacity-50' : ''}`}
                  style={{
                    backgroundColor: isAvailable ? `${config.color}15` : 'transparent',
                    borderColor: isAvailable ? config.color : 'var(--border)',
                  }}
                >
                  {/* Desktop: Label on top, mobile: Label on left with fixed width */}
                  <div className="flex items-center justify-between w-full md:flex-row portrait:w-20 portrait:shrink-0 portrait:justify-start">
                    <div className="portrait:w-full portrait:overflow-hidden portrait:relative portrait:h-[18px]">
                      <Label
                        htmlFor={config.key}
                        className="cursor-pointer font-semibold portrait:text-xs portrait:whitespace-nowrap"
                        style={{ color: '#555555' }}
                      >
                        <span className="hidden portrait:inline">{config.shortLabel}</span>
                        <span className="portrait:hidden">{config.label}</span>
                      </Label>
                    </div>
                    {/* Desktop: Switch next to label */}
                    <Switch
                      id={config.key}
                      checked={enabledSystems[config.key] && isAvailable}
                      onCheckedChange={() => onToggleSystem(config.key)}
                      disabled={!isAvailable}
                      className="md:inline-flex portrait:hidden"
                    />
                  </div>
                  
                  {/* Desktop: Column layout, Mobile: Row layout */}
                  <div className="flex flex-col portrait:flex-row portrait:items-center gap-2 portrait:gap-1.5 portrait:flex-1">
                    {/* Traffic light and value - row on both desktop and mobile */}
                    <div className="flex items-center gap-3 portrait:gap-1.5">
                      {/* Circular traffic light indicator */}
                      <div
                        className="shrink-0 rounded-full border w-5 h-5 sm:w-6 sm:h-6 portrait:w-4 portrait:h-4"
                        style={{
                          backgroundColor: isAvailable && pollutantData 
                            ? getAirQualityLevel(pollutantData.v).color 
                            : 'rgba(0, 0, 0, 0.1)',
                          borderColor: isAvailable && pollutantData 
                            ? getAirQualityLevel(pollutantData.v).color 
                            : 'rgba(0, 0, 0, 0.3)',
                          borderWidth: '2px',
                        }}
                        title={isAvailable && pollutantData ? getAirQualityLevel(pollutantData.v).label : 'No data'}
                      />
                      
                      {/* Value - fixed width on mobile */}
                      {isAvailable && pollutantData ? (
                        <div className="text-lg portrait:text-sm font-bold text-gray-800 portrait:w-[35px] portrait:shrink-0 portrait:text-right">
                          {pollutantData.v}
                        </div>
                      ) : (
                        <div className="text-sm portrait:text-xs text-muted-foreground italic portrait:w-[35px] portrait:shrink-0">-</div>
                      )}
                    </div>
                    
                    {/* Quality label - below on desktop, inline on mobile */}
                    <div className="flex-1 min-w-0 portrait:overflow-hidden portrait:relative portrait:h-3.5">
                      {isAvailable && pollutantData ? (
                        <div className="text-xs portrait:text-[9px] text-gray-600 leading-tight portrait:whitespace-nowrap wrap-break-word">
                          {getAirQualityLevel(pollutantData.v).label}
                        </div>
                      ) : (
                        <div className="text-xs portrait:text-[9px] text-muted-foreground italic">No data</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Mobile: Switch on the right */}
                  <Switch
                    id={`${config.key}-mobile`}
                    checked={enabledSystems[config.key] && isAvailable}
                    onCheckedChange={() => onToggleSystem(config.key)}
                    disabled={!isAvailable}
                    className="hidden portrait:inline-flex portrait:scale-75 portrait:shrink-0"
                  />
                </div>
              );
            })}
           </div>
         </div>
       ) : null}
    </Card>

  );
};

export default AqiFigures;
