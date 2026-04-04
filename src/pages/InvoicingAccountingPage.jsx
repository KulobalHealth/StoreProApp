import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import MarketingFooter from '../components/MarketingFooter'
import logo from '../MainLogo.jpeg'
import accountingImage from '../mobile-mockups/unit.png'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const accountingMetrics = [
  { value: 'Faster billing', label: 'Invoices in seconds' },
  { value: 'Accurate', label: 'Receivables and payables tracked' },
  { value: 'Flexible', label: 'Sales cycles and currencies supported' },
]

const accountingSections = [
  {
    title: 'Create professional-looking invoices in seconds',
    description:
      'Create, print, and email polished invoices in seconds with layouts you can customize to match your business, logo, and billing preferences.',
  },
  {
    title: 'Flexible purchase and sales management',
    description:
      'Microbiz adapts to simple or complex purchase and sales cycles, including party-specific workflows, orders, payments, receipts, and notes.',
  },
  {
    title: 'Multiple billing formats',
    description:
      'Support different billing formats for products or services so your team can bill accurately with the right structure for every transaction.',
  },
  {
    title: 'Multi-currency support',
    description:
      'Record invoices, quotations, orders, and bills in foreign currencies while Microbiz automatically accounts for forex gains and losses.',
  },
  {
    title: 'Multiple price levels',
    description:
      'Create price levels for wholesalers, retailers, or customer groups with quantity-based rates and discounts to speed up accurate billing.',
  },
  {
    title: 'Share invoices and orders via WhatsApp',
    description:
      'Send invoices, orders, reminders, and reports directly through WhatsApp using formats like PDF, JPEG, or Excel with reusable templates.',
  },
  {
    title: 'Multiple addresses for company and ledgers',
    description:
      'Store and apply multiple addresses for your company and parties so documents and reports always reflect the right location details.',
  },
]

const additionalFeatures = [
  'Multi-task without losing your progress while handling invoices and financial workflows.',
  'Bills receivable and payable are automatically managed as soon as invoices are saved.',
  'Pre-set duties, ledgers, and billing templates to reduce repetitive invoice entry.',
  'Record and track post-dated transactions with a dedicated register for visibility.',
  'Handle buy-one-get-one, free samples, actual and billed quantities, and zero-valued transactions with ease.',
]

const workflowSteps = [
  {
    title: 'Create the right bill quickly',
    description:
      'Use the correct format, pricing level, and customer details without slowing down day-to-day invoicing.',
  },
  {
    title: 'Capture the full financial picture',
    description:
      'Track receipts, payables, receivables, currencies, and notes so every transaction stays complete and reliable.',
  },
  {
    title: 'Share and follow up effortlessly',
    description:
      'Send invoices and related documents instantly while keeping teams and customers aligned with the same source of truth.',
  },
]

