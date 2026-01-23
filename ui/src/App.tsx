import HomePage from "./Pages/Home/HomePage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/globals.css";
import "./styles/app.css";

function App() {
  return (
    <BrowserRouter>
    
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
      
    </BrowserRouter>
  );
}

export default App;
