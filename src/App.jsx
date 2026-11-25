import SellerProducts from "./pages/SellerProducts";
import { Routes, Route, useLocation, NavLink } from "react-router-dom";
import { Home as HomeIcon, LayoutGrid, UserRound, ShoppingCart } from "lucide-react";

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
import Admin from "./pages/Admin";

function MobileBottomNav() {
  return (
    <nav className="uniora-mobile-bottom-nav" aria-label="Mobile navigation">
      <NavLink to="/" end className={({ isActive }) => isActive ? "mobile-bottom-link active" : "mobile-bottom-link"}>
        <HomeIcon size={21} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/marketplace" className={({ isActive }) => isActive ? "mobile-bottom-link active" : "mobile-bottom-link"}>
        <LayoutGrid size={21} />
        <span>Categories</span>
      </NavLink>
      <NavLink to="/account" className={({ isActive }) => isActive ? "mobile-bottom-link active" : "mobile-bottom-link"}>
        <UserRound size={21} />
        <span>You</span>
      </NavLink>
      <NavLink to="/cart" className={({ isActive }) => isActive ? "mobile-bottom-link active" : "mobile-bottom-link"}>
        <ShoppingCart size={21} />
        <span>Cart</span>
      </NavLink>
    </nav>
  );
}

function App() {
  const location = useLocation();
  const hideMobileNav = ["/login", "/checkout"].includes(location.pathname);

  return (
    <>
      <Navbar />
      <main className="uniora-app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/secondhand" element={<SecondHand />} />
          <Route path="/services" element={<Services />} />
          <Route path="/rentals" element={<Rentals />} />
          <Route path="/events" element={<Events />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<Account />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/birthday-planner" element={<BirthdayPlanner />} />
          <Route path="/my-products" element={<SellerProducts />} />
          <Route path="*" element={
            <div style={{ textAlign: "center", padding: "100px 20px" }}>
              <h1>404</h1>
              <h2>Page Not Found</h2>
              <p>The page you are looking for does not exist.</p>
            </div>
          } />
        </Routes>
      </main>
      {location.pathname !== "/" && <Footer />}
      {!hideMobileNav && <MobileBottomNav />}
    </>
  );
}

export default App;
