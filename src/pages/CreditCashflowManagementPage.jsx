import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import MarketingFooter from '../components/MarketingFooter'
import logo from '../MainLogo.jpeg'
import featureImage from '../mobile-mockups/06.png'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const metrics = [
  { value: 'Upcoming', label: 'New release currently in development' },
  { value: 'Smarter credit', label: 'Track what is owed and when' },
  { value: 'Clearer cashflow', label: 'Understand money in and money out faster' },
]

const sections = [
  {
    title: 'Customer and supplier credit tracking',
    description:
      'Monitor who owes you, what you owe suppliers, and how those balances affect working capital across the business.',
  },
  {
    title: 'Due dates and payment reminders',
    description:
      'Stay ahead of upcoming obligations with clearer due-date visibility and reminder flows that reduce missed follow-ups.',
  },
  {
    title: 'Cash inflow and outflow visibility',
    description:
      'See where money is coming from and where it is going so owners can make faster, more confident cash decisions.',
  },
  {
    title: 'Outstanding balances in one place',
    description:
      'Bring unpaid invoices, supplier obligations, and partial payments into one shared view for cleaner financial control.',
  },
  {
    title: 'Actionable snapshots for managers',
    description:
      'Surface the most important credit and cashflow signals quickly so teams can prioritize collections and spending decisions.',
  },
  {
    title: 'Connected with sales and accounting workflows',
    description:
      'Link credit activity to invoicing, payments, and operations so financial visibility improves without extra manual tracking.',
  },
]

const workflowSteps = [
  {
    title: 'See exposure clearly',
    description:
      'Quickly understand receivables, payables, and overdue balances without piecing reports together manually.',
  },
  {
    title: 'Prioritize the next move',
    description:
      'Know which collections, supplier payments, or approvals need attention first to protect day-to-day cash position.',
  },
  {
    title: 'Plan with more confidence',
    description:
      'Use a clearer picture of upcoming inflows and obligations to make smarter inventory, payroll, and operating decisions.',
  },
]

