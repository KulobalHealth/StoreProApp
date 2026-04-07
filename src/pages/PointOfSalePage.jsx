import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import MarketingHeader from '../components/MarketingHeader'
import MarketingFooter from '../components/MarketingFooter'
import posImage from '../mobile-mockups/pos.png'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const posMetrics = [
  { value: 'Fast checkout', label: 'Smooth billing at the counter' },
  { value: 'Flexible', label: 'Cash, transfers, and mixed payments' },
  { value: 'Connected', label: 'Sales linked to stock in real time' },
]

const posSections = [
  {
    title: 'Fast billing experience',
    description:
      'Complete sales quickly with a checkout flow designed for speed, fewer clicks, and smoother customer service during busy trading hours.',
  },
  {
    title: 'Multiple payment options',
    description:
      'Accept cash, transfers, split payments, and other payment combinations while keeping each transaction easy to track and reconcile.',
  },
  {
    title: 'Real-time stock updates',
    description:
      'Every sale immediately reflects in inventory so your team always sees accurate stock movement without waiting for end-of-day updates.',
  },
  {
    title: 'Discounts and price control',
    description:
      'Apply discounts with clarity, manage pricing rules more confidently, and keep sales staff aligned with approved checkout behavior.',
  },
  {
    title: 'Receipts and customer records',
    description:
      'Issue clear receipts, keep transaction history organized, and maintain better visibility into repeat customers and their purchases.',
  },
  {
    title: 'Day-end sales visibility',
    description:
      'Review cashier activity, sales totals, payment breakdowns, and operational performance from one reliable point-of-sale workflow.',
  },
]

const workflowSteps = [
  {
    title: 'Ring up items quickly',
    description:
      'Search products fast, add quantities with ease, and keep service moving even when demand is high.',
  },
  {
    title: 'Complete payment with confidence',
    description:
      'Capture the right payment mix, issue receipts, and keep each transaction accurate at the point of checkout.',
  },
  {
    title: 'Track sales instantly',
    description:
      'See every completed sale reflected across stock and reporting so managers stay informed in real time.',
  },
]

