import React, { useEffect } from "react";
import { getAqiFiguresByLatLon } from "../Api/ApiClient";
import type { AirQualityDataSetDto } from "../Api/ApiClient";
import "./AqiFiguresDisplay.css";
import { type LongLat } from "../components/FormComponents/FindDataForNearestStationForm";

interface AqiFiguresDisplayProps {
  currentLongLat: LongLat;
  aqiForClosestStation: AirQualityDataSetDto | null;
  onAqiChange: (coordinates: AirQualityDataSetDto) => void;
}

const AqiFigures: React.FC<AqiFiguresDisplayProps> = ({ 
  currentLongLat, 
  aqiForClosestStation,
  onAqiChange 
}) => {
 
console.log(currentLongLat)

  useEffect(() => {
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

  return (
    <div className="aqi bg-white p-2 flex self-center w-100 rounded-md">
      <p>PM25:{aqiForClosestStation?.data?.aqi}</p>
      <p>PM10:{aqiForClosestStation?.data?.iaqi?.pm10?.v}</p>
      <p>{aqiForClosestStation?.data?.city?.name}</p>
    </div>
  );
};

export default AqiFigures;
