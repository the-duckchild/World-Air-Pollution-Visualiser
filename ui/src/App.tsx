import { TickerTape } from "./components/TickerTape";
import AqiFiguresDisplay from "./components/AqiFiguresDisplay";
import { FindDataForNearestStationForm } from "./components/FormComponents/FindDataForNearestStationForm";
import "leaflet/dist/leaflet.css";
import "./styles/globals.css";
import "./styles/app.css";

function App() {

  return (
    <>
      <div className="min-h-95vh flex flex-col min-w-screen items-center mt-50 rounded-sm">
        <div className="flex">
          <AqiFiguresDisplay />
        </div>
        <FindDataForNearestStationForm />
      </div>
      <TickerTape />
    </>
  );
}

export default App;
