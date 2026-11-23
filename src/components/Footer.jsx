import React from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Mail, MapPin, Phone, ArrowRight } from 'lucide-react'
import '../styles/footer.css'

const exploreLinks = [
  { to: '/', label: 'Home' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/secondhand', label: 'Second-hand items' },
  { to: '/services', label: 'Student services' },
  { to: '/rentals', label: 'Rentals' },
  { to: '/events', label: 'Events' },
]

const accountLinks = [
  { to: '/account', label: 'My account' },
  { to: '/my-products', label: 'My products' },
  { to: '/cart', label: 'Shopping cart' },
  { to: '/birthday-planner', label: 'Birthday planner' },
  { to: '/login', label: 'Sign in' },
]

function FooterLinkGroup({ title, links }) {
  return (
    <div className="uf-group">
      <h3 className="uf-heading">{title}</h3>
      <ul className="uf-list">
        {links.map((item) => (
          <li key={item.to}>
            <Link to={item.to} className="uf-link">{item.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="uf-footer">
      <section className="uf-cta-section">
        <div className="uf-container uf-cta-inner">
          <span className="uf-eyebrow">Your campus, connected</span>
          <h2 className="uf-cta-title">Everything for university life, in one place.</h2>
          <p className="uf-cta-subtitle">
            Discover products, find second-hand items, book student services,
            explore rentals and keep up with campus events.
          </p>
          <div className="uf-cta-actions">
            <Link to="/marketplace" className="uf-btn-primary">
              Explore marketplace <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="uf-btn-outline">Join UNIORA</Link>
          </div>
        </div>
      </section>

      <section className="uf-main-section">
        <div className="uf-container uf-grid">
          <div className="uf-brand-col">
            <Link to="/" className="uf-brand-header" aria-label="UNIORA home">
              <div className="uf-logo-box"><GraduationCap size={22} /></div>
              <div>
                <div className="uf-brand-name">UNIORA</div>
                <div className="uf-brand-tagline">Uni life, one platform</div>
              </div>
            </Link>
            <p className="uf-brand-desc">
              A student marketplace connecting university students with
              products, services, rentals and campus opportunities.
            </p>
          </div>

          <div className="uf-links-wrapper">
            <FooterLinkGroup title="Explore" links={exploreLinks} />
            <FooterLinkGroup title="Your UNIORA" links={accountLinks} />
          </div>

          <div className="uf-info-col">
            <div className="uf-campus-card">
              <h3 className="uf-card-title">Our campus</h3>
              <div className="uf-campus-row">
                <span>Sabaragamuwa University of Sri Lanka</span>
                <span className="uf-badge-live">Live</span>
              </div>
            </div>
            <div className="uf-contact-block">
              <h3 className="uf-heading">Contact</h3>
              <ul className="uf-contact-list">
                <li><Mail size={16} className="uf-icon" /><a href="mailto:uniora@gmail.com">uniora@gmail.com</a></li>
                <li><Phone size={16} className="uf-icon" /><a href="tel:0758475965">075 847 5965</a></li>
                <li><MapPin size={16} className="uf-icon" /><span>Sabaragamuwa University, Belihuloya</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="uf-bottom-bar">
        <div className="uf-container uf-bottom-inner">
          <p className="uf-copyright">
            © {new Date().getFullYear()} UNIORA. Made for university life.
          </p>
        </div>
      </div>
    </footer>
  )
}
