import SellerProducts from "./pages/SellerProducts";
import { Routes, Route, useLocation, NavLink, Link } from "react-router-dom";
import { Home as HomeIcon, LayoutGrid, UserRound, ShoppingCart, ArrowRight } from "lucide-react";

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


const pageSequence = [
  { path: "/", label: "Home" },
  { path: "/marketplace", label: "Marketplace" },
  { path: "/services", label: "Services" },
  { path: "/rentals", label: "Rentals" },
  { path: "/events", label: "Events" },
];

function PageNextNavigation({ pathname }) {
  const currentIndex = pageSequence.findIndex((page) => page.path === pathname);
  if (currentIndex < 0 || currentIndex === pageSequence.length - 1) return null;

  const nextPage = pageSequence[currentIndex + 1];
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", padding: "28px 7%", background: "#f8f5fa" }}>
      <Link
        to={nextPage.path}
        style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "14px 22px", borderRadius: 12, background: "#7954a5", color: "#fff", textDecoration: "none", fontWeight: 700, boxShadow: "0 8px 20px rgba(80,52,110,.16)" }}
      >
        Continue to {nextPage.label} <ArrowRight size={18} />
      </Link>
    </div>
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
      <PageNextNavigation pathname={location.pathname} />
      {location.pathname !== "/" && <Footer />}
      {!hideMobileNav && <MobileBottomNav />}
    </>
  );
}

export default App;
