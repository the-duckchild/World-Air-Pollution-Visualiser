import { useState, useEffect, useMemo } from "react";
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
import { LONDON_COORDS } from "../../utils/constants";
import "leaflet/dist/leaflet.css";
import "../.././styles/globals.css";
import "../.././styles/app.css";

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

  // Memoize fallback data to prevent new object creation on every render
  const fallbackIaqi: Iaqi = useMemo(() => ({
    co: { v: 0 },
    co2: { v: 0 },
    no2: { v: 0 },
    pm10: { v: 0 },
    pm25: { v: 0 },
    so2: { v: 0 },
  }), []);

  const [currentLongLat, setCurrentLongLat] = useState<LongLat>({
    Longitude: LONDON_COORDS.Longitude,
    Latitude: LONDON_COORDS.Latitude,
  });
  const [aqiForClosestStation, setAqiForClosestStation] =
    useState<AirQualityDataSetDto | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);

  const { setValue } = useForm<LongLat>({
    defaultValues: { Longitude: 0, Latitude: 0 },
  });

  // Show location dialog on component mount
  useEffect(() => {
    // Only show dialog if geolocation is supported
    if (navigator.geolocation) {
      setShowLocationDialog(true);
    }
  }, []);

  // Helper function to get user's current location
  const getUserLocation = (
    onSuccess: (coords: LongLat) => void,
    onError: (error: GeolocationPositionError) => void
  ) => {
    if (!navigator.geolocation) {
      return false;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: LongLat = {
          Latitude: position.coords.latitude,
          Longitude: position.coords.longitude
        };
        onSuccess(coords);
      },
      onError,
      {
        timeout: 5000,
        maximumAge: 0
      }
    );
    return true;
  };

  const requestLocationPermission = () => {
    const success = getUserLocation(
      (coords) => {
        // Successfully got user's location
        setCurrentLongLat(coords);
        setShowLocationDialog(false);
      },
      (_error) => {
        // Failed to get location, keep London as default
        setShowLocationDialog(false);
      }
    );

    if (!success) {
      setShowLocationDialog(false);
    }
  };

  const declineLocationPermission = () => {
    // User declined, keep London as default
    setShowLocationDialog(false);
  };

  const toggleMap = () => {
    setMapVisible(!mapVisible);
  };
  return (
    <>
      {/* Location Permission Dialog - rendered outside main container to appear above everything */}
      <Dialog
        open={showLocationDialog}
        onOpenChange={(open) => {
          if (!open) {
            declineLocationPermission();
          } else {
            setShowLocationDialog(open);
          }
        }}
      >
        <DialogContent className="bg-white rounded-lg shadow-sm border">
          <DialogHeader>
            <DialogTitle className="text-gray-800 font-semibold">Choose Your Location</DialogTitle>
            <DialogDescription className="text-gray-600 text-sm">
              Can we use your current location to find local data? If not, you can select a location using the map.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <button
              className="px-3 py-1.5 text-white rounded-md text-xs font-medium flex-1 sm:flex-none sm:w-32 bg-blue-600 hover:bg-blue-700"
              onClick={requestLocationPermission}
            >
              Use My Location
            </button>
            <button
              className="px-3 py-1.5 text-white rounded-md text-xs font-medium flex-1 sm:flex-none sm:w-32 bg-red-600 hover:bg-red-700"
              onClick={declineLocationPermission}
            >
              No, Use Default
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col h-screen overflow-y-auto">
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
              data={useMemo(() => aqiForClosestStation?.data?.iaqi || fallbackIaqi, [aqiForClosestStation?.data?.iaqi, fallbackIaqi])}
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
    </>
  );
};
export default HomePage;