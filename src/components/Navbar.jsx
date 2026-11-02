
import { Link, NavLink } from "react-router-dom";
import { Search, ShoppingBag, UserRound, Menu } from "lucide-react";
import "../styles/navbar.css";

function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="navbar-logo">
        <span>UNIORA</span>
        <small>Uni Life, One Platform</small>
      </Link>

      <nav className="navbar-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/marketplace">Marketplace</NavLink>
        <NavLink to="/secondhand">Second-hand</NavLink>
        <NavLink to="/services">Services</NavLink>
        <NavLink to="/rentals">Rentals</NavLink>
        <NavLink to="/events">Events</NavLink>
      </nav>

      <div className="navbar-actions">
        <button aria-label="Search"><Search /></button>
        <Link to="/account" aria-label="Account"><UserRound /></Link>
        <Link to="/marketplace" aria-label="Shopping"><ShoppingBag /></Link>
      </div>

      <button className="mobile-menu" aria-label="Menu">
        <Menu />
      </button>
    </header>
  );
}

export default Navbar;
