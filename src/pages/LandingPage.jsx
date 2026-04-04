import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import logo from '../MainLogo.jpeg'
import MarketingFooter from '../components/MarketingFooter'
import heroVideo from '../video /Professional bold we are hiring promo linkedin post  (Presentation).mp4'
import client1 from '../clients/1662123687706.jpeg'
import client2 from '../clients/client2.png'
import client3 from '../clients/download.jpeg'
import client4 from '../clients/Boat Herbal Ventures.jpeg'
import client5 from '../clients/Screenshot_2025-09-21_091610-removebg-preview.png'
import reviewer1 from '../01.jpg'
import reviewer2 from '../02.jpg'
import reviewer3 from '../03.jpg'
import mockup1 from '../mobile-mockups/mockup1.png'
import mockup2 from '../mobile-mockups/mockup2.png'

/* ─── Reusable animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

/* ─────────────────────── LANDING PAGE ─────────────────────── */
const LandingPage = () => {
  const navigate = useNavigate()

  /* ── DATA ── */
  const features = [
    {
      icon: (
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
      title: 'Inventory',
      bg: '#0B2247',
      link: '/inventory-management',
    },
    {
      icon: (
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
          <path d="M6 8h.01M9 8h.01" /><path d="M6 11h12" />
        </svg>
      ),
      title: 'Point of Sale',
      bg: '#FF751F',
      link: '/point-of-sale',
    },
    {
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
      title: 'Accounting',
      bg: '#0B2247',
      link: '/invoicing-accounting',
    },
    {
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
      title: 'Business Reports',
      bg: '#FF751F',
      link: '/business-reports',
    },
    {
      icon: (
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
        </svg>
      ),
      title: 'Credit & Cashflow Management',
      bg: '#0B2247',
      link: '/credit-cashflow-management',
    },
    {
      icon: (
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      ),
      title: 'Online & Offline Sync',
      bg: '#FF751F',
      link: '/online-offline-sync',
    },
  ]

  const steps = [
    {
      num: '01',
      icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>,
      title: 'Create account',
      desc: 'Sign up with your phone or email in seconds.',
      bg: '#0B2247',
    },
    {
      num: '02',
      icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
      title: 'Add products',
      desc: 'Import a spreadsheet or add items manually.',
      bg: '#FF751F',
    },
    {
      num: '03',
      icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /><path d="M6 8h.01M9 8h.01" /><path d="M6 11h12" /></svg>,
      title: 'Start selling',
      desc: 'Ring up sales, collect payments, print receipts.',
      bg: '#0B2247',
    },
    {
      num: '04',
      icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>,
      title: 'Grow',
      desc: 'Track trends and make smarter decisions.',
      bg: '#FF751F',
    },
  ]

  const testimonials = [
    { text: 'My losses from expired items dropped massively in the first month. I check my phone and know exactly what\'s running low.', name: 'Abena Kyei', role: 'Pharmacy Owner, Kumasi', photo: reviewer1, metric: '40%', metricLabel: 'less waste' },
    { text: 'StorePro solved everything. Now we\'re faster, more accurate, and I can see every transaction from my phone.', name: 'Kwame Owusu', role: 'Supermarket Manager, Accra', photo: reviewer2, metric: '2x', metricLabel: 'faster checkout' },
    { text: 'I run three boutiques and StorePro lets me see all of them in one dashboard. Setup took less than an hour.', name: 'Suzzana Boateng', role: 'Fashion Retailer, Dakar', photo: reviewer3, metric: '3', metricLabel: 'stores managed' },
  ]

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'GH₵ 300',
      period: '/ month',
      popular: false,
      features: ['Up to 100 products', 'Basic POS & sales tracking', '1 staff user', 'Daily summary report', 'Mobile app access'],
      cta: 'Get Started',
      bg: '#ffffff',
    },
    {
      name: 'Professional',
      price: 'GH₵ 1,200',
      period: '/ month',
      popular: true,
      features: ['Unlimited products', 'Full POS + Mobile Money', 'Up to 10 staff users', 'Advanced analytics', 'Low-stock alerts & reordering', 'Supplier management', 'SMS receipts'],
      cta: 'Start Free Trial',
      bg: '#0B2247',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      popular: false,
      features: ['Multi-branch management', 'Unlimited staff users', 'Custom integrations & API', 'Dedicated account manager', 'Priority support (24/7)', 'Custom onboarding & training'],
      cta: 'Contact Sales',
      bg: '#ffffff',
    },
  ]

  const trustedLogos = [
    { src: client1, alt: 'Client logo 1' },
    { src: client2, alt: 'Client logo 2' },
    { src: client3, alt: 'Client logo 3' },
    { src: client4, alt: 'Boat Herbal Ventures' },
    { src: client5, alt: 'Client logo 5' },
  ]

  const featureMenuItems = [
    {
      title: 'Inventory',
      description: 'Track stock levels, movement, and replenishment with confidence.',
      link: '/inventory-management',
      icon: features[0].icon,
    },
    {
      title: 'Point of Sale',
      description: 'Sell faster with connected checkout, payments, and receipts.',
      link: '/point-of-sale',
      icon: features[1].icon,
    },
    {
      title: 'Accounting',
      description: 'Manage invoicing, billing, receivables, and finance workflows.',
      link: '/invoicing-accounting',
      icon: features[2].icon,
    },
    {
      title: 'Business Reports',
      description: 'Turn daily store activity into clearer reporting and insight.',
      link: '/business-reports',
      icon: features[3].icon,
    },
    {
      title: 'Credit & Cashflow Management',
      description: 'Explore the upcoming tools for balances, due dates, and cash visibility.',
      link: '/credit-cashflow-management',
      icon: features[4].icon,
    },
    {
      title: 'Online & Offline Sync',
      description: 'Keep POS running through internet issues and sync later.',
      link: '/online-offline-sync',
      icon: features[5].icon,
    },
  ]

  const [showCookies, setShowCookies] = useState(false)
  const [isFeaturesMenuOpen, setIsFeaturesMenuOpen] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('lp-cookie-consent')
    if (!consent) {
      const timer = setTimeout(() => setShowCookies(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('lp-cookie-consent', 'accepted')
    setShowCookies(false)
  }

  const declineCookies = () => {
    localStorage.setItem('lp-cookie-consent', 'declined')
    setShowCookies(false)
  }

  return (
    <div className="lp-root">
      {/* ─── SCOPED STYLES ─── */}
      <style>{landingStyles}</style>

      {/* ─── NAV ─── */}
      <motion.nav
        className="lp-nav"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Link to="/" className="lp-logo" aria-label="MicroBiz home">
          <motion.img
            src={logo}
            alt="MicroBiz"
            className="lp-logo-img"
            initial={{ x: -28, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.65, delay: 0.18, ease: 'easeOut' }}
          />
        </Link>
        <ul className="lp-nav-links">
          <li
            className="lp-nav-item lp-nav-item--mega"
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
              className="lp-nav-menu-trigger"
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
                  className="lp-mega-menu"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  <div className="lp-mega-menu-intro">
                    <span className="lp-mega-menu-label">Explore Features</span>
                    <h3>Everything MicroBiz brings into one retail workflow.</h3>
                    <p>Open any feature page to see how it supports day-to-day store operations.</p>
                  </div>

                  <div className="lp-mega-menu-grid">
                    {featureMenuItems.map((item) => (
                      <Link
                        key={item.title}
                        to={item.link}
                        className="lp-mega-menu-card"
                        onClick={() => setIsFeaturesMenuOpen(false)}
                      >
                        <span className="lp-mega-menu-icon">{item.icon}</span>
                        <span className="lp-mega-menu-copy">
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
          <li><a href="#how">How It Works</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#testimonials">Reviews</a></li>
          <li><Link to="/login" className="lp-nav-signin">Sign In</Link></li>
          <li><Link to="/register" className="lp-nav-cta">Start Free →</Link></li>
        </ul>
      </motion.nav>

      {/* ─── HERO ─── */}
      <section className="lp-hero" id="home">
        {/* Ambient background effects */}
        <div className="lp-hero-glow lp-hero-glow-1" />
        <div className="lp-hero-glow lp-hero-glow-2" />
        <div className="lp-hero-noise" />
        <div className="lp-hero-grid-bg" />

       
            <motion.div
              className="lp-hero-center"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div className="lp-hero-badge" variants={fadeUp} transition={{ duration: 0.5 }}>
                <span className="lp-badge-pulse" />
                <span>
                  <span role="img" aria-label="Ghana flag" style={{ fontSize: '1.2em', marginRight: '0.4em' }}>🇬🇭</span>
                  Now available in Ghana
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp} transition={{ duration: 0.6 }}>
                <span className="lp-hero-line">The operating system</span>
                <span className="lp-hero-line">for <em>modern retail.</em></span>
              </motion.h1>

              <motion.p className="lp-hero-sub" variants={fadeUp} transition={{ duration: 0.6 }}>
                Inventory, POS, staff management, and real-time analytics all unified in one beautiful platform. Built for African businesses that move fast.
              </motion.p>

              <motion.div className="lp-hero-actions" variants={fadeUp} transition={{ duration: 0.5 }}>
                <Link to="/register" className="lp-btn-primary">
                  <span>Get Started Free</span>
                  <span className="lp-btn-shine" />
                </Link>
                <Link to="/download" className="lp-btn-secondary">
                  <span className="lp-play-icon">↓</span>
                  Download Desktop
                </Link>
              </motion.div>

              <motion.div className="lp-hero-social-proof" variants={fadeUp} transition={{ duration: 0.5 }}>
                <div className="lp-avatar-stack">
                  {['AK', 'KO', 'FS', 'DA', 'NM'].map((initials, i) => (
                <motion.div
                  key={i}
                  className="lp-stack-avatar"
                  style={{ zIndex: 5 - i }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.08, type: 'spring', stiffness: 260, damping: 20 }}
                >
                  {initials}
                </motion.div>
                  ))}
                </div>
                <div className="lp-proof-text">
                  <span className="lp-proof-stars">★★★★★</span>
                  <span>Trusted by <strong>10+</strong> store owners</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Video */}
        <motion.div
          className="lp-hero-video"
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
        >
          <div className="lp-video-frame">
            <div className="lp-video-bar">
              <div className="lp-vdot" style={{ background: '#ff5f57' }} />
              <div className="lp-vdot" style={{ background: '#ffbd2e' }} />
              <div className="lp-vdot" style={{ background: '#28c840' }} />
            </div>
            <video
              src={heroVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="lp-video-el"
            />
          </div>
        </motion.div>
      </section>

      {/* ─── TRUSTED ─── */}
      <motion.div
        className="lp-trusted"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <motion.p variants={fadeUp} transition={{ duration: 0.5 }}>Trusted by stores across</motion.p>
        <div className="lp-brand-marquee">
          <div className="lp-brand-row">
            {[...trustedLogos, ...trustedLogos].map((item, index) => (
              <img
                key={`${item.alt}-${index}`}
                src={item.src}
                alt={item.alt}
                className="lp-client-logo"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* ─── FEATURES ─── */}
      <section className="lp-features" id="features">
        <motion.div
          className="lp-features-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          transition={{ duration: 0.6 }}
        >
          <div className="lp-section-label">Features</div>
          <h2 className="lp-section-title" style={{ textAlign: 'center' }}>
            Everything you need,<br />nothing you don't
          </h2>
          <p className="lp-section-sub" style={{ textAlign: 'center', margin: '0.8rem auto 0' }}>
            Simple, powerful tools for real business owners.
          </p>
        </motion.div>

        <motion.div
          className="lp-features-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="lp-fcard"
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              whileHover={{ y: -4, scale: 1.03 }}
              onClick={f.link ? () => navigate(f.link) : undefined}
              onKeyDown={f.link ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  navigate(f.link)
                }
              } : undefined}
              role={f.link ? 'button' : undefined}
              tabIndex={f.link ? 0 : undefined}
              aria-label={f.link ? `Open ${f.title}` : undefined}
              style={{ background: f.bg, cursor: f.link ? 'pointer' : 'default' }}
            >
              <div className="lp-fcard-icon">{f.icon}</div>
              <span className="lp-fcard-title">{f.title}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="lp-how" id="how">
        <motion.div
          className="lp-how-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          transition={{ duration: 0.6 }}
        >
          <div className="lp-section-label">How It Works</div>
          <h2 className="lp-section-title" style={{ textAlign: 'center' }}>
            Up and running<br />in under 10 minutes
          </h2>
        </motion.div>

        <motion.div
          className="lp-steps-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          {steps.map((s, i) => (
            <motion.div
              key={i}
              className="lp-step-card"
              style={{ background: s.bg }}
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              whileHover={{ y: -4, scale: 1.03 }}
            >
              <div className="lp-step-num">{s.num}</div>
              <div className="lp-step-icon">{s.icon}</div>
              <span className="lp-step-title">{s.title}</span>
              <p className="lp-step-desc">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── MOBILE APP ─── */}
      <section className="lp-mobile" id="mobile">
        <div className="lp-mobile-inner">
          <motion.div
            className="lp-mobile-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h2 className="lp-section-title" variants={fadeUp} transition={{ duration: 0.5 }}>
              Your store in<br />your pocket
            </motion.h2>

            {/* space between h2 and p */}

            <motion.p className="lp-mobile-desc" variants={fadeUp} transition={{ duration: 0.5 }}>
              Track sales, manage inventory, and stay in control — wherever you are. No laptop required.
            </motion.p>

            <div style={{ height: '1.5rem' }} /> {/* Add space between p and list */}

            <motion.div className="lp-mobile-features" variants={staggerContainer}>
              {[
                { icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>, title: 'Track sales remotely', desc: 'See real-time sales from any location.' },
                { icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>, title: 'Inventory on the move', desc: 'Check stock, update quantities, get alerts.' },
                { icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>, title: 'Instant notifications', desc: 'Low-stock alerts and daily summaries.' },
              ].map((f, i) => (
                <motion.div key={i} className="lp-mobile-feat" variants={fadeUp} transition={{ duration: 0.4 }}>
                  <div className="lp-mobile-feat-icon">{f.icon}</div>
                  <div>
                    <div className="lp-mobile-feat-title">{f.title}</div>
                    <div className="lp-mobile-feat-desc">{f.desc}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="lp-mobile-store-links">
              <a
                href="https://play.google.com/store/apps/details?id=com.kulobal.micobiz"
                target="_blank"
                rel="noreferrer"
                className="lp-mobile-cta"
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Google Play
              </a>
              <a
                href="https://www.apple.com/app-store/"
                target="_blank"
                rel="noreferrer"
                className="lp-mobile-cta lp-mobile-cta-secondary"
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M16.365 1.43c0 1.14-.467 2.254-1.166 3.051-.75.853-1.972 1.493-3.104 1.402-.145-1.078.41-2.213 1.128-2.99.78-.852 2.124-1.474 3.142-1.463zM20.984 17.233c-.31.71-.68 1.366-1.108 1.967-.584.821-1.06 1.39-1.43 1.707-.573.521-1.188.79-1.845.81-.473 0-1.044-.135-1.708-.406-.665-.27-1.276-.405-1.836-.405-.586 0-1.215.135-1.89.405-.675.27-1.22.416-1.636.437-.63.027-1.258-.253-1.881-.842-.398-.344-.895-.933-1.492-1.768-.64-.894-1.166-1.93-1.58-3.106-.443-1.27-.665-2.5-.665-3.69 0-1.362.294-2.537.881-3.524.46-.796 1.072-1.423 1.836-1.881.764-.458 1.59-.692 2.478-.705.486 0 1.125.151 1.918.452.792.302 1.3.452 1.523.452.167 0 .733-.177 1.697-.53.91-.327 1.677-.463 2.301-.411 1.69.136 2.959.802 3.805 1.998-1.511.916-2.26 2.2-2.247 3.85.011 1.286.48 2.356 1.406 3.208.42.397.888.704 1.406.923-.113.327-.232.64-.357.94z" />
                </svg>
                App Store
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            className="lp-mobile-phones"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <img src={mockup1} alt="StorePro mobile - sales view" className="lp-phone lp-phone-1" loading="lazy" />
            <img src={mockup2} alt="StorePro mobile - inventory view" className="lp-phone lp-phone-2" loading="lazy" />
          </motion.div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="lp-pricing-section">
        <motion.div
          className="lp-pricing-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          transition={{ duration: 0.6 }}
        >
          <div className="lp-section-label">Pricing</div>
          <h2 className="lp-section-title" style={{ textAlign: 'center' }}>
            Simple, transparent pricing
          </h2>
          <p className="lp-section-sub" style={{ textAlign: 'center', margin: '0.8rem auto 0' }}>
            No hidden fees. Cancel anytime.
          </p>
        </motion.div>

        <motion.div
          className="lp-pricing-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          {pricingPlans.map((plan, i) => (
            <motion.div
              key={i}
              className={`lp-price-card${plan.popular ? ' lp-price-popular' : ''}`}
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              whileHover={{ y: -4 }}
            >
              {plan.popular && <div className="lp-price-badge">Most Popular</div>}
              <div className="lp-price-plan-name">{plan.name}</div>
              <div className="lp-price-amount">
                {plan.price}
                {plan.period && <span className="lp-price-period">{plan.period}</span>}
              </div>
              <div className="lp-price-divider" />
              <ul className="lp-price-features">
                {plan.features.map((f, j) => (
                  <li key={j}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={`lp-price-cta${plan.popular ? ' lp-price-cta-pop' : ''}`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="lp-testimonials" id="testimonials">
        <motion.div
          className="lp-testimonials-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          transition={{ duration: 0.6 }}
        >
          <div className="lp-section-label">Reviews</div>
          <h2 className="lp-section-title" style={{ textAlign: 'center' }}>
            Trusted by real<br />business owners
          </h2>
        </motion.div>

        <motion.div
          className="lp-testimonials-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="lp-tcard"
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              whileHover={{ y: -4 }}
            >
              <div className="lp-tcard-metric">
                <span className="lp-tcard-metric-value">{t.metric}</span>
                <span className="lp-tcard-metric-label">{t.metricLabel}</span>
              </div>
              <p className="lp-tcard-text">"{t.text}"</p>
              <div className="lp-tcard-author">
                <img className="lp-tcard-avatar" src={t.photo} alt={t.name} loading="lazy" />
                <div className="lp-tcard-info">
                  <span className="lp-tcard-name">{t.name}</span>
                  <span className="lp-tcard-role">{t.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <motion.section
        className="lp-cta-banner"
        id="cta"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <motion.h2 variants={fadeUp} transition={{ duration: 0.6 }}>Your store deserves<br />better tools.</motion.h2>
        <motion.p variants={fadeUp} transition={{ duration: 0.5 }}>Join 2,400+ small business owners who run leaner, smarter operations with StorePro. Start free — no credit card needed.</motion.p>
        <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
          <Link to="/register" className="lp-btn-primary lp-cta-btn">Start Your Free Trial →</Link>
        </motion.div>
        <motion.p className="lp-cta-note" variants={fadeUp} transition={{ duration: 0.4 }}>14-day free trial · No credit card · Cancel anytime</motion.p>
      </motion.section>

      {/* ─── FOOTER ─── */}
      <MarketingFooter />

      {/* ─── COOKIE BANNER ─── */}
      <AnimatePresence>
        {showCookies && (
          <motion.div
            className="lp-cookie-banner"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <div className="lp-cookie-inner">
              <div className="lp-cookie-text">
                <svg className="lp-cookie-icon" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="8" cy="9" r="1" fill="currentColor" />
                  <circle cx="15" cy="11" r="1" fill="currentColor" />
                  <circle cx="10" cy="15" r="1" fill="currentColor" />
                </svg>
                <p>We use cookies to improve your experience. By continuing, you agree to our <a href="/terms" className="lp-cookie-link">Terms</a> and <a href="/privacy" className="lp-cookie-link">Privacy Policy</a>.</p>
              </div>
              <div className="lp-cookie-actions">
                <button className="lp-cookie-decline" onClick={declineCookies}>Decline</button>
                <button className="lp-cookie-accept" onClick={acceptCookies}>Accept All</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────── SCOPED CSS (all prefixed lp-) ─────────────────── */
const landingStyles = `
.lp-root {
  --ink: #0B2247;
  --paper: #ffffff;
  --cream: #f4f6f9;
  --amber: #FF751F;
  --amber-light: #FF914D;
  --amber-dark: #E0600A;
  --sage: #0B2247;
  --rust: #d63031;
  --muted: #5a6a7e;
  --border: #e2e8f0;
  --card: #ffffff;

  font-family: 'Manrope', sans-serif;
  background: var(--paper);
  color: var(--ink);
  overflow-x: hidden;
  line-height: 1.5;
}

.lp-root *, .lp-root *::before, .lp-root *::after { box-sizing: border-box; }
.lp-root h1, .lp-root h2, .lp-root h3, .lp-root h4 { font-family: 'Manrope', sans-serif; margin: 0; }
.lp-root p { margin: 0; }
.lp-root ul { list-style: none; padding: 0; margin: 0; }

/* ─── NAV ─── */
.lp-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 1.1rem 5%;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}

.lp-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  overflow: hidden;
}

.lp-logo-img {
  height: 36px;
  object-fit: contain;
  will-change: transform, opacity;
}

.lp-nav-links {
  display: flex; gap: 2.2rem; align-items: center;
  justify-self: center;
}

.lp-nav-item {
  position: relative;
}

.lp-nav-links a {
  text-decoration: none; color: var(--muted);
  font-size: 0.92rem; font-weight: 500;
  transition: color 0.2s;
}
.lp-nav-links a:hover { color: var(--ink); }

.lp-nav-menu-trigger {
  appearance: none;
  border: 0;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0;
  cursor: pointer;
  color: var(--muted);
  font-size: 0.92rem;
  font-weight: 500;
  font-family: inherit;
  transition: color 0.2s ease;
}

.lp-nav-menu-trigger:hover,
.lp-nav-menu-trigger:focus-visible {
  color: var(--ink);
  outline: none;
}

.lp-nav-item--mega {
  padding: 1rem 0;
  margin: -1rem 0;
}

.lp-mega-menu {
  position: absolute;
  top: calc(100% + 18px);
  left: 0;
  transform: none;
  width: min(760px, 78vw);
  padding: 1.25rem;
  border: 1px solid rgba(11, 34, 71, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.14);
  backdrop-filter: blur(14px);
}

.lp-mega-menu::before {
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

.lp-mega-menu-intro {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(11, 34, 71, 0.08);
}

.lp-mega-menu-label {
  display: inline-block;
  margin-bottom: 0.45rem;
  color: var(--amber);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.lp-mega-menu-intro h3 {
  font-size: 1.25rem;
  line-height: 1.2;
  letter-spacing: -0.03em;
}

.lp-mega-menu-intro p {
  margin-top: 0.45rem;
  color: var(--muted);
  font-size: 0.92rem;
}

.lp-mega-menu-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.lp-mega-menu-card {
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

.lp-mega-menu-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 117, 31, 0.22);
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.08);
}

.lp-mega-menu-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 117, 31, 0.08);
  color: var(--ink);
  flex: 0 0 auto;
}

.lp-mega-menu-copy {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.lp-mega-menu-copy strong {
  color: var(--ink);
  font-size: 0.95rem;
}

.lp-mega-menu-copy span {
  color: var(--muted);
  font-size: 0.82rem;
  line-height: 1.5;
}

.lp-nav-signin {
  color: var(--ink) !important; font-weight: 600 !important;
}

.lp-nav-cta {
  background: var(--ink); color: var(--paper) !important;
  padding: 0.55rem 1.3rem; border-radius: 4px;
  font-size: 0.88rem !important; font-weight: 600 !important;
  transition: background 0.2s, transform 0.15s !important;
}
.lp-nav-cta:hover { background: var(--amber-dark) !important; transform: translateY(-1px); }

/* ─── HERO ─── */
.lp-hero {
  min-height: 100vh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: flex-start;
  padding: 10rem 5% 4rem;
  position: relative; overflow: hidden;
  background: var(--paper);
}

/* Ambient glow blobs */
.lp-hero-glow {
  position: absolute; border-radius: 50%;
  filter: blur(100px); z-index: 0; pointer-events: none;
}
.lp-hero-glow-1 {
  width: 600px; height: 600px;
  top: -120px; left: -100px;
  background: radial-gradient(circle, rgba(255,117,31,0.15) 0%, transparent 70%);
  animation: lpGlowFloat 8s ease-in-out infinite;
}
.lp-hero-glow-2 {
  width: 500px; height: 500px;
  bottom: -80px; right: -60px;
  background: radial-gradient(circle, rgba(11,34,71,0.1) 0%, transparent 70%);
  animation: lpGlowFloat 10s ease-in-out infinite reverse;
}

@keyframes lpGlowFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -20px) scale(1.08); }
}

.lp-hero-noise {
  position: absolute; inset: 0; z-index: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  pointer-events: none;
}

.lp-hero-grid-bg {
  position: absolute; inset: 0; z-index: 0;
  background-image:
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 56px 56px;
  opacity: 0.35;
  mask-image: radial-gradient(ellipse at 50% 40%, black 30%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at 50% 40%, black 30%, transparent 75%);
}

/* Centered hero content */
.lp-hero-center {
  position: relative; z-index: 1;
  text-align: center;
  max-width: 780px;
  display: flex; flex-direction: column; align-items: center;
}

.lp-hero-badge {
  display: inline-flex; align-items: center; gap: 0.6rem;
  background: rgba(255,117,31,0.08);
  border: 1px solid rgba(255,117,31,0.2);
  border-radius: 100px; padding: 0.4rem 1.1rem 0.4rem 0.7rem;
  font-size: 0.82rem; font-weight: 600;
  color: var(--amber-dark); margin-bottom: 2rem;
  backdrop-filter: blur(4px);
}

.lp-badge-pulse {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--amber-dark); position: relative;
}
.lp-badge-pulse::after {
  content: ''; position: absolute; inset: -3px;
  border-radius: 50%; background: rgba(255,117,31,0.3);
  animation: lpPulse 2s ease-in-out infinite;
}
@keyframes lpPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.8); opacity: 0; }
}

.lp-hero h1 {
  font-size: clamp(3.2rem, 6.5vw, 5.5rem);
  font-weight: 800; line-height: 1.06;
  letter-spacing: -0.045em;
}

.lp-hero-line { display: block; }

.lp-hero h1 em {
  font-style: normal;
  background: linear-gradient(135deg, var(--amber-dark) 0%, var(--amber) 50%, var(--amber-dark) 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: lpShimmer 4s ease-in-out infinite;
}

@keyframes lpShimmer {
  0%, 100% { background-position: 0% center; }
  50% { background-position: 200% center; }
}

.lp-hero-sub {
  margin-top: 1.5rem; font-size: 1.18rem;
  color: var(--muted); max-width: 540px;
  line-height: 1.7; font-weight: 400;
}

.lp-hero-actions {
  display: flex; gap: 1.2rem; align-items: center;
  margin-top: 2.8rem;
}

.lp-btn-primary {
  background: var(--ink); color: var(--paper);
  padding: 0.9rem 2.2rem; border-radius: 4px;
  font-family: 'Manrope', sans-serif;
  font-weight: 700; font-size: 0.95rem;
  text-decoration: none; border: none; cursor: pointer;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 4px 24px rgba(15,14,12,0.18);
  display: inline-flex; align-items: center; gap: 0.5rem;
  position: relative; overflow: hidden;
}
.lp-btn-primary:hover {
  background: var(--amber-dark); transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(255,117,31,0.35); color: var(--paper);
}

.lp-btn-shine {
  position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
  animation: lpShineSlide 3s ease-in-out infinite;
}
@keyframes lpShineSlide {
  0%, 100% { left: -100%; }
  50% { left: 100%; }
}

.lp-btn-secondary {
  color: var(--ink); font-size: 0.92rem; font-weight: 600;
  text-decoration: none; display: flex; align-items: center; gap: 0.6rem;
  transition: gap 0.2s, color 0.2s;
  padding: 0.9rem 1.4rem; border-radius: 4px;
  border: 1.5px solid var(--border);
  background: var(--card);
}
.lp-btn-secondary:hover { gap: 0.8rem; border-color: var(--muted); }
.lp-play-icon {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--amber); color: var(--ink);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 0.6rem;
}

/* Social proof */
.lp-hero-social-proof {
  display: flex; align-items: center; gap: 1rem;
  margin-top: 3rem;
}
.lp-avatar-stack { display: flex; }
.lp-stack-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--amber); color: var(--ink);
  font-family: 'Manrope', sans-serif; font-size: 0.65rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  border: 2.5px solid var(--paper);
  margin-left: -8px;
}
.lp-stack-avatar:first-child { margin-left: 0; }
.lp-stack-avatar:nth-child(2) { background: #e8f0fe; color: #0B2247; }
.lp-stack-avatar:nth-child(3) { background: #ffe8da; color: #E0600A; }
.lp-stack-avatar:nth-child(4) { background: #e0e7ff; color: #0B2247; }
.lp-stack-avatar:nth-child(5) { background: #fff0e6; color: #FF751F; }

.lp-proof-text { font-size: 0.85rem; color: var(--muted); display: flex; flex-direction: column; gap: 0.1rem; }
.lp-proof-text strong { color: var(--ink); }
.lp-proof-stars { color: var(--amber); font-size: 0.78rem; letter-spacing: 1px; }

/* ─── HERO VIDEO ─── */
.lp-hero-video {
  position: relative; z-index: 1;
  width: 100%; max-width: 960px;
  margin-top: 4rem;
}

.lp-video-frame {
  border-radius: 4px;
  overflow: hidden;
  background: var(--ink);
  box-shadow:
    0 0 0 1px rgba(0,0,0,0.06),
    0 4px 16px rgba(0,0,0,0.08),
    0 16px 48px rgba(0,0,0,0.12),
    0 32px 80px rgba(0,0,0,0.10);
}

.lp-video-bar {
  display: flex; align-items: center; gap: 6px;
  padding: 0.65rem 1rem;
  background: var(--ink);
}

.lp-vdot {
  width: 10px; height: 10px; border-radius: 50%;
  opacity: 0.85;
}

.lp-video-el {
  display: block;
  width: 100%; height: auto;
  border: none; outline: none;
}

/* ─── STAT ITEMS (legacy compat) ─── */
.lp-hero-stats {
  display: flex; gap: 3rem; margin-top: 4rem;
}
.lp-stat-item { display: flex; flex-direction: column; gap: 0.2rem; }
.lp-stat-num { font-family: 'Manrope', sans-serif; font-size: 1.8rem; font-weight: 800; color: var(--ink); }
.lp-stat-label { font-size: 0.8rem; color: var(--muted); font-weight: 500; }

/* ─── SECTIONS ─── */
.lp-features, .lp-how, .lp-pricing-section { padding: 6rem 5%; }
.lp-features { background: var(--cream); }
.lp-how { background: var(--cream); }
.lp-pricing-section { background: var(--paper); }

.lp-section-label {
  font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--amber-dark);
  margin-bottom: 0.8rem;
}

.lp-section-title {
  font-size: clamp(2rem, 3.5vw, 3rem);
  font-weight: 800; letter-spacing: -0.03em; line-height: 1.1;
}

.lp-section-sub {
  color: var(--muted); font-size: 1.05rem;
  line-height: 1.65; margin-top: 0.8rem; max-width: 520px;
}

/* ─── FEATURES GRID ─── */
.lp-features-header {
  margin-bottom: 3rem;
  display: flex; flex-direction: column; align-items: center;
  text-align: center;
}

.lp-features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  max-width: 680px;
  margin: 0 auto;
}

.lp-fcard {
  border-radius: 4px;
  padding: 2rem 1.5rem;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 1rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.lp-fcard:hover {
  box-shadow: 0 12px 32px rgba(0,0,0,0.15);
}

.lp-fcard-icon {
  width: 56px; height: 56px;
  border-radius: 4px;
  background: rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  color: #fff;
}

.lp-fcard-title {
  font-size: 0.85rem; font-weight: 700;
  color: #fff; letter-spacing: -0.01em;
  line-height: 1.3;
}

@media (max-width: 640px) {
  .lp-features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ─── HOW IT WORKS ─── */
.lp-how-header {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; margin-bottom: 2.5rem;
}

.lp-steps-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  max-width: 820px;
  margin: 0 auto;
}

.lp-step-card {
  border-radius: 4px;
  padding: 1.75rem 1.25rem;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 0.6rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.lp-step-card:hover {
  box-shadow: 0 12px 32px rgba(0,0,0,0.15);
}

.lp-step-num {
  font-family: 'Manrope', sans-serif;
  font-size: 0.65rem; font-weight: 800;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.08em;
}

.lp-step-icon {
  width: 52px; height: 52px;
  border-radius: 4px;
  background: rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  color: #fff;
}

.lp-step-title {
  font-size: 0.88rem; font-weight: 700;
  color: #fff; letter-spacing: -0.01em;
  line-height: 1.3;
}

.lp-step-desc {
  font-size: 0.75rem; color: rgba(255,255,255,0.55);
  line-height: 1.5; margin: 0;
}

@media (max-width: 640px) {
  .lp-steps-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ─── MOBILE APP ─── */
.lp-mobile {
  padding: 6rem 5%;
  background: var(--paper);
}

.lp-mobile-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.lp-mobile-content {
  display: flex; flex-direction: column;
}

.lp-mobile-desc {
  font-size: 1rem; color: var(--muted);
  line-height: 1.65; margin-top: 0.8rem; margin-bottom: 5rem;
  max-width: 420px;
}

.lp-mobile-features {
  display: flex; flex-direction: column; gap: 1.25rem;
}

.lp-mobile-feat {
  display: flex; align-items: flex-start; gap: 0.85rem;
}

.lp-mobile-feat-icon {
  width: 40px; height: 40px; border-radius: 4px;
  background: #0B2247; color: #fff;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.lp-mobile-feat-title {
  font-size: 0.9rem; font-weight: 700; color: var(--ink);
  margin-bottom: 0.15rem;
}

.lp-mobile-feat-desc {
  font-size: 0.8rem; color: var(--muted); line-height: 1.5;
}

.lp-mobile-cta {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.75rem 1.75rem;
  background: var(--amber); color: #fff;
  font-size: 0.9rem; font-weight: 700;
  border-radius: 4px; text-decoration: none;
  transition: background 0.2s;
}

.lp-mobile-cta:hover {
  background: #e5680f;
}

.lp-mobile-store-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 2.5rem;
}

.lp-mobile-cta-secondary {
  background: #0B2247;
}

.lp-mobile-cta-secondary:hover {
  background: #091a36;
}

.lp-mobile-phones {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  min-height: 420px;
}

.lp-phone {
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(11,34,71,0.15);
  object-fit: cover;
  width: 220px;
}

.lp-phone-1 {
  position: relative; z-index: 2;
  transform: rotate(-3deg);
}

.lp-phone-2 {
  position: absolute;
  right: 0; bottom: 0;
  z-index: 1;
  transform: rotate(3deg) translateX(20px);
  opacity: 0.92;
}

@media (max-width: 768px) {
  .lp-mobile-inner {
    grid-template-columns: 1fr;
    gap: 2.5rem;
    text-align: center;
  }
  .lp-mobile-content { align-items: center; }
  .lp-mobile-desc { margin-left: auto; margin-right: auto; }
  .lp-mobile-feat { text-align: left; }
  .lp-mobile-phones { min-height: 340px; }
  .lp-phone { width: 180px; }
}

/* ─── PRICING ─── */
.lp-pricing-header {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; margin-bottom: 2.5rem;
}

.lp-pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  max-width: 900px;
  margin: 0 auto;
}

.lp-price-card {
  border: 1px solid var(--border); border-radius: 4px;
  padding: 2rem 1.75rem; background: #fff;
  position: relative; display: flex; flex-direction: column;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.lp-price-card:hover { box-shadow: 0 12px 32px rgba(0,0,0,0.08); }

.lp-price-card.lp-price-popular {
  background: #0B2247; border-color: #0B2247;
}

.lp-price-badge {
  position: absolute; top: 1rem; right: 1rem;
  background: #FF751F; color: #fff;
  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.04em;
  padding: 3px 10px; border-radius: 100px;
  text-transform: uppercase;
}

.lp-price-plan-name {
  font-size: 0.8rem; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--muted); margin-bottom: 0.75rem;
}
.lp-price-popular .lp-price-plan-name { color: rgba(255,255,255,0.5); }

.lp-price-amount {
  font-size: 2.2rem; font-weight: 800; line-height: 1;
  letter-spacing: -0.03em; color: var(--ink);
}
.lp-price-popular .lp-price-amount { color: #fff; }

.lp-price-period {
  font-size: 0.85rem; font-weight: 500; color: var(--muted);
  margin-left: 2px;
}
.lp-price-popular .lp-price-period { color: rgba(255,255,255,0.45); }

.lp-price-divider {
  height: 1px; background: var(--border);
  margin: 1.25rem 0;
}
.lp-price-popular .lp-price-divider { background: rgba(255,255,255,0.1); }

.lp-price-features {
  display: flex; flex-direction: column; gap: 0.6rem;
  flex: 1;
}
.lp-price-features li {
  font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem;
  color: var(--muted);
}
.lp-price-features li svg {
  flex-shrink: 0; color: #10B981;
}
.lp-price-popular .lp-price-features li { color: rgba(255,255,255,0.7); }
.lp-price-popular .lp-price-features li svg { color: #FF751F; }

.lp-price-cta {
  display: block; text-align: center; margin-top: 1.5rem;
  padding: 0.7rem; border-radius: 4px;
  font-weight: 700; font-size: 0.85rem;
  text-decoration: none; transition: all 0.2s;
  border: 1.5px solid var(--border); color: var(--ink);
  background: transparent;
}
.lp-price-cta:hover {
  background: var(--ink); color: #fff; border-color: var(--ink);
}

.lp-price-cta.lp-price-cta-pop {
  background: #FF751F; color: #fff; border-color: #FF751F;
}
.lp-price-cta.lp-price-cta-pop:hover {
  background: #FF914D; border-color: #FF914D;
}

@media (max-width: 768px) {
  .lp-pricing-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
  }
}

/* ─── TESTIMONIALS ─── */
.lp-testimonials {
  padding: 6rem 5%; background: var(--cream);
}

.lp-testimonials-header {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; margin-bottom: 2.5rem;
}

.lp-testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  max-width: 900px;
  margin: 0 auto;
}

.lp-tcard {
  background: #fff; border: 1px solid var(--border);
  border-radius: 4px; padding: 1.75rem;
  display: flex; flex-direction: column; gap: 1rem;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.lp-tcard:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.07); }

.lp-tcard-metric {
  display: flex; align-items: baseline; gap: 0.4rem;
}

.lp-tcard-metric-value {
  font-size: 2rem; font-weight: 800;
  color: #FF751F; line-height: 1; letter-spacing: -0.03em;
}

.lp-tcard-metric-label {
  font-size: 0.78rem; font-weight: 600;
  color: var(--muted); text-transform: uppercase;
  letter-spacing: 0.04em;
}

.lp-tcard-text {
  font-size: 0.88rem; line-height: 1.6; color: var(--ink);
  flex: 1;
}

.lp-tcard-author {
  display: flex; align-items: center; gap: 0.65rem;
  padding-top: 0.75rem; border-top: 1px solid var(--border);
}

.lp-tcard-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  object-fit: cover; flex-shrink: 0;
}

.lp-tcard-info { display: flex; flex-direction: column; }
.lp-tcard-name { font-size: 0.8rem; font-weight: 700; color: var(--ink); }
.lp-tcard-role { font-size: 0.72rem; color: var(--muted); }

@media (max-width: 768px) {
  .lp-testimonials-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
  }
}

/* ─── CTA BANNER ─── */
.lp-cta-banner {
  background: var(--ink); color: var(--paper);
  text-align: center; padding: 6rem 5%;
  position: relative; overflow: hidden;
}

.lp-cta-banner::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 100%, rgba(255,117,31,0.15) 0%, transparent 60%);
}

.lp-cta-banner h2 {
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 800; letter-spacing: -0.04em;
  position: relative; margin-bottom: 1rem;
}

.lp-cta-banner > p {
  color: rgba(255,255,255,0.6); font-size: 1.05rem;
  max-width: 480px; margin: 0 auto 2.5rem; line-height: 1.6;
  position: relative;
}

.lp-cta-btn {
  background: var(--amber) !important; color: #ffffff !important;
  box-shadow: 0 8px 32px rgba(255,117,31,0.35);
  position: relative;
}
.lp-cta-btn:hover { background: var(--amber-light) !important; }

.lp-cta-note { font-size: 0.8rem; color: rgba(255,255,255,0.35); margin-top: 1rem; position: relative; }

/* ─── TRUSTED ─── */
.lp-trusted {
  text-align: center; padding: 3rem 5%;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.lp-trusted p {
  font-size: 0.78rem; font-weight: 600; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--muted); margin-bottom: 1.5rem;
}

.lp-brand-marquee {
  overflow: hidden;
  width: min(100%, 920px);
  margin: 0 auto;
}

.lp-brand-row {
  display: flex;
  align-items: center;
  gap: 2.25rem;
  width: max-content;
  animation: lpBrandSlide 22s linear infinite;
}

.lp-client-logo {
  height: 52px; max-width: 150px;
  width: auto;
  flex: 0 0 auto;
  object-fit: contain;
  filter: grayscale(100%) opacity(0.45);
  transition: filter 0.3s ease;
}

.lp-client-logo:hover {
  filter: grayscale(0%) opacity(1);
}

@keyframes lpBrandSlide {
  from { transform: translateX(0); }
  to { transform: translateX(calc(-50% - 1.125rem)); }
}

/* ─── FOOTER ─── */
.lp-footer {
  background: var(--cream); border-top: 1px solid var(--border);
  padding: 3rem 5%; display: flex;
  justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 1rem;
}

.lp-footer-logo { display: flex; align-items: center; }

.lp-footer-links { display: flex; gap: 2rem; }
.lp-footer-links a { text-decoration: none; color: var(--muted); font-size: 0.85rem; transition: color 0.2s; }
.lp-footer-links a:hover { color: var(--ink); }

.lp-footer-copy { font-size: 0.8rem; color: var(--muted); }

/* ─── DASHBOARD MOCKUP (legacy / reused pill styles) ─── */
.lp-pill { font-size: 0.58rem; font-weight: 700; padding: 0.15rem 0.4rem; border-radius: 100px; }
.lp-pill-in { background: rgba(11,34,71,0.1); color: var(--sage); }
.lp-pill-low { background: rgba(214,48,49,0.1); color: var(--rust); }

/* ─── RESPONSIVE ─── */
@media (max-width: 900px) {
  .lp-hero { padding: 8rem 5% 3rem; }
  .lp-hero h1 { font-size: clamp(2.5rem, 9vw, 4rem); }
  .lp-hero-video { margin-top: 2.5rem; max-width: 100%; }
  .lp-video-frame { border-radius: 4px; }
  .lp-hero-social-proof { flex-direction: column; gap: 0.6rem; }
  .lp-hero-actions { flex-direction: column; width: 100%; }
  .lp-btn-primary { width: 100%; text-align: center; justify-content: center; }
  .lp-btn-secondary { width: 100%; justify-content: center; }
  .lp-price-card.lp-popular { transform: none; }
  .lp-price-card.lp-popular:hover { transform: translateY(-4px); }
  .lp-footer { flex-direction: column; text-align: center; }
  .lp-nav-links { display: none; }
}

/* ─── COOKIE BANNER ─── */
.lp-cookie-banner {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  width: 320px;
}

.lp-cookie-inner {
  background: var(--ink);
  color: var(--paper);
  border-radius: 4px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow: 0 12px 40px rgba(11,34,71,0.25);
}

.lp-cookie-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
}

.lp-cookie-icon {
  flex-shrink: 0;
  color: var(--amber);
}

.lp-cookie-text p {
  font-size: 0.82rem;
  line-height: 1.55;
  color: rgba(255,255,255,0.85);
}

.lp-cookie-link {
  color: var(--amber);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.lp-cookie-link:hover {
  color: var(--amber-light);
}

.lp-cookie-actions {
  display: flex;
  gap: 0.6rem;
  width: 100%;
}

.lp-cookie-decline {
  flex: 1;
  padding: 0.55rem 0;
  border-radius: 4px;
  border: 1px solid rgba(255,255,255,0.25);
  background: transparent;
  color: rgba(255,255,255,0.8);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Manrope', sans-serif;
  transition: border-color 0.2s, color 0.2s;
  text-align: center;
}

.lp-cookie-decline:hover {
  border-color: rgba(255,255,255,0.5);
  color: #fff;
}

.lp-cookie-accept {
  flex: 1;
  padding: 0.55rem 0;
  border-radius: 4px;
  border: none;
  background: var(--amber);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Manrope', sans-serif;
  transition: background 0.2s;
  text-align: center;
}

.lp-cookie-accept:hover {
  background: #e5680f;
}

@media (max-width: 400px) {
  .lp-cookie-banner {
    width: calc(100% - 2rem);
    right: 1rem;
    bottom: 1rem;
  }
}
`

export default LandingPage
