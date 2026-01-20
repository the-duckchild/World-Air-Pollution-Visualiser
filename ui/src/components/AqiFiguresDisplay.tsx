import { useEffect, useState } from "react";
import { getAqiFiguresByLatLon } from "../Api/ApiClient";
import type { AirQualityDataSetDto } from "../Api/ApiClient";
import "./AqiFiguresDisplay.css";
import { type LongLat } from "../components/FormComponents/FindDataForNearestStationForm";
import { getCurrentTimeForLocation } from "../utils/timeUtils";
import { PARTICLE_CONFIGS } from './AqiVisualiser/ParticleConfigs';
import { Card } from './ui-components/card';
import { Switch } from './ui-components/switch';
import { Label } from './ui-components/label';

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
  if (value <= 50) {
    return { color: '#16a34a', label: 'Good' }; // green-600
  } else if (value <= 101) {
    return { color: '#ca8a04', label: 'Moderate' }; // yellow-600
  } else if (value <= 151) {
    return { color: '#ea580c', label: 'Unhealthy for sensitive individuals' }; // orange-600
  } else if (value <= 201) {
    return { color: '#dc2626', label: 'Unhealthy' }; // red-600
  } else if (value <= 301) {
    return { color: '#9333ea', label: 'Very Unhealthy' }; // purple-600
  } else {
    return { color: '#991b1b', label: 'Hazardous' }; // red-800
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


    <Card className="p-3 md:p-2 max-w-6xl mx-auto w-full scale-90">
      {/* Header: Title, Location, and Time - combined on small landscape screens */}
      <div className="flex flex-col small-landscape-inline-header">
        <h3 className="font-bold text-xs sm:text-sm lg:text-base ml-2 small-landscape-header-text">AQI Data</h3>
        
        {/* Location and time - shown inline on small landscape screens */}
        {currentLongLat.Latitude !== 0 && currentLongLat.Longitude !== 0 && (
          <div className="hidden small-landscape-compact items-center gap-4 text-xs">
            <div className="font-medium text-gray-700">
              <span className="text-gray-600">Location:</span> {aqiForClosestStation?.data?.city?.name || 'Loading...'}
            </div>
            {currentTime && (
              <div className="font-medium text-gray-700">Local Time: {currentTime}</div>
            )}
          </div>
        )}
      </div>
      
      {/* Show message when no location is selected */}
      {currentLongLat.Latitude === 0 && currentLongLat.Longitude === 0 ? (
        <div className="text-center py-3 text-gray-500">
          <div className="text-xs sm:text-sm md:text-base">📍 No location selected</div>
          <div className="text-xs sm:text-sm md:text-base">Choose location with the map to view air quality data</div>
        </div>
      ) : (
        <>
          {/* Header section with location and time - hidden on small landscape screens */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b portrait:gap-0.5 portrait:pb-1 small-landscape-hidden">
            <div>
              <div className="text-xs sm:text-sm md:text-base portrait:text-xs font-medium text-gray-700">
                <span className="text-gray-600">Location:</span> {aqiForClosestStation?.data?.city?.name || 'Loading...'}
              </div>
            </div>
            
            {currentTime && (
              <div className="text-left sm:text-right mt-2 portrait:mt-0 sm:mt-0">  
                <div className="text-xs sm:text-sm md:text-base portrait:text-xs font-medium text-gray-700">Local Time: {currentTime}</div>
              </div>
            )}
          </div>
        </>
      )}
       
       {/* Only show particle controls when location is selected */}
       {currentLongLat.Latitude !== 0 || currentLongLat.Longitude !== 0 ? (
         <div>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 small-landscape-grid">
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
                  className={`flex flex-col md:flex-col md:min-h-[120px] gap-2 p-3 md:p-3 portrait:p-2 portrait:flex-row portrait:items-center portrait:gap-2 portrait:min-h-0 small-landscape-card rounded-lg border transition-all duration-200 hover:shadow-md ${!isAvailable ? 'opacity-50' : ''}`}
                  style={{
                    backgroundColor: isAvailable ? `${config.color}15` : 'transparent',
                    borderColor: isAvailable ? config.color : 'var(--border)',
                  }}
                >
                  {/* Desktop: Label on top, mobile/small landscape: Label on left with fixed width */}
                  <div className="flex items-center justify-between w-full md:flex-row portrait:w-20 portrait:shrink-0 portrait:justify-start portrait:h-full small-landscape-label-container">
                    <div className="portrait:w-full portrait:overflow-hidden portrait:relative portrait:flex portrait:items-center portrait:h-full small-landscape-label-text">
                      <Label
                        htmlFor={config.key}
                        className="cursor-pointer font-semibold portrait:text-xs portrait:whitespace-nowrap small-landscape-label"
                        style={{ color: '#555555' }}
                      >
                        <span className="hidden p-1 portrait:inline small-landscape-label">{config.shortLabel}</span>
                        <span className="portrait:hidden">{config.label}</span>
                      </Label>
                    </div>
                    {/* Desktop: Switch next to label */}
                    <Switch
                      id={config.key}
                      checked={enabledSystems[config.key] && isAvailable}
                      onCheckedChange={() => onToggleSystem(config.key)}
                      disabled={!isAvailable}
                      className="md:inline-flex portrait:hidden small-landscape-hidden"
                    />
                  </div>
                  
                  {/* Desktop: Column layout, Mobile/Small Landscape: Row layout */}
                  <div className="flex flex-col items-center portrait:flex-row gap-2 portrait:gap-1.5 portrait:flex-1 small-landscape-content">
                    {/* Traffic light and value - row on both desktop and mobile */}
                    <div className="flex items-center gap-3 portrait:gap-1.5">
                      {/* Circular traffic light indicator */}
                      <div
                        className="shrink-0 rounded-full border w-5 h-5 sm:w-6 sm:h-6 portrait:w-4 portrait:h-4 small-landscape-traffic-light"
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
                        <div className="text-base portrait:text-sm flex items-center font-bold text-gray-800 portrait:w-[35px] portrait:shrink-0 portrait:text-right small-landscape-value">
                          {pollutantData.v}
                        </div>
                      ) : (
                        <div className="text-xs portrait:text-xs flex items-center text-muted-foreground italic portrait:w-[35px] portrait:shrink-0 small-landscape-value">-</div>
                      )}
                    </div>
                    
                    {/* Quality label - below on desktop, inline on mobile/small landscape */}
                    <div className="flex-1 portrait:pt-0 min-w-0 flex items-center portrait:overflow-visible portrait:relative small-landscape-quality">
                      {isAvailable && pollutantData ? (
                        <div className="text-xs portrait:text-xs text-gray-600 leading-tight portrait:break-words portrait:max-w-full portrait:max-h-10 portrait:overflow-hidden">
                          {getAirQualityLevel(pollutantData.v).label}
                        </div>
                      ) : (
                        <div className="text-tiny text-muted-foreground italic">No data</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Mobile/Small Landscape: Switch on the right */}
                  <Switch
                    id={`${config.key}-mobile`}
                    checked={enabledSystems[config.key] && isAvailable}
                    onCheckedChange={() => onToggleSystem(config.key)}
                    disabled={!isAvailable}
                    className="hidden portrait:inline-flex portrait:scale-75 portrait:shrink-0 small-landscape-switch"
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
