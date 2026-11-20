

import SellerProducts from "./pages/SellerProducts";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import SecondHand from "./pages/SecondHand";
import Services from "./pages/Services";
import Rentals from "./pages/Rentals";
import Events from "./pages/Events";

import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";

import Login from "./pages/Login";
import Account from "./pages/Account";
import BirthdayPlanner from "./pages/BirthdayPlanner";

function App() {
  const location = useLocation();

  return (
    <>
      <Navbar />

      <main>
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<Home />} />

          {/* Marketplace */}
          <Route path="/marketplace" element={<Marketplace />} />

          {/* Product Details */}
          <Route path="/product/:id" element={<ProductDetails />} />

          {/* Shopping Cart */}
          <Route path="/cart" element={<Cart />} />

          {/* Checkout */}
          <Route path="/checkout" element={<Checkout />} />

          {/* Other Sections */}
          <Route path="/secondhand" element={<SecondHand />} />
          <Route path="/services" element={<Services />} />
          <Route path="/rentals" element={<Rentals />} />
          <Route path="/events" element={<Events />} />

          {/* User Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<Account />} />

          {/* Birthday Planner */}
          <Route
            path="/birthday-planner"
            element={<BirthdayPlanner />}
          />
          <Route path="/my-products" element={<SellerProducts />} />

          {/* Page Not Found */}
          <Route
            path="*"
            element={
              <div style={{ textAlign: "center", padding: "100px 20px" }}>
                <h1>404</h1>
                <h2>Page Not Found</h2>
                <p>The page you are looking for does not exist.</p>
              </div>
            }
          />
        </Routes>
      </main>

      {/* Avoid duplicate footer on Home Page */}
      {location.pathname !== "/" && <Footer />}
    </>
  );
}

export default App;
