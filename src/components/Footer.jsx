
import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail } from "lucide-react";
import "../styles/footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h2>UNIORA</h2>
          <p>Uni Life, One Platform.</p>
          <p>
            Making university life easier through one connected
            student platform.
          </p>
        </div>

        <div className="footer-column">
          <h3>Explore</h3>
          <Link to="/">Home</Link>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/secondhand">Second-hand</Link>
          <Link to="/services">Services</Link>
        </div>

        <div className="footer-column">
          <h3>Discover</h3>
          <Link to="/rentals">Rentals</Link>
          <Link to="/events">Events</Link>
          <Link to="/birthday-planner">Birthday Planner</Link>
          <Link to="/account">My Account</Link>
        </div>

        <div className="footer-column">
          <h3>Connect with us</h3>
          <p><Mail size={16} /> hello@uniora.com</p>
          <div className="footer-socials">
            <a href="#instagram" aria-label="Instagram"><Instagram /></a>
            <a href="#facebook" aria-label="Facebook"><Facebook /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 UNIORA. All rights reserved.</p>
        <p>Made for university life ❤️</p>
      </div>
    </footer>
  );
}

export default Footer;
