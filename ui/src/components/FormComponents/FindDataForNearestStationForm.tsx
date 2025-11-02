import { type JSX } from "react";
import { useForm } from "react-hook-form";
import "./FindDataForNearestStationForm.css";

export interface LongLat {
  Longitude: number;
  Latitude: number;
}

export interface FindDataForNearestStationFormProps {
  currentLongLat: {
    Longitude: number;
    Latitude: number;
  };
  onCoordinatesChange?: (coordinates: LongLat) => void;
  mapVisible: boolean;
  onToggleMap: () => void;
}

export function FindDataForNearestStationForm({
  onCoordinatesChange,
  mapVisible,
  onToggleMap,
}: FindDataForNearestStationFormProps): JSX.Element {
  const { register, handleSubmit } = useForm<LongLat>({
    defaultValues: { Longitude: 0, Latitude: 0 },
  });

  function submitForm(data: LongLat) {
    if (onCoordinatesChange) {
      onCoordinatesChange(data);
    }
    // Map visibility is now only controlled by the toggle button
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-2 mb-5 mx-auto">
      <form onSubmit={handleSubmit(submitForm)}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <p className="font-medium text-gray-700 mb-2">
              Click on the map to select location and view air quality data
            </p>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className=" text-sm text-gray-600 mb-1 hidden">
                  Latitude
                </label>
                <input
                  className="w-full px-3 py-2 border rounded-md hidden text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  placeholder="0.0000"
                  {...register("Latitude", {
                    required: true,
                    pattern: /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)/i,
                  })}
                />
              </div>
              <div className="flex-1">
                <label className=" text-sm text-gray-600 mb-1 hidden">
                  Longitude
                </label>
                <input
                  className="hidden w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  placeholder="0.0000"
                  {...register("Longitude", {
                    required: true,
                    pattern: /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)/i,
                  })}
                />
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="flex gap-2 sm:w-auto w-full">
            <button
              className={`px-4 py-2 text-white rounded-md text-sm font-medium flex-1 sm:flex-none sm:w-32 ${
                mapVisible
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              type="button"
              onClick={onToggleMap}
            >
              {mapVisible ? "Hide Map" : "Show Map"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
