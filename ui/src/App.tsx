import { useState } from "react";
import { TickerTape } from "./components/TickerTape";
import AqiFiguresDisplay from "./components/AqiFiguresDisplay";
import { FindDataForNearestStationForm } from "./components/FormComponents/FindDataForNearestStationForm";
import "./styles/globals.css";
import "./styles/app.css";

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
   
      <div className="min-h-95vh flex flex-col min-w-screen items-center mt-50 rounded-sm">
        <div className="flex"> 
          <AqiFiguresDisplay />
        </div>
        <div>
          <FindDataForNearestStationForm />
        </div>
</div>
          <TickerTape />
        
      
    </>

  );
}

export default App;
