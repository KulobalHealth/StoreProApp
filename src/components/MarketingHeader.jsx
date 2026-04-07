import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import logo from '../MainLogo.jpeg'

const marketingHeaderStyles = `
.mh-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 1.1rem 5%;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
}

.mh-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  overflow: hidden;
}

.mh-logo-img {
  height: 36px;
  object-fit: contain;
  will-change: transform, opacity;
}

.mh-nav-links {
  display: flex;
  gap: 2.2rem;
  align-items: center;
  justify-self: center;
  list-style: none;
  padding: 0;
  margin: 0;
}

.mh-nav-item {
  position: relative;
}

.mh-nav-links a {
  text-decoration: none;
  color: #5a6a7e;
  font-size: 0.92rem;
  font-weight: 500;
  transition: color 0.2s;
}

.mh-nav-links a:hover {
  color: #0B2247;
}

.mh-nav-menu-trigger {
  appearance: none;
  border: 0;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0;
  cursor: pointer;
  color: #5a6a7e;
  font-size: 0.92rem;
  font-weight: 500;
  font-family: inherit;
  transition: color 0.2s ease;
}

.mh-nav-menu-trigger:hover,
.mh-nav-menu-trigger:focus-visible {
  color: #0B2247;
  outline: none;
}

.mh-nav-item--mega {
  padding: 1rem 0;
  margin: -1rem 0;
}

.mh-mega-menu {
  position: absolute;
  top: calc(100% + 18px);
  left: 0;
  width: min(760px, 78vw);
  padding: 1.25rem;
  border: 1px solid rgba(11, 34, 71, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.14);
  backdrop-filter: blur(14px);
}

.mh-mega-menu::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 18px;
  width: 16px;
  height: 16px;
  transform: rotate(45deg);
  background: rgba(255, 255, 255, 0.98);
  border-left: 1px solid rgba(11, 34, 71, 0.08);
  border-top: 1px solid rgba(11, 34, 71, 0.08);
}

.mh-mega-menu-intro {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(11, 34, 71, 0.08);
}

.mh-mega-menu-label {
  display: inline-block;
  margin-bottom: 0.45rem;
  color: #FF751F;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.mh-mega-menu-intro h3 {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.2;
  letter-spacing: -0.03em;
  color: #0B2247;
}

.mh-mega-menu-intro p {
  margin: 0.45rem 0 0;
  color: #5a6a7e;
  font-size: 0.92rem;
}

.mh-mega-menu-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.mh-mega-menu-card {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 0.95rem;
  border-radius: 12px;
  border: 1px solid rgba(11, 34, 71, 0.06);
  background: #fff;
  text-decoration: none;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.mh-mega-menu-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 117, 31, 0.22);
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.08);
}

.mh-mega-menu-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 117, 31, 0.08);
  color: #0B2247;
  flex: 0 0 auto;
}

.mh-mega-menu-copy {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mh-mega-menu-copy strong {
  color: #0B2247;
  font-size: 0.95rem;
}

.mh-mega-menu-copy span {
  color: #5a6a7e;
  font-size: 0.82rem;
  line-height: 1.5;
}

.mh-nav-signin {
  color: #0B2247 !important;
  font-weight: 600 !important;
}

.mh-nav-cta {
  background: #0B2247;
  color: #ffffff !important;
  padding: 0.55rem 1.3rem;
  border-radius: 4px;
  font-size: 0.88rem !important;
  font-weight: 600 !important;
  transition: background 0.2s, transform 0.15s !important;
}

.mh-nav-cta:hover {
  background: #e16614 !important;
  transform: translateY(-1px);
}

@media (max-width: 900px) {
  .mh-nav {
    grid-template-columns: 1fr auto;
    padding: 1rem 5%;
  }

  .mh-nav-links {
    display: none;
  }
}
`

