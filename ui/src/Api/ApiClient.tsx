export interface AirQualityDataSetDto {
    status: string | null;
    data: Data | null;
}

export interface Data {
    aqi: number;
    idx: number;
    attributions: Attribution[] | null;
    city: City | null;
    dominentpol: string | null;
    iaqi: Iaqi | null;
    time: Time | null;
}

export interface Attribution {
    url: string | null;
    name: string | null;
    station: string | null;
}

export interface City {
    geo: number[] | null;
    name: string | null;
    url: string | null;
    location: string | null;
}

export interface Iaqi {
    co: Co | null;
    co2: Co2 | null;
    no2: No2 | null;
    pm10: Pm10 | null;
    pm25: Pm25 | null;
    so2: So2 | null;
}

export interface Time {
    saveChanges: string | null;
    tz: string | null;
    v: number | null;
    iso: string;
}

export interface Co {
    v: number;
}

export interface Co2 {
    v: number;
}

export interface No2 {
    v: number;
}

export interface Pm10 {
    v: number;
}

export interface Pm25 {
    v: number;
}

export interface So2 {
    v: number;
}


export async function getAqiFiguresByLatLon(lat: number, lon: number): Promise<AirQualityDataSetDto> {
    const response = await fetch(`http://localhost:5090/air-quality-data-by-latlon/${lat}/${lon}`);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
}

export async function getAqiFiguresByUID(uid: string): Promise<AirQualityDataSetDto> {
    const response = await fetch(`http://localhost:5090/air-quality-data-by-uid/${uid}`);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
}

export async function getAqiFiguresByUIDs(uids: string[]): Promise<Record<string, AirQualityDataSetDto>> {
    const response = await fetch(`http://localhost:5090/air-quality-data-by-uids`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(uids),
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
}