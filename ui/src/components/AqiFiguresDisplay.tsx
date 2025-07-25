import React, { useState, useEffect } from 'react';
import { getAqiFiguresByLatLon } from "../Api/ApiClient";
import type { AirQualityDataSetDto } from "../Api/ApiClient";
import "./AqiFiguresDisplay.css";

const AqiFigures:React.FC = () => {
    const [aqiForClosestStation, setAqiForClosestStation] = useState<AirQualityDataSetDto | null>(null);


    useEffect(() => {
        const fetchAqiData = async () => {
            try {
                const data = await getAqiFiguresByLatLon(45, 56);
                setAqiForClosestStation(data);
            } catch (error) {
                console.error('Error fetching AQI data:', error);
            }
        };
        
        fetchAqiData();
    }, []);

    return(
        <div className="aqi bg-white p-2 flex self-center w-100 rounded-md">
            <p> PM25: {aqiForClosestStation?.data?.aqi}</p>
            <p> PM10: {aqiForClosestStation?.data?.iaqi?.pm10?.v}</p>
            <p> {aqiForClosestStation?.data?.city?.name}</p>
        </div>
    )
}

export default AqiFigures;