import React from 'react'
import {
  Mail,
  MapPin,
  Phone,
  MessageCircle,
  GraduationCap
} from 'lucide-react'

import '../styles/footer.css'

const shopLinks = [
  { to: '/marketplace?category=stationery', label: 'Stationery' },
  { to: '/marketplace?category=gifts-cakes', label: 'Gifts and cakes' },
  { to: '/rentals?category=costumes', label: 'Costume rentals' },
  { to: '/services?category=photography', label: 'Photography' },
  { to: '/rentals?category=equipment', label: 'Event equipment' },
  { to: '/services?category=transport', label: 'Transport' },
  { to: '/services?category=repairs', label: 'Repairs' },
  { to: '/secondhand', label: 'Student resale' },
]

const toolLinks = [
  { to: '/birthday-planner', label: 'Birthday planner' },
  { to: '/events', label: 'Events and event planner' },
  { to: '/urgent-needs', label: 'Urgent needs' },
  { to: '/cart', label: 'Wishlist and cart' },
  { to: '/account', label: 'Order history' },
]

const supportLinks = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/safety-tips', label: 'Safety tips' },
  { to: '/provider-guide', label: 'Provider guide' },
  { to: '/contact', label: 'Contact us' },
]

function LinkGroup({ title, links }) {
  return (
    <div className="uf-group">
      <h3 className="uf-heading">{title}</h3>
      <ul className="uf-list">
        {links.map((item) => (
          <li key={item.label}>
            <a href={item.to} className="uf-link">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Footer() {
  return (
    <footer className="uf-footer">
      {/* Top CTA Banner */}
      <div className="uf-cta-section">
        <div className="uf-container uf-cta-inner">
          <span className="uf-eyebrow">For students and providers</span>
          <h2 className="uf-cta-title">
            Everything for campus life, in one place
          </h2>
          <p className="uf-cta-subtitle">
            Shop, rent, book services and plan events with trusted local providers.
          </p>
          <div className="uf-cta-actions">
            <a href="/marketplace" className="uf-btn-primary">
              Browse listings
            </a>
            <a href="/join" className="uf-btn-outline">
              Become a provider
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="uf-main-section">
        <div className="uf-container uf-grid">
          {/* Brand Column */}
          <div className="uf-brand-col">
            <div className="uf-brand-header">
              <div className="uf-logo-box" aria-hidden="true">
                <GraduationCap size={22} />
              </div>
              <div>
                <div className="uf-brand-name">UNIORA</div>
                <div className="uf-brand-tagline">Uni life, one platform</div>
              </div>
            </div>
            <p className="uf-brand-desc">
              A student marketplace and service platform for products, rentals,
              bookings and events.
            </p>
          </div>

          {/* Navigation Columns */}
          <div className="uf-links-wrapper">
            <LinkGroup title="Shop and services" links={shopLinks} />
            <div className="uf-stacked-groups">
              <LinkGroup title="Student tools" links={toolLinks} />
              <LinkGroup title="Support" links={supportLinks} />
            </div>
          </div>

          {/* Campuses & Contact Column */}
          <div className="uf-info-col">
            <div className="uf-campus-card">
              <h3 className="uf-card-title">Campuses</h3>
              <div className="uf-campus-row">
                <span>Sabaragamuwa University</span>
                <span className="uf-badge-live">Live</span>
              </div>
              <div className="uf-campus-row">
                <span>More universities</span>
                <span className="uf-badge-soon">Coming soon</span>
              </div>
            </div>

            <div className="uf-contact-block">
              <h3 className="uf-heading">Contact</h3>
              <ul className="uf-contact-list">
                <li>
                  <Mail size={16} className="uf-icon" />
                  <a href="mailto:uniora@gmail.com">uniora@gmail.com</a>
                </li>
                <li>
                  <Phone size={16} className="uf-icon" />
                  <a href="tel:0758475965">075 847 5965</a>
                </li>
                <li>
                  <MapPin size={16} className="uf-icon" />
                  <span>Sabaragamuwa University, Belihuloya</span>
                </li>
              </ul>

              <div className="uf-socials">
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="uf-social-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="uf-social-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="https://wa.me/94758475965"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  className="uf-social-btn"
                >
                  <MessageCircle size={16} />
                </a>
                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="uf-social-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="uf-bottom-bar">
        <div className="uf-container uf-bottom-inner">
          <div className="uf-legal-links">
            <a href="/privacy">Privacy policy</a>
            <span>•</span>
            <a href="/terms">Terms</a>
            <span>•</span>
            <a href="/refund-policy">Refund and cancellation</a>
          </div>
          <p className="uf-copyright">
            © {new Date().getFullYear()} Uniora. Made at Sabaragamuwa University.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer