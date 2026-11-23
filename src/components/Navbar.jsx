import unioraLogo from "../assets/uniora-logo.png";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Search,
  UserRound,
  Menu,
  X,
  LogOut,
  ShoppingCart
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import "../styles/navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("student");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile(currentUser) {
      if (!currentUser) {
        if (active) setRole("student");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (active && !error) setRole(data?.role || "student");
    }

    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user || null;
      if (active) setUser(currentUser);
      await loadProfile(currentUser);
    }

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user || null;
        if (active) setUser(currentUser);
        setTimeout(() => {
          if (active) loadProfile(currentUser);
        }, 0);
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleSearch(event) {
    event.preventDefault();
    const query = searchText.trim();
    closeMenu();
    navigate(query ? `/marketplace?search=${encodeURIComponent(query)}` : "/marketplace");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    closeMenu();
    navigate("/");
  }

  const links = [
    { label: "Home", path: "/" },
    { label: "Marketplace", path: "/marketplace" },
    { label: "Second-hand", path: "/secondhand" },
    { label: "Services", path: "/services" },
    { label: "Rentals", path: "/rentals" },
    { label: "Events", path: "/events" }
  ];

  return (
    <header className="uniora-navbar">
      <div className="uniora-nav-inner">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <img
            src={unioraLogo}
            alt="UNIORA - Uni Life, One Platform"
            className="navbar-logo-image"
          />
        </Link>

        <form className="uniora-header-search" onSubmit={handleSearch} role="search">
          <Search size={19} aria-hidden="true" />
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search products, books, stationery..."
            aria-label="Search UNIORA marketplace"
          />
          {searchText && (
            <button
              className="uniora-search-clear"
              type="button"
              onClick={() => setSearchText("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
          <button className="uniora-search-submit" type="submit">Search</button>
        </form>

        <button
          className="uniora-mobile-toggle"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`uniora-nav-menu ${menuOpen ? "uniora-nav-menu-open" : ""}`}>
          <nav className="uniora-nav-links" aria-label="Main navigation">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `uniora-nav-link ${isActive ? "uniora-nav-active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {user && role === "seller" && (
              <NavLink
                to="/my-products"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `uniora-nav-link ${isActive ? "uniora-nav-active" : ""}`
                }
              >
                My Products
              </NavLink>
            )}
          </nav>

          <div className="uniora-nav-actions">
            <button
              className="uniora-nav-icon"
              type="button"
              title="Shopping cart"
              aria-label="Shopping cart"
              onClick={() => { closeMenu(); navigate("/cart"); }}
            >
              <ShoppingCart size={19} />
            </button>

            {user ? (
              <>
                <button
                  className="uniora-account-button"
                  type="button"
                  onClick={() => { closeMenu(); navigate("/account"); }}
                >
                  <UserRound size={17} />
                  <span>My Account</span>
                </button>
                <button
                  className="uniora-logout-button"
                  type="button"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="uniora-auth-actions">
                <Link to="/login" className="uniora-login-button" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/login" className="uniora-register-button" onClick={closeMenu}>
                  Create account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
