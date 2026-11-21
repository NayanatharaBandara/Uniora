
import unioraLogo from "../assets/uniora-logo.png";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Search,
  UserRound,
  Menu,
  X,
  LogOut
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import "../styles/navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState("student");
  const [menuOpen, setMenuOpen] = useState(false);

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

      if (active && !error) {
        setRole(data?.role || "student");
      }
    }

    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user || null;

      if (active) setUser(currentUser);
      await loadProfile(currentUser);
    }

    loadSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;

      if (active) setUser(currentUser);

      setTimeout(() => {
        if (active) loadProfile(currentUser);
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
    navigate("/");
  }

  function closeMenu() {
    setMenuOpen(false);
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

        <button
          className="uniora-mobile-toggle"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>

        <nav className={`uniora-nav-menu ${menuOpen ? "uniora-nav-open" : ""}`}>

          <div className="uniora-nav-links">
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
          </div>

          <div className="uniora-nav-actions">
            <button
              className="uniora-nav-icon"
              type="button"
              title="Search marketplace"
              onClick={() => {
                closeMenu();
                navigate("/marketplace");
              }}
            >
              <Search size={19} />
            </button>

            <button
              className="uniora-nav-icon"
              type="button"
              title="Shopping cart"
              onClick={() => {
                closeMenu();
                navigate("/cart");
              }}
            >
              <ShoppingCart size={19} />
            </button>

            {user ? (
              <>
                <button
                  className="uniora-account-button"
                  type="button"
                  onClick={() => {
                    closeMenu();
                    navigate("/account");
                  }}
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
                <Link
                  to="/login"
                  className="uniora-login-button"
                  onClick={closeMenu}
                >
                  Login
                </Link>

                <Link
                  to="/login"
                  className="uniora-register-button"
                  onClick={closeMenu}
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

        </nav>
      </div>
    </header>
  );
}

export default Navbar;
