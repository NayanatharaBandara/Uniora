
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import SecondHand from "./pages/SecondHand";
import Services from "./pages/Services";
import Rentals from "./pages/Rentals";
import Events from "./pages/Events";

function App() {
  return (
    <>
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/secondhand" element={<SecondHand />} />
          <Route path="/services" element={<Services />} />
          <Route path="/rentals" element={<Rentals />} />
          <Route path="/events" element={<Events />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;