const PointOfSalePage = () => {
  return (
    <div className="psp-page">
      <MarketingHeader />

      <section className="psp-hero">
        <div className="psp-shell">
          <div className="psp-hero-grid">
            <motion.div
              className="psp-hero-copy"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.55, delay: 0.05 }}
            >
              <div className="psp-kicker">Point of Sale</div>
              <h1>Checkout experiences that keep sales moving.</h1>
              <p>
                Give your team a faster point-of-sale workflow with smoother billing,
                flexible payments, instant stock updates, and clean day-end visibility.
              </p>

              <div className="psp-actions psp-actions--hero">
                <Link to="/register" className="psp-cta">Get Started</Link>
                <Link to="/" className="psp-cta psp-cta--ghost">Back to Homepage</Link>
              </div>
            </motion.div>

            <motion.div
              className="psp-hero-visual"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.12 }}
            >
              <div className="psp-orb psp-orb--orange" />
              <div className="psp-orb psp-orb--navy" />

              <div className="psp-side-card psp-side-card--left">
                <div className="psp-side-card-label">Quick checkout</div>
                <strong>Speed up billing without losing control</strong>
              </div>

              <div className="psp-side-card psp-side-card--right">
                <div className="psp-side-card-label">Connected selling</div>
                <strong>Keep billing, payment capture, and stock updates aligned in one flow</strong>
              </div>

              <div className="psp-hero-frame">
                <img src={posImage} alt="Point of sale screen preview" loading="lazy" />
              </div>
            </motion.div>
          </div>

          <motion.div
            className="psp-metrics"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
            transition={{ duration: 0.45 }}
          >
            {posMetrics.map((item) => (
              <div key={item.value} className="psp-metric-card">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="psp-overview">
        <div className="psp-shell psp-overview-grid">
          <motion.article
            className="psp-overview-card psp-overview-card--feature"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.45 }}
          >
            <span className="psp-section-label">Why teams choose it</span>
            <h2>From faster checkouts to clearer sales control.</h2>
            <p>
              Microbiz helps businesses sell faster at the counter while keeping sales,
              payments, and stock movement connected behind the scenes.
            </p>
          </motion.article>

          <motion.article
            className="psp-overview-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.45, delay: 0.06 }}
          >
            <span className="psp-overview-eyebrow">Built for front-line speed</span>
            <p>
              Help cashiers move faster, reduce checkout friction, and maintain a smoother customer
              experience even during peak demand.
            </p>
          </motion.article>

          <motion.article
            className="psp-overview-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.45, delay: 0.12 }}
          >
            <span className="psp-overview-eyebrow">Designed for better control</span>
            <p>
              Keep pricing, receipts, payment capture, and stock changes aligned in one sales flow
              your team can trust every day.
            </p>
          </motion.article>
        </div>
      </section>

      <section className="psp-capabilities">
        <div className="psp-shell">
          <motion.div
            className="psp-section-head"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.45 }}
          >
            <span className="psp-section-label">Capabilities</span>
            <h2>Everything you need to run point-of-sale with confidence.</h2>
            <p>
              Explore the tools that help your team serve customers faster, capture payments
              accurately, and keep sales activity connected to the rest of the business.
            </p>
          </motion.div>

          <div className="psp-grid">
            {posSections.map((section, index) => (
              <motion.article
                key={section.title}
                className="psp-card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                transition={{ duration: 0.45, delay: index * 0.04 }}
              >
                <div className="psp-card-index">{String(index + 1).padStart(2, '0')}</div>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="psp-workflow">
        <div className="psp-shell">
          <motion.div
            className="psp-section-head"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.45 }}
          >
            <span className="psp-section-label">Workflow</span>
            <h2>A sales flow that stays fast from item scan to final receipt.</h2>
          </motion.div>

          <div className="psp-workflow-grid">
            {workflowSteps.map((step, index) => (
              <motion.article
                key={step.title}
                className="psp-workflow-card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <div className="psp-workflow-number">0{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </motion.article>
            ))}
          </div>

          <motion.div
            className="psp-footer-cta"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.45 }}
          >
            <div>
              <span className="psp-section-label psp-section-label--light">Ready to modernize checkout?</span>
              <h3>Use Microbiz to sell faster and stay in control of every transaction.</h3>
              <p>
                Bring billing, payment capture, stock updates, and day-end visibility into one
                point-of-sale workflow your team can run with confidence.
              </p>
            </div>
            <div className="psp-actions">
              <Link to="/register" className="psp-cta">Create Account</Link>
              <Link to="/login" className="psp-cta psp-cta--ghost-light">Sign In</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <MarketingFooter />

      <style>{`
        .psp-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(255, 117, 31, 0.1), transparent 26%),
            linear-gradient(180deg, #f6f9fc 0%, #ffffff 38%, #f2f5fa 100%);
          color: #0B2247;
          font-family: Manrope, sans-serif;
        }

        .psp-shell {
          width: min(1160px, calc(100% - 48px));
          margin: 0 auto;
        }

        .psp-nav {
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

        .psp-logo {
          display: flex;
          align-items: center;
          text-decoration: none;
        }

        .psp-logo-img {
          height: 36px;
          object-fit: contain;
        }

        .psp-nav-links {
          display: flex;
          gap: 2.2rem;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .psp-nav-links a {
          text-decoration: none;
          color: #5a6a7e;
          font-size: 0.92rem;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .psp-nav-links a:hover {
          color: #0B2247;
        }

        .psp-nav-signin {
          color: #0B2247 !important;
          font-weight: 700 !important;
        }

        .psp-nav-cta,
        .psp-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 700;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }

        .psp-nav-cta {
          background: #0B2247;
          color: #ffffff !important;
          padding: 0.55rem 1.3rem;
          font-size: 0.88rem !important;
        }

        .psp-nav-cta:hover {
          background: #FF751F !important;
          transform: translateY(-1px);
        }

        .psp-hero {
          position: relative;
          overflow: hidden;
          padding: 126px 0 36px;
        }

        .psp-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(360px, 0.95fr);
          gap: 42px;
          align-items: center;
          min-height: calc(100vh - 210px);
        }

        .psp-kicker,
        .psp-section-label {
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

        .psp-section-label--light {
          background: rgba(255, 255, 255, 0.12);
          color: #ffd7bd;
        }

        .psp-kicker {
          margin-bottom: 18px;
        }

        .psp-hero-copy {
          max-width: 650px;
        }

        .psp-hero-copy h1 {
          margin: 0 0 18px;
          font-size: clamp(2.5rem, 4.5vw, 4.8rem);
          line-height: 0.95;
          letter-spacing: -0.05em;
        }

        .psp-hero-copy p {
          margin: 0;
          max-width: 620px;
          font-size: 1.08rem;
          line-height: 1.9;
          color: #5a6a7e;
        }

        .psp-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        .psp-actions--hero {
          margin-top: 28px;
        }

        .psp-cta {
          background: #FF751F;
          color: #ffffff;
          padding: 12px 18px;
          box-shadow: 0 14px 28px rgba(255, 117, 31, 0.22);
        }

        .psp-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 18px 34px rgba(255, 117, 31, 0.28);
        }

        .psp-cta--ghost {
          background: rgba(255, 255, 255, 0.8);
          color: #0B2247;
          border: 1px solid rgba(11, 34, 71, 0.12);
          box-shadow: none;
        }

        .psp-cta--ghost:hover {
          color: #FF751F;
          border-color: rgba(255, 117, 31, 0.3);
          box-shadow: none;
        }

        .psp-cta--ghost-light {
          background: transparent;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.24);
          box-shadow: none;
        }

        .psp-cta--ghost-light:hover {
          border-color: rgba(255, 255, 255, 0.46);
          color: #ffffff;
          box-shadow: none;
        }

        .psp-hero-visual {
          position: relative;
          min-height: 590px;
          display: flex;
          justify-content: center;
          align-items: center;
          isolation: isolate;
        }

        .psp-orb {
          position: absolute;
          border-radius: 999px;
          filter: blur(4px);
          z-index: 0;
        }

        .psp-orb--orange {
          width: min(70vw, 410px);
          aspect-ratio: 1;
          top: 10%;
          right: 8%;
          background: radial-gradient(circle, rgba(255, 117, 31, 0.24) 0%, rgba(255, 117, 31, 0.08) 55%, rgba(255, 117, 31, 0) 76%);
        }

        .psp-orb--navy {
          width: min(62vw, 340px);
          aspect-ratio: 1;
          bottom: 10%;
          left: 4%;
          background: radial-gradient(circle, rgba(11, 34, 71, 0.18) 0%, rgba(11, 34, 71, 0.06) 52%, rgba(11, 34, 71, 0) 74%);
        }

        .psp-hero-frame {
          position: relative;
          z-index: 1;
          width: min(100%, 650px);
          overflow: hidden;
          border-radius: 0;
          background: transparent;
          padding: 0;
        }

        .psp-hero-frame img {
          display: block;
          width: 100%;
          height: auto;
          object-fit: cover;
          border-radius: 0;
        }

        .psp-side-card {
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

        .psp-side-card--left {
          left: 0;
          bottom: 82px;
        }

        .psp-side-card--right {
          right: 8px;
          top: 72px;
          width: min(210px, 38%);
        }

        .psp-side-card-label,
        .psp-overview-eyebrow {
          display: block;
          margin-bottom: 10px;
          color: #FF751F;
          font-size: 0.77rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .psp-side-card strong {
          display: block;
          line-height: 1.5;
          font-size: 1rem;
        }

        .psp-metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-top: 34px;
        }

        .psp-metric-card,
        .psp-overview-card,
        .psp-card,
        .psp-workflow-card {
          background: rgba(255, 255, 255, 0.84);
          border: 1px solid rgba(11, 34, 71, 0.08);
          border-radius: 4px;
          box-shadow: 0 22px 48px rgba(15, 23, 42, 0.07);
          backdrop-filter: blur(12px);
        }

        .psp-metric-card {
          padding: 22px 24px;
        }

        .psp-metric-card strong {
          display: block;
          margin-bottom: 6px;
          font-size: 1.15rem;
        }

        .psp-metric-card span {
          color: #5a6a7e;
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .psp-overview,
        .psp-capabilities,
        .psp-workflow {
          padding: 38px 0 88px;
        }

        .psp-overview-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.9fr 0.9fr;
          gap: 22px;
        }

        .psp-overview-card {
          padding: 28px;
        }

        .psp-overview-card--feature {
          background: linear-gradient(135deg, rgba(11, 34, 71, 0.96) 0%, rgba(22, 53, 110, 0.96) 100%);
          color: #ffffff;
          box-shadow: 0 26px 60px rgba(11, 34, 71, 0.18);
        }

        .psp-overview-card--feature p {
          color: rgba(255, 255, 255, 0.82);
        }

        .psp-overview-card h2,
        .psp-section-head h2,
        .psp-footer-cta h3 {
          margin: 14px 0 14px;
          font-size: clamp(1.8rem, 3vw, 2.8rem);
          line-height: 1.08;
          letter-spacing: -0.03em;
        }

        .psp-overview-card p,
        .psp-section-head p,
        .psp-workflow-card p,
        .psp-footer-cta p {
          margin: 0;
          color: #5a6a7e;
          line-height: 1.8;
          font-size: 0.98rem;
        }

        .psp-section-head {
          max-width: 760px;
          margin-bottom: 28px;
        }

        .psp-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        .psp-card {
          padding: 28px;
        }

        .psp-card-index,
        .psp-workflow-number {
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

        .psp-card h3,
        .psp-workflow-card h3 {
          margin: 0 0 12px;
          font-size: 1.24rem;
          line-height: 1.35;
        }

        .psp-card p {
          margin: 0;
          color: #5a6a7e;
          line-height: 1.85;
          font-size: 0.98rem;
        }

        .psp-workflow-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
        }

        .psp-workflow-card {
          padding: 28px;
        }

        .psp-footer-cta {
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

        .psp-footer-cta p {
          color: rgba(255, 255, 255, 0.82);
          max-width: 620px;
        }

        @media (max-width: 1100px) {
          .psp-hero-grid,
          .psp-overview-grid,
          .psp-workflow-grid {
            grid-template-columns: 1fr;
          }

          .psp-hero-grid {
            min-height: auto;
          }

          .psp-hero-visual {
            min-height: 520px;
          }

          .psp-footer-cta {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 900px) {
          .psp-nav-links {
            display: none;
          }

          .psp-hero {
            padding: 98px 0 32px;
          }

          .psp-grid,
          .psp-metrics {
            grid-template-columns: 1fr;
          }

          .psp-hero-copy h1 {
            font-size: clamp(2.4rem, 11vw, 4rem);
          }

          .psp-side-card {
            width: min(220px, 46%);
          }

          .psp-side-card--right {
            top: 34px;
          }

          .psp-side-card--left {
            bottom: 36px;
          }
        }

        @media (max-width: 640px) {
          .psp-shell {
            width: min(100% - 28px, 1160px);
          }

          .psp-hero {
            padding-top: 86px;
          }

          .psp-hero-visual {
            min-height: 370px;
            display: grid;
            gap: 14px;
          }

          .psp-side-card {
            position: static;
            width: 100%;
          }

          .psp-orb {
            display: none;
          }

          .psp-card,
          .psp-overview-card,
          .psp-workflow-card,
          .psp-footer-cta,
          .psp-metric-card {
            padding: 22px;
          }

          .psp-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}

export default PointOfSalePage