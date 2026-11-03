
import {
  Mail,
  MapPin,
  Phone,
  Heart
} from 'lucide-react'

import '../styles/footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-section footer-brand">
          <h2>UNIORA</h2>

          <p>
            Uni Life, One Platform.
            Making university life easier,
            smarter and more connected.
          </p>

          <div className="footer-socials">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>

            <a href="https://www.facebook.com/">
              Facebook
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <a href="/">Home</a>
          <a href="/marketplace">Marketplace</a>
          <a href="/secondhand">Second-hand</a>
          <a href="/services">Student Services</a>
        </div>

        <div className="footer-section">
          <h3>Explore More</h3>
          <a href="/rentals">Rentals</a>
          <a href="/events">Events</a>
          <a href="/birthday-planner">Birthday Planner</a>
          <a href="/account">My Account</a>
        </div>

        <div className="footer-section">
          <h3>Contact Us</h3>

          <p>
            <Mail size={17} />
            uniora@example.com
          </p>

          <p>
            <Phone size={17} />
            Contact our team
          </p>

          <p>
            <MapPin size={17} />
            University Community
          </p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} UNIORA.
          All rights reserved.
        </p>

        <p>
          Made with <Heart size={15} /> for university life.
        </p>
      </div>
    </footer>
  )
}

export default Footer