const InvoicingAccountingPage = () => {
  return (
    <div className="iap-page">
      <motion.nav
        className="iap-nav"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Link to="/" className="iap-logo">
          <img src={logo} alt="MicroBiz" className="iap-logo-img" />
        </Link>
        <ul className="iap-nav-links">
          <li><a href="/#features">Features</a></li>
          <li><a href="/#how">How It Works</a></li>
          <li><a href="/#pricing">Pricing</a></li>
          <li><a href="/#testimonials">Reviews</a></li>
          <li><Link to="/login" className="iap-nav-signin">Sign In</Link></li>
          <li><Link to="/register" className="iap-nav-cta">Get Started →</Link></li>
        </ul>
      </motion.nav>

      <section className="iap-hero">
        <div className="iap-shell">
          <div className="iap-hero-grid">
            <motion.div
              className="iap-hero-copy"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.55, delay: 0.05 }}
            >
              <div className="iap-kicker">Finance Suite</div>
              <h1>Invoicing and accounting that stay fast and accurate.</h1>
              <p>
                Create polished invoices, adapt to complex billing flows, manage receivables and
                payables, and keep financial records dependable as your business grows.
              </p>

              <div className="iap-actions iap-actions--hero">
                <Link to="/register" className="iap-cta">Get Started</Link>
                <Link to="/" className="iap-cta iap-cta--ghost">Back to Homepage</Link>
              </div>
            </motion.div>

            <motion.div
              className="iap-hero-visual"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.12 }}
            >
              <div className="iap-orb iap-orb--orange" />
              <div className="iap-orb iap-orb--navy" />

              <div className="iap-side-card iap-side-card--left">
                <div className="iap-side-card-label">Flexible billing</div>
                <strong>Support products, services, currencies, and pricing structures</strong>
              </div>

              <div className="iap-side-card iap-side-card--right">
                <div className="iap-side-card-label">Faster follow-up</div>
                <strong>Share invoices and reminders instantly across the channels you use</strong>
              </div>

              <div className="iap-hero-frame">
                <img src={accountingImage} alt="Invoicing and accounting dashboard preview" loading="lazy" />
              </div>
            </motion.div>
          </div>

          <motion.div
            className="iap-metrics"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
            transition={{ duration: 0.45 }}
          >
            {accountingMetrics.map((item) => (
              <div key={item.value} className="iap-metric-card">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="iap-overview">
        <div className="iap-shell iap-overview-grid">
          <motion.article
            className="iap-overview-card iap-overview-card--feature"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.45 }}
          >
            <span className="iap-section-label">Why teams choose it</span>
            <h2>From invoice creation to cleaner financial control.</h2>
            <p>
              Microbiz helps businesses bill faster, manage more billing complexity, and keep
              accounting records accurate without slowing down sales operations.
            </p>
          </motion.article>

          <motion.article
            className="iap-overview-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.45, delay: 0.06 }}
          >
            <span className="iap-overview-eyebrow">Built for billing flexibility</span>
            <p>
              Handle multiple formats, currencies, addresses, and customer pricing structures with a
              workflow that adapts to how your business really sells.
            </p>
          </motion.article>

          <motion.article
            className="iap-overview-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.45, delay: 0.12 }}
          >
            <span className="iap-overview-eyebrow">Designed for accuracy</span>
            <p>
              Keep receivables, payables, duties, and post-dated transactions connected so the books
              stay reliable as transactions move faster.
            </p>
          </motion.article>
        </div>
      </section>

      <section className="iap-capabilities">
        <div className="iap-shell">
          <motion.div
            className="iap-section-head"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.45 }}
          >
            <span className="iap-section-label">Capabilities</span>
            <h2>Everything you need to bill smarter and account with confidence.</h2>
            <p>
              Explore the invoicing and accounting tools that help your team move faster while
              keeping transactions, payments, and financial records in sync.
            </p>
          </motion.div>

          <div className="iap-grid">
            {accountingSections.map((section, index) => (
              <motion.article
                key={section.title}
                className="iap-card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                transition={{ duration: 0.45, delay: index * 0.04 }}
              >
                <div className="iap-card-index">{String(index + 1).padStart(2, '0')}</div>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="iap-extras">
        <div className="iap-shell">
          <motion.div
            className="iap-section-head"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.45 }}
          >
            <span className="iap-section-label">More Features</span>
            <h2>Extra controls that make daily billing and finance work easier.</h2>
          </motion.div>

          <div className="iap-extra-grid">
            {additionalFeatures.map((feature, index) => (
              <motion.article
                key={feature}
                className="iap-extra-item"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                transition={{ duration: 0.45, delay: index * 0.04 }}
              >
                <div className="iap-extra-badge">{String(index + 1).padStart(2, '0')}</div>
                <p>{feature}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="iap-workflow">
        <div className="iap-shell">
          <motion.div
            className="iap-section-head"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.45 }}
          >
            <span className="iap-section-label">Workflow</span>
            <h2>A finance workflow that stays smooth from invoice to follow-up.</h2>
          </motion.div>

          <div className="iap-workflow-grid">
            {workflowSteps.map((step, index) => (
              <motion.article
                key={step.title}
                className="iap-workflow-card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <div className="iap-workflow-number">0{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </motion.article>
            ))}
          </div>

          <motion.div
            className="iap-footer-cta"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.45 }}
          >
            <div>
              <span className="iap-section-label iap-section-label--light">Ready to simplify billing and finance?</span>
              <h3>Use Microbiz to invoice faster and keep every financial workflow cleaner.</h3>
              <p>
                Bring invoicing, pricing, currencies, receivables, and accounting control into one
                experience your team can rely on every day.
              </p>
            </div>
            <div className="iap-actions">
              <Link to="/register" className="iap-cta">Create Account</Link>
              <Link to="/login" className="iap-cta iap-cta--ghost-light">Sign In</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <MarketingFooter />

      <style>{`
        .iap-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(255, 117, 31, 0.1), transparent 26%),
            linear-gradient(180deg, #f6f9fc 0%, #ffffff 38%, #f2f5fa 100%);
          color: #0B2247;
          font-family: Manrope, sans-serif;
        }

        .iap-shell {
          width: min(1160px, calc(100% - 48px));
          margin: 0 auto;
        }

        .iap-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.1rem 5%;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(11, 34, 71, 0.08);
        }

        .iap-logo {
          display: flex;
          align-items: center;
          text-decoration: none;
        }

        .iap-logo-img {
          height: 36px;
          object-fit: contain;
        }

        .iap-nav-links {
          display: flex;
          gap: 2.2rem;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .iap-nav-links a {
          text-decoration: none;
          color: #5a6a7e;
          font-size: 0.92rem;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .iap-nav-links a:hover {
          color: #0B2247;
        }

        .iap-nav-signin {
          color: #0B2247 !important;
          font-weight: 700 !important;
        }

        .iap-nav-cta,
        .iap-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 700;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }

        .iap-nav-cta {
          background: #0B2247;
          color: #ffffff !important;
          padding: 0.55rem 1.3rem;
          font-size: 0.88rem !important;
        }

        .iap-nav-cta:hover {
          background: #FF751F !important;
          transform: translateY(-1px);
        }

        .iap-hero {
          position: relative;
          overflow: hidden;
          padding: 126px 0 36px;
        }

        .iap-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(360px, 0.95fr);
          gap: 42px;
          align-items: center;
          min-height: calc(100vh - 210px);
        }

        .iap-kicker,
        .iap-section-label {
          display: inline-flex;
          align-items: center;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255, 117, 31, 0.12);
          color: #FF751F;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .iap-section-label--light {
          background: rgba(255, 255, 255, 0.12);
          color: #ffd7bd;
        }

        .iap-kicker {
          margin-bottom: 18px;
        }

        .iap-hero-copy {
          max-width: 650px;
        }

        .iap-hero-copy h1 {
          margin: 0 0 18px;
          font-size: clamp(2.5rem, 4.5vw, 4.9rem);
          line-height: 0.95;
          letter-spacing: -0.05em;
        }

        .iap-hero-copy p {
          margin: 0;
          max-width: 620px;
          font-size: 1.08rem;
          line-height: 1.9;
          color: #5a6a7e;
        }

        .iap-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        .iap-actions--hero {
          margin-top: 28px;
        }

        .iap-cta {
          background: #FF751F;
          color: #ffffff;
          padding: 12px 18px;
          box-shadow: 0 14px 28px rgba(255, 117, 31, 0.22);
        }

        .iap-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 18px 34px rgba(255, 117, 31, 0.28);
        }

        .iap-cta--ghost {
          background: rgba(255, 255, 255, 0.8);
          color: #0B2247;
          border: 1px solid rgba(11, 34, 71, 0.12);
          box-shadow: none;
        }

        .iap-cta--ghost:hover {
          color: #FF751F;
          border-color: rgba(255, 117, 31, 0.3);
          box-shadow: none;
        }

        .iap-cta--ghost-light {
          background: transparent;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.24);
          box-shadow: none;
        }

        .iap-cta--ghost-light:hover {
          border-color: rgba(255, 255, 255, 0.46);
          color: #ffffff;
          box-shadow: none;
        }

        .iap-hero-visual {
          position: relative;
          min-height: 590px;
          display: flex;
          justify-content: center;
          align-items: center;
          isolation: isolate;
        }

        .iap-orb {
          position: absolute;
          border-radius: 999px;
          filter: blur(4px);
          z-index: 0;
        }

        .iap-orb--orange {
          width: min(70vw, 410px);
          aspect-ratio: 1;
          top: 10%;
          right: 8%;
          background: radial-gradient(circle, rgba(255, 117, 31, 0.24) 0%, rgba(255, 117, 31, 0.08) 55%, rgba(255, 117, 31, 0) 76%);
        }

        .iap-orb--navy {
          width: min(62vw, 340px);
          aspect-ratio: 1;
          bottom: 10%;
          left: 4%;
          background: radial-gradient(circle, rgba(11, 34, 71, 0.18) 0%, rgba(11, 34, 71, 0.06) 52%, rgba(11, 34, 71, 0) 74%);
        }

        .iap-hero-frame {
          position: relative;
          z-index: 1;
          width: min(100%, 650px);
          border-radius: 12px;
          overflow: hidden;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(240, 245, 251, 0.88));
          border: 1px solid rgba(11, 34, 71, 0.08);
          box-shadow: 0 35px 70px rgba(11, 34, 71, 0.16);
          padding: 14px;
        }

        .iap-hero-frame img {
          display: block;
          width: 100%;
          height: auto;
          border-radius: 4px;
          object-fit: cover;
        }

        .iap-side-card {
          position: absolute;
          z-index: 2;
          width: min(240px, 42%);
          padding: 16px 18px;
          background: rgba(255, 255, 255, 0.86);
          border: 1px solid rgba(11, 34, 71, 0.08);
          box-shadow: 0 24px 48px rgba(15, 23, 42, 0.11);
          backdrop-filter: blur(12px);
          border-radius: 4px;
        }

        .iap-side-card--left {
          left: 0;
          bottom: 82px;
        }

        .iap-side-card--right {
          right: 0;
          top: 72px;
        }

        .iap-side-card-label,
        .iap-overview-eyebrow {
          display: block;
          margin-bottom: 10px;
          color: #FF751F;
          font-size: 0.77rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .iap-side-card strong {
          display: block;
          line-height: 1.5;
          font-size: 1rem;
        }

        .iap-metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-top: 34px;
        }

        .iap-metric-card,
        .iap-overview-card,
        .iap-card,
        .iap-extra-item,
        .iap-workflow-card {
          background: rgba(255, 255, 255, 0.84);
          border: 1px solid rgba(11, 34, 71, 0.08);
          border-radius: 4px;
          box-shadow: 0 22px 48px rgba(15, 23, 42, 0.07);
          backdrop-filter: blur(12px);
        }

        .iap-metric-card {
          padding: 22px 24px;
        }

        .iap-metric-card strong {
          display: block;
          margin-bottom: 6px;
          font-size: 1.15rem;
        }

        .iap-metric-card span {
          color: #5a6a7e;
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .iap-overview,
        .iap-capabilities,
        .iap-extras,
        .iap-workflow {
          padding: 38px 0 88px;
        }

        .iap-overview-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.9fr 0.9fr;
          gap: 22px;
        }

        .iap-overview-card {
          padding: 28px;
        }

        .iap-overview-card--feature {
          background: linear-gradient(135deg, rgba(11, 34, 71, 0.96) 0%, rgba(22, 53, 110, 0.96) 100%);
          color: #ffffff;
          box-shadow: 0 26px 60px rgba(11, 34, 71, 0.18);
        }

        .iap-overview-card--feature p {
          color: rgba(255, 255, 255, 0.82);
        }

        .iap-overview-card h2,
        .iap-section-head h2,
        .iap-footer-cta h3 {
          margin: 14px 0 14px;
          font-size: clamp(1.8rem, 3vw, 2.8rem);
          line-height: 1.08;
          letter-spacing: -0.03em;
        }

        .iap-overview-card p,
        .iap-section-head p,
        .iap-card p,
        .iap-extra-item p,
        .iap-workflow-card p,
        .iap-footer-cta p {
          margin: 0;
          color: #5a6a7e;
          line-height: 1.8;
          font-size: 0.98rem;
        }

        .iap-section-head {
          max-width: 760px;
          margin-bottom: 28px;
        }

        .iap-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        .iap-card,
        .iap-workflow-card {
          padding: 28px;
        }

        .iap-card-index,
        .iap-extra-badge,
        .iap-workflow-number {
          width: 44px;
          height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          background: #0B2247;
          color: #ffffff;
          font-size: 0.82rem;
          font-weight: 800;
          margin-bottom: 18px;
          flex-shrink: 0;
        }

        .iap-card h3,
        .iap-workflow-card h3 {
          margin: 0 0 12px;
          font-size: 1.24rem;
          line-height: 1.35;
        }

        .iap-extra-grid,
        .iap-workflow-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        .iap-extra-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 24px;
        }

        .iap-workflow-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .iap-footer-cta {
          margin-top: 34px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 34px;
          border-radius: 4px;
          background: linear-gradient(135deg, #0B2247 0%, #16356e 100%);
          color: #ffffff;
          box-shadow: 0 30px 60px rgba(11, 34, 71, 0.2);
        }

        .iap-footer-cta p {
          color: rgba(255, 255, 255, 0.82);
          max-width: 620px;
        }

        @media (max-width: 1100px) {
          .iap-hero-grid,
          .iap-overview-grid,
          .iap-workflow-grid {
            grid-template-columns: 1fr;
          }

          .iap-extra-grid {
            grid-template-columns: 1fr;
          }

          .iap-hero-grid {
            min-height: auto;
          }

          .iap-hero-visual {
            min-height: 520px;
          }

          .iap-footer-cta {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 900px) {
          .iap-nav-links {
            display: none;
          }

          .iap-hero {
            padding: 98px 0 32px;
          }

          .iap-grid,
          .iap-metrics {
            grid-template-columns: 1fr;
          }

          .iap-hero-copy h1 {
            font-size: clamp(2.4rem, 11vw, 4rem);
          }

          .iap-side-card {
            width: min(220px, 46%);
          }

          .iap-side-card--right {
            top: 34px;
          }

          .iap-side-card--left {
            bottom: 36px;
          }
        }

        @media (max-width: 640px) {
          .iap-shell {
            width: min(100% - 28px, 1160px);
          }

          .iap-hero {
            padding-top: 86px;
          }

          .iap-hero-visual {
            min-height: 370px;
            display: grid;
            gap: 14px;
          }

          .iap-side-card {
            position: static;
            width: 100%;
          }

          .iap-orb {
            display: none;
          }

          .iap-card,
          .iap-overview-card,
          .iap-extra-item,
          .iap-workflow-card,
          .iap-footer-cta,
          .iap-metric-card {
            padding: 22px;
          }

          .iap-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}

export default InvoicingAccountingPage
