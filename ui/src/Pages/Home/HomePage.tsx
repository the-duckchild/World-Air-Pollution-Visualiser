import { useState, useEffect } from "react";

import { TickerTape } from "../.././components/TickerTape";
import AqiFiguresDisplay from "../.././components/AqiFiguresDisplay";
import { AqiVisualiser } from "../../components/AqiVisualiser/AqiVisualiser";
import type { AirQualityDataSetDto, Iaqi } from "../.././Api/ApiClient";
import {
  FindDataForNearestStationForm,
  type LongLat,
} from "../.././components/FormComponents/FindDataForNearestStationForm";
import { MapComponent } from "../.././components/FormComponents/MapComponent";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui-components/dialog";
import { Button } from "../../components/ui-components/button";
import "leaflet/dist/leaflet.css";
import "../.././styles/globals.css";
import "../.././styles/app.css";

// London coordinates as fallback
const LONDON_COORDS: LongLat = {
  Latitude: 51.5074,
  Longitude: -0.1278
};

const HomePage = () => {
  const [enabledSystems, setEnabledSystems] = useState<
    Record<string, boolean>
  >({
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

  const [currentLongLat, setCurrentLongLat] = useState<LongLat>({
    Longitude: 0,
    Latitude: 0,
  });
  const [aqiForClosestStation, setAqiForClosestStation] =
    useState<AirQualityDataSetDto | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);

  const { setValue } = useForm<LongLat>({
    defaultValues: { Longitude: 0, Latitude: 0 },
  });

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      // Show dialog to request permission
      setShowLocationDialog(true);
    } else {
      // Geolocation not supported, use London as fallback
      console.log('Geolocation not supported, using London as fallback');
      setCurrentLongLat(LONDON_COORDS);
    }
  }, []);

  const requestLocationPermission = () => {
    if (!navigator.geolocation) {
      console.log('Geolocation no longer available, using London as fallback');
      setCurrentLongLat(LONDON_COORDS);
      setShowLocationDialog(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Successfully got user's location
        const coords: LongLat = {
          Latitude: position.coords.latitude,
          Longitude: position.coords.longitude
        };
        setCurrentLongLat(coords);
        setShowLocationDialog(false);
      },
      (error) => {
        // Failed to get location, use London as fallback
        console.log('Geolocation error, using London as fallback:', error.message);
        setCurrentLongLat(LONDON_COORDS);
        setShowLocationDialog(false);
      },
      {
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const declineLocationPermission = () => {
    // User declined, use London as fallback
    console.log('User declined location access, using London as fallback');
    setCurrentLongLat(LONDON_COORDS);
    setShowLocationDialog(false);
  };

  const toggleMap = () => {
    setMapVisible(!mapVisible);
  };
  return (
    <div className="flex flex-col h-screen overflow-y-auto">
      {/* Location Permission Dialog */}
      <Dialog
        open={showLocationDialog}
        onOpenChange={(open) => {
          setShowLocationDialog(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Your Location</DialogTitle>
            <DialogDescription>
              Can we use your current location to find local data? If not, you can select a location using the map.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={declineLocationPermission}>
              No, use default
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={requestLocationPermission}>
              Use my location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex w-screen mb-0 md:mb-4 portrait:flex-col portrait:items-center ">
        <img
          src="High-Resolution-Color-Logo-on-Transparent-Background_edited.png"
          className="object-contain w-full max-w-xs lg:max-w-lg xl:max-w-xl xl:h-auto portrait:mx-auto 3xl:absolute"
        ></img>
        <div className="w-full max-w-4xl px-4 mt-2 md:mt-5 mx-auto">
          <FindDataForNearestStationForm
            currentLongLat={currentLongLat}
            onCoordinatesChange={setCurrentLongLat}
            mapVisible={mapVisible}
            onToggleMap={toggleMap}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-screen items-center space-y-6 ">
        {/* Container for both AqiVisualiser and MapComponent */}
        <div className="flex justify-center">
          {/* AqiVisualiser - hidden when map is visible */}
          <div style={{ display: mapVisible ? "none" : "block" }}>
            <AqiVisualiser
              data={aqiForClosestStation?.data?.iaqi || fallbackIaqi}
              overallAqi={aqiForClosestStation?.data?.aqi}
              enabledSystems={enabledSystems}
              longitude={currentLongLat.Longitude}
              latitude={currentLongLat.Latitude}
            />
          </div>

          {/* MapComponent - shown when map is visible */}
          <MapComponent
            mapVisible={mapVisible}
            onCoordinatesChange={setCurrentLongLat}
            setValue={setValue}
            initialCoordinates={currentLongLat}
          />
        </div>

        <div className="w-full max-w-6xl px-4">
          <AqiFiguresDisplay
            currentLongLat={currentLongLat}
            aqiForClosestStation={aqiForClosestStation}
            enabledSystems={enabledSystems}
            onAqiChange={setAqiForClosestStation}
            onToggleSystem={(key: string) => {
              setEnabledSystems((prev) => ({
                ...prev,
                [key]: !prev[key],
              }));
            }}
          />
        </div>
      </div>
      <TickerTape />
    </div>
  );
};
export default HomePage;