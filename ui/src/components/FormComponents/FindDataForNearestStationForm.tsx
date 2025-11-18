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
    <div className="bg-white rounded-lg shadow-sm border p-0 xl:p-0.5 portrait:p-0 mb-2 portrait:mb-1 md:mb-4 mx-auto portrait:w-[75vw] landscape:max-xl:w-fit landscape:max-xl:p-1.5 scale-90">
      <form onSubmit={handleSubmit(submitForm)}>
        <div className="flex flex-col sm:items-center sm:justify-between portrait:gap-1.5">
          {/* Desktop: Show instructional text */}
          <div className="flex-1 portrait:hidden">
            <p className="hidden xl:flex text-gray-700 mb-1.5 text-xs">
              Click on the map to select location and view air quality data
            </p>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className=" text-xs text-gray-600 mb-1 hidden">
                  Latitude
                </label>
                <input
                  className="w-full px-2 py-1.5 border rounded-md hidden text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  placeholder="0.0000"
                  {...register("Latitude", {
                    required: true,
                    pattern: /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)/i,
                  })}
                />
              </div>
              <div className="flex-1">
                <label className=" text-xs text-gray-600 mb-1 hidden">
                  Longitude
                </label>
                <input
                  className="hidden w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className={`px-3 py-1.5 portrait:px-2.5 portrait:py-1 text-white rounded-md text-xs portrait:text-xs font-medium flex-1 sm:flex-none sm:w-28 portrait:w-full whitespace-nowrap ${
                mapVisible
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              type="button"
              onClick={onToggleMap}
            >
              <span className="portrait:hidden">{mapVisible ? "View Air Quality" : "Choose Location"}</span>
              <span className="hidden portrait:inline">{mapVisible ? "View Air Quality" : "Choose Location"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
