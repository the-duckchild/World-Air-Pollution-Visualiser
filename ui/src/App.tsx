import HomePage from "./Pages/Home/HomePage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/globals.css";
import "./styles/app.css";

function App() {
  return (
    <BrowserRouter>
      {/* <Header />
             <Navbar /> */}
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
      {/* <Footer />       */}
    </BrowserRouter>
  );
}

export default App;