const CreditCashflowManagementPage = () => {
  return (
    <div className="ccm-page">
      <motion.nav
        className="ccm-nav"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Link to="/" className="ccm-logo">
          <img src={logo} alt="MicroBiz" className="ccm-logo-img" />
        </Link>
        <ul className="ccm-nav-links">
          <li><a href="/#features">Features</a></li>
          <li><a href="/#how">How It Works</a></li>
          <li><a href="/#pricing">Pricing</a></li>
          <li><a href="/#testimonials">Reviews</a></li>
          <li><Link to="/login" className="ccm-nav-signin">Sign In</Link></li>
          <li><Link to="/register" className="ccm-nav-cta">Get Started →</Link></li>
        </ul>
      </motion.nav>

      <section className="ccm-hero">
        <div className="ccm-shell">
          <div className="ccm-hero-grid">
            <motion.div
              className="ccm-hero-copy"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.55, delay: 0.05 }}
            >
              <div className="ccm-kicker">Upcoming Update</div>
              <h1>Credit and cashflow visibility built for better decisions.</h1>
              <p>
                We’re building a new Microbiz feature to help businesses manage credit,
                follow outstanding balances, and understand cash movement with more clarity.
              </p>

              <div className="ccm-actions ccm-actions--hero">
                <Link to="/register" className="ccm-cta">Get Started</Link>
                <Link to="/" className="ccm-cta ccm-cta--ghost">Back to Homepage</Link>
              </div>
            </motion.div>

            <motion.div
              className="ccm-hero-visual"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.12 }}
            >
              <div className="ccm-orb ccm-orb--orange" />
              <div className="ccm-orb ccm-orb--navy" />

              <div className="ccm-side-card ccm-side-card--left">
                <div className="ccm-side-card-label">What to expect</div>
                <strong>Track receivables, payables, and cash timing from one clearer workflow</strong>
              </div>

              <div className="ccm-side-card ccm-side-card--right">
                <div className="ccm-side-card-label">Release status</div>
                <strong>Planned as an upcoming Microbiz update for stronger financial control</strong>
              </div>

              <div className="ccm-hero-frame">
                <img src={featureImage} alt="Credit and cashflow management preview" loading="lazy" />
              </div>
            </motion.div>
          </div>

          <motion.div
            className="ccm-metrics"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
            transition={{ duration: 0.45 }}
          >
            {metrics.map((item) => (
              <div key={item.value} className="ccm-metric-card">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="ccm-overview">
        <div className="ccm-shell ccm-overview-grid">
          <motion.article
            className="ccm-overview-card ccm-overview-card--feature"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.45 }}
          >
            <span className="ccm-section-label">Why it matters</span>
            <h2>Know what is owed, what is due, and how cash is moving.</h2>
            <p>
              Credit and cashflow management helps growing businesses reduce blind spots,
              follow obligations more closely, and make everyday operating decisions with better timing.
            </p>
          </motion.article>

          <motion.article
            className="ccm-overview-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.45, delay: 0.06 }}
          >
            <span className="ccm-overview-eyebrow">Reduce uncertainty</span>
            <p>
              Replace scattered follow-ups and guesswork with a clearer view of balances,
              due dates, and expected cash movement.
            </p>
          </motion.article>

          <motion.article
            className="ccm-overview-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.45, delay: 0.12 }}
          >
            <span className="ccm-overview-eyebrow">Support healthier operations</span>
            <p>
              Make stronger decisions around purchasing, collections, and spending with a more reliable cash picture.
            </p>
          </motion.article>
        </div>
      </section>

      <section className="ccm-capabilities">
        <div className="ccm-shell">
          <motion.div
            className="ccm-section-head"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.45 }}
          >
            <span className="ccm-section-label">Planned capabilities</span>
            <h2>An upcoming feature set focused on visibility, follow-up, and control.</h2>
            <p>
              Here’s what this update is being designed to help businesses manage once it goes live.
            </p>
          </motion.div>

          <div className="ccm-grid">
            {sections.map((section, index) => (
              <motion.article
                key={section.title}
                className="ccm-card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                transition={{ duration: 0.45, delay: index * 0.04 }}
              >
                <div className="ccm-card-index">{String(index + 1).padStart(2, '0')}</div>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="ccm-workflow">
        <div className="ccm-shell">
          <motion.div
            className="ccm-section-head"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.45 }}
          >
            <span className="ccm-section-label">Planned workflow</span>
            <h2>A clearer path from balances and due dates to better business decisions.</h2>
          </motion.div>

          <div className="ccm-workflow-grid">
            {workflowSteps.map((step, index) => (
              <motion.article
                key={step.title}
                className="ccm-workflow-card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <div className="ccm-workflow-number">0{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </motion.article>
            ))}
          </div>

          <motion.div
            className="ccm-footer-cta"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.45 }}
          >
            <div>
              <span className="ccm-section-label ccm-section-label--light">Upcoming update</span>
              <h3>Microbiz is expanding financial control beyond invoicing and reporting.</h3>
              <p>
                This upcoming release is designed to help businesses stay ahead of collections,
                obligations, and cash planning while keeping decisions grounded in real operating data.
              </p>
            </div>
            <div className="ccm-actions">
              <Link to="/register" className="ccm-cta">Create Account</Link>
              <Link to="/login" className="ccm-cta ccm-cta--ghost-light">Sign In</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <MarketingFooter />

      <style>{`
        .ccm-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(255, 117, 31, 0.1), transparent 26%),
            linear-gradient(180deg, #f6f9fc 0%, #ffffff 38%, #f2f5fa 100%);
          color: #0B2247;
          font-family: Manrope, sans-serif;
        }

        .ccm-shell {
          width: min(1160px, calc(100% - 48px));
          margin: 0 auto;
        }

        .ccm-nav {
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

        .ccm-logo {
          display: flex;
          align-items: center;
          text-decoration: none;
        }

        .ccm-logo-img {
          height: 36px;
          object-fit: contain;
        }

        .ccm-nav-links {
          display: flex;
          gap: 2.2rem;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .ccm-nav-links a {
          text-decoration: none;
          color: #5a6a7e;
          font-size: 0.92rem;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .ccm-nav-links a:hover {
          color: #0B2247;
        }

        .ccm-nav-signin {
          color: #0B2247 !important;
          font-weight: 700 !important;
        }

        .ccm-nav-cta,
        .ccm-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 700;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }

        .ccm-nav-cta {
          background: #0B2247;
          color: #ffffff !important;
          padding: 0.55rem 1.3rem;
          font-size: 0.88rem !important;
        }

        .ccm-nav-cta:hover {
          background: #FF751F !important;
          transform: translateY(-1px);
        }

        .ccm-hero {
          position: relative;
          overflow: hidden;
          padding: 126px 0 36px;
        }

        .ccm-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(360px, 0.95fr);
          gap: 42px;
          align-items: center;
          min-height: calc(100vh - 210px);
        }

        .ccm-kicker,
        .ccm-section-label {
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

        .ccm-section-label--light {
          background: rgba(255, 255, 255, 0.12);
          color: #ffd7bd;
        }

        .ccm-kicker {
          margin-bottom: 18px;
        }

        .ccm-hero-copy {
          max-width: 650px;
        }

        .ccm-hero-copy h1 {
          margin: 0 0 18px;
          font-size: clamp(2.5rem, 4.5vw, 4.8rem);
          line-height: 0.95;
          letter-spacing: -0.05em;
        }

        .ccm-hero-copy p {
          margin: 0;
          max-width: 620px;
          font-size: 1.08rem;
          line-height: 1.9;
          color: #5a6a7e;
        }

        .ccm-side-card-label,
        .ccm-overview-eyebrow {
          display: block;
          margin-bottom: 10px;
          color: #FF751F;
          font-size: 0.77rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .ccm-side-card strong {
          display: block;
          line-height: 1.5;
          font-size: 1rem;
        }

        .ccm-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        .ccm-actions--hero {
          margin-top: 28px;
        }

        .ccm-cta {
          background: #FF751F;
          color: #ffffff;
          padding: 12px 18px;
          box-shadow: 0 14px 28px rgba(255, 117, 31, 0.22);
        }

        .ccm-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 18px 34px rgba(255, 117, 31, 0.28);
        }

        .ccm-cta--ghost {
          background: rgba(255, 255, 255, 0.8);
          color: #0B2247;
          border: 1px solid rgba(11, 34, 71, 0.12);
          box-shadow: none;
        }

        .ccm-cta--ghost:hover {
          color: #FF751F;
          border-color: rgba(255, 117, 31, 0.3);
          box-shadow: none;
        }

        .ccm-cta--ghost-light {
          background: transparent;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.24);
          box-shadow: none;
        }

        .ccm-cta--ghost-light:hover {
          border-color: rgba(255, 255, 255, 0.46);
          color: #ffffff;
          box-shadow: none;
        }

        .ccm-hero-visual {
          position: relative;
          min-height: 590px;
          display: flex;
          justify-content: center;
          align-items: center;
          isolation: isolate;
        }

        .ccm-orb {
          position: absolute;
          border-radius: 999px;
          filter: blur(4px);
          z-index: 0;
        }

        .ccm-orb--orange {
          width: min(70vw, 410px);
          aspect-ratio: 1;
          top: 10%;
          right: 8%;
          background: radial-gradient(circle, rgba(255, 117, 31, 0.24) 0%, rgba(255, 117, 31, 0.08) 55%, rgba(255, 117, 31, 0) 76%);
        }

        .ccm-orb--navy {
          width: min(62vw, 340px);
          aspect-ratio: 1;
          bottom: 10%;
          left: 4%;
          background: radial-gradient(circle, rgba(11, 34, 71, 0.18) 0%, rgba(11, 34, 71, 0.06) 52%, rgba(11, 34, 71, 0) 74%);
        }

        .ccm-hero-frame {
          position: relative;
          z-index: 1;
          width: min(100%, 650px);
          overflow: hidden;
          border-radius: 0;
          background: transparent;
          padding: 0;
        }

        .ccm-hero-frame img {
          display: block;
          width: 100%;
          height: auto;
          object-fit: cover;
          border-radius: 0;
        }

        .ccm-side-card {
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

        .ccm-side-card--left {
          left: 0;
          bottom: 82px;
        }

        .ccm-side-card--right {
          right: 8px;
          top: 72px;
          width: min(210px, 38%);
        }

        .ccm-metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-top: 34px;
        }

        .ccm-metric-card,
        .ccm-overview-card,
        .ccm-card,
        .ccm-workflow-card {
          background: rgba(255, 255, 255, 0.84);
          border: 1px solid rgba(11, 34, 71, 0.08);
          border-radius: 4px;
          box-shadow: 0 22px 48px rgba(15, 23, 42, 0.07);
          backdrop-filter: blur(12px);
        }

        .ccm-metric-card {
          padding: 22px 24px;
        }

        .ccm-metric-card strong {
          display: block;
          margin-bottom: 6px;
          font-size: 1.15rem;
        }

        .ccm-metric-card span {
          color: #5a6a7e;
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .ccm-overview,
        .ccm-capabilities,
        .ccm-workflow {
          padding: 38px 0 88px;
        }

        .ccm-overview-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.9fr 0.9fr;
          gap: 22px;
        }

        .ccm-overview-card {
          padding: 28px;
        }

        .ccm-overview-card--feature {
          background: linear-gradient(135deg, rgba(11, 34, 71, 0.96) 0%, rgba(22, 53, 110, 0.96) 100%);
          color: #ffffff;
          box-shadow: 0 26px 60px rgba(11, 34, 71, 0.18);
        }

        .ccm-overview-card--feature p {
          color: rgba(255, 255, 255, 0.82);
        }

        .ccm-overview-card h2,
        .ccm-section-head h2,
        .ccm-footer-cta h3 {
          margin: 14px 0 14px;
          font-size: clamp(1.8rem, 3vw, 2.8rem);
          line-height: 1.08;
          letter-spacing: -0.03em;
        }

        .ccm-overview-card p,
        .ccm-section-head p,
        .ccm-workflow-card p,
        .ccm-footer-cta p {
          margin: 0;
          color: #5a6a7e;
          line-height: 1.8;
          font-size: 0.98rem;
        }

        .ccm-section-head {
          max-width: 760px;
          margin-bottom: 28px;
        }

        .ccm-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        .ccm-card {
          padding: 28px;
        }

        .ccm-card-index,
        .ccm-workflow-number {
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
        }

        .ccm-card h3,
        .ccm-workflow-card h3 {
          margin: 0 0 12px;
          font-size: 1.24rem;
          line-height: 1.35;
        }

        .ccm-card p {
          margin: 0;
          color: #5a6a7e;
          line-height: 1.85;
          font-size: 0.98rem;
        }

        .ccm-workflow-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
        }

        .ccm-workflow-card {
          padding: 28px;
        }

        .ccm-footer-cta {
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

        .ccm-footer-cta p {
          color: rgba(255, 255, 255, 0.82);
          max-width: 620px;
        }

        @media (max-width: 1100px) {
          .ccm-hero-grid,
          .ccm-overview-grid,
          .ccm-workflow-grid {
            grid-template-columns: 1fr;
          }

          .ccm-hero-grid {
            min-height: auto;
          }

          .ccm-hero-visual {
            min-height: 520px;
          }

          .ccm-footer-cta {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 900px) {
          .ccm-nav-links {
            display: none;
          }

          .ccm-hero {
            padding: 98px 0 32px;
          }

          .ccm-grid,
          .ccm-metrics {
            grid-template-columns: 1fr;
          }

          .ccm-hero-copy h1 {
            font-size: clamp(2.4rem, 11vw, 4rem);
          }

          .ccm-side-card {
            width: min(220px, 46%);
          }

          .ccm-side-card--right {
            top: 34px;
          }

          .ccm-side-card--left {
            bottom: 36px;
          }
        }

        @media (max-width: 640px) {
          .ccm-shell {
            width: min(100% - 28px, 1160px);
          }

          .ccm-hero {
            padding-top: 86px;
          }

          .ccm-hero-visual {
            min-height: 370px;
            display: grid;
            gap: 14px;
          }

          .ccm-side-card {
            position: static;
            width: 100%;
          }

          .ccm-orb {
            display: none;
          }

          .ccm-card,
          .ccm-overview-card,
          .ccm-workflow-card,
          .ccm-footer-cta,
          .ccm-metric-card {
            padding: 22px;
          }

          .ccm-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}

export default CreditCashflowManagementPage