const featureItems = [
  {
    title: 'Inventory',
    description: 'Track stock levels, movement, and replenishment with confidence.',
    link: '/inventory-management',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    title: 'Point of Sale',
    description: 'Sell faster with connected checkout, payments, and receipts.',
    link: '/point-of-sale',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
        <path d="M6 8h.01M9 8h.01" />
        <path d="M6 11h12" />
      </svg>
    ),
  },
  {
    title: 'Accounting',
    description: 'Manage invoicing, billing, receivables, and finance workflows.',
    link: '/invoicing-accounting',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5.5h16" />
        <path d="M4 18.5h16" />
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 9h8" />
        <path d="M8 13h3" />
        <path d="M15.5 12l1.5 1.5 2.5-3" />
        <path d="M8 17h5" />
      </svg>
    ),
  },
  {
    title: 'Business Reports',
    description: 'Turn daily store activity into clearer reporting and insight.',
    link: '/business-reports',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19h16" />
        <path d="M7 16V10" />
        <path d="M12 16V6" />
        <path d="M17 16v-4" />
        <path d="M5 8.5l4-3 3 2 5-3.5" />
        <path d="M15 4h2.5v2.5" />
      </svg>
    ),
  },
  {
    title: 'Credit & Cashflow Management',
    description: 'Explore the upcoming tools for balances, due dates, and cash visibility.',
    link: '/credit-cashflow-management',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    title: 'Online & Offline Sync',
    description: 'Keep POS running through internet issues and sync later.',
    link: '/online-offline-sync',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
]

const MarketingHeader = () => {
  const [isFeaturesMenuOpen, setIsFeaturesMenuOpen] = useState(false)
  const homeLinks = useMemo(() => ({
    how: '/#how',
    pricing: '/#pricing',
    testimonials: '/#testimonials',
  }), [])

  return (
    <>
      <style>{marketingHeaderStyles}</style>
      <motion.nav
        className="mh-nav"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Link to="/" className="mh-logo" aria-label="MicroBiz home">
          <motion.img
            src={logo}
            alt="MicroBiz"
            className="mh-logo-img"
            initial={{ x: -28, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.65, delay: 0.18, ease: 'easeOut' }}
          />
        </Link>
        <ul className="mh-nav-links">
          <li
            className="mh-nav-item mh-nav-item--mega"
            onMouseEnter={() => setIsFeaturesMenuOpen(true)}
            onMouseLeave={() => setIsFeaturesMenuOpen(false)}
            onFocus={() => setIsFeaturesMenuOpen(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setIsFeaturesMenuOpen(false)
              }
            }}
          >
            <button
              type="button"
              className="mh-nav-menu-trigger"
              aria-expanded={isFeaturesMenuOpen}
              aria-haspopup="true"
              onClick={() => setIsFeaturesMenuOpen((currentValue) => !currentValue)}
            >
              Features
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            <AnimatePresence>
              {isFeaturesMenuOpen && (
                <motion.div
                  className="mh-mega-menu"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  <div className="mh-mega-menu-intro">
                    <span className="mh-mega-menu-label">Explore Features</span>
                    <h3>Everything MicroBiz brings into one retail workflow.</h3>
                    <p>Open any feature page to see how it supports day-to-day store operations.</p>
                  </div>

                  <div className="mh-mega-menu-grid">
                    {featureItems.map((item) => (
                      <Link
                        key={item.title}
                        to={item.link}
                        className="mh-mega-menu-card"
                        onClick={() => setIsFeaturesMenuOpen(false)}
                      >
                        <span className="mh-mega-menu-icon">{item.icon}</span>
                        <span className="mh-mega-menu-copy">
                          <strong>{item.title}</strong>
                          <span>{item.description}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
          <li><a href={homeLinks.how}>How It Works</a></li>
          <li><a href={homeLinks.pricing}>Pricing</a></li>
          <li><a href={homeLinks.testimonials}>Reviews</a></li>
          <li><Link to="/login" className="mh-nav-signin">Sign In</Link></li>
          <li><Link to="/register" className="mh-nav-cta">Start Free →</Link></li>
        </ul>
      </motion.nav>
    </>
  )
}

export default MarketingHeader
