import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import MarketingHeader from '../components/MarketingHeader'
import MarketingFooter from '../components/MarketingFooter'
import jkImage from '../mobile-mockups/jk.png'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const inventoryMetrics = [
  { value: 'Live stock', label: 'Visibility across locations' },
  { value: 'Flexible', label: 'Units, batches, and valuation' },
  { value: 'Controlled', label: 'Reordering and expiry tracking' },
]

const inventorySections = [
  {
    title: 'Define unlimited groups, categories, batches and locations',
    description:
      'Easily categorize and manage multiple product lines in Microbiz. Define stocks into unlimited groups, categories, batches, and locations or godowns for seamless inventory tracking.',
  },
  {
    title: 'Flexible units of measure',
    description:
      'Handle purchasing in one unit and selling in another, manage stock items quantified in multiple units, and support floating conversions that match real business operations.',
  },
  {
    title: 'Manufacturing journal',
    description:
      'Record the entire manufacturing cycle in Microbiz, including raw materials used, dispatch locations, purchase costs, and finished goods for full production visibility.',
  },
  {
    title: 'Bill of Material (BoM)',
    description:
      'Define raw materials, assemblies, by-products, scrap, and components with quantities required to manufacture finished goods using a structured BoM workflow.',
  },
  {
    title: 'Reorder level management',
    description:
      'Set reorder and minimum order levels, automatically detect shortages, and know exactly what needs replenishment before stockouts affect operations.',
  },
  {
    title: 'Multiple stock valuation methods',
    description:
      'Support the valuation method that fits your business while keeping stock reporting clean, reliable, and ready for downstream accounting processes.',
  },
  {
    title: 'Job work management',
    description:
      'Track issued materials, receipts, and consumption whether you operate as a principal manufacturer or job worker, with clear visibility into job status.',
  },
  {
    title: 'Manufacturing and expiry date management',
    description:
      'Manage stock in batches with both manufacturing and expiry dates, and monitor remaining shelf life so teams can act before stock becomes unusable.',
  },
]

const workflowSteps = [
  {
    title: 'Organize stock your way',
    description:
      'Set up categories, batches, units, and locations so inventory reflects how your business actually operates.',
  },
  {
    title: 'Track every movement clearly',
    description:
      'Follow purchasing, production, transfers, and job work with enough detail to understand what changed and where.',
  },
  {
    title: 'Replenish with confidence',
    description:
      'Use reorder levels, valuation methods, and expiry awareness to maintain the right stock at the right time.',
  },
]

const InventoryManagementPage = () => {
  return (
    <div className="imp-page">
      <MarketingHeader />

      <section className="imp-hero">
        <div className="imp-shell">
          <div className="imp-hero-grid">
            <motion.div
              className="imp-hero-copy"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.55, delay: 0.05 }}
            >
              <div className="imp-kicker">Inventory Intelligence</div>
              <h1>Inventory control built for speed, structure, and scale.</h1>
              <p>
                Manage stock with clear organization, flexible measurement, manufacturing support,
                and replenishment workflows that keep your operations moving.
              </p>

              <div className="imp-actions imp-actions--hero">
                <Link to="/register" className="imp-cta">Get Started</Link>
                <Link to="/" className="imp-cta imp-cta--ghost">Back to Homepage</Link>
              </div>
            </motion.div>

            <motion.div
              className="imp-hero-visual"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.12 }}
            >
              <div className="imp-orb imp-orb--orange" />
              <div className="imp-orb imp-orb--navy" />

              <div className="imp-side-card imp-side-card--left">
                <div className="imp-side-card-label">Structured stock</div>
                <strong>Groups, batches, locations, and units in one system</strong>
              </div>

              <div className="imp-side-card imp-side-card--right">
                <div className="imp-side-card-label">Operational control</div>
                <strong>Track reorder levels, expiry, valuation, and job work</strong>
              </div>

              <div className="imp-hero-frame">
                <img src={jkImage} alt="Inventory management dashboard preview" loading="lazy" />
              </div>
            </motion.div>
          </div>

          <motion.div
            className="imp-metrics"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
            transition={{ duration: 0.45 }}
          >
            {inventoryMetrics.map((item) => (
              <div key={item.value} className="imp-metric-card">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="imp-overview">
        <div className="imp-shell imp-overview-grid">
          <motion.article
            className="imp-overview-card imp-overview-card--feature"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.45 }}
          >
            <span className="imp-section-label">Why teams choose it</span>
            <h2>From stock visibility to smarter replenishment decisions.</h2>
            <p>
              Microbiz helps teams keep inventory organized, production-aware, and easy to act on
              with dependable control across every stage of stock movement.
            </p>
          </motion.article>

          <motion.article
            className="imp-overview-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.45, delay: 0.06 }}
          >
            <span className="imp-overview-eyebrow">Built for operational clarity</span>
            <p>
              Keep track of where stock sits, how it moves, and what is needed next without relying
              on disconnected spreadsheets or manual follow-ups.
            </p>
          </motion.article>

          <motion.article
            className="imp-overview-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.45, delay: 0.12 }}
          >
            <span className="imp-overview-eyebrow">Designed for complex workflows</span>
            <p>
              Support batch tracking, multiple units, manufacturing, expiry dates, and job work in a
              single inventory setup that grows with your business.
            </p>
          </motion.article>
        </div>
      </section>

      <section className="imp-capabilities">
        <div className="imp-shell">
          <motion.div
            className="imp-section-head"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.45 }}
          >
            <span className="imp-section-label">Capabilities</span>
            <h2>Everything you need to run inventory with more confidence.</h2>
            <p>
              Explore the tools that help your team organize stock, support production, and prevent
              avoidable shortages or losses.
            </p>
          </motion.div>

          <div className="imp-grid">
            {inventorySections.map((section, index) => (
              <motion.article
                key={section.title}
                className="imp-card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                transition={{ duration: 0.45, delay: index * 0.04 }}
              >
                <div className="imp-card-index">{String(index + 1).padStart(2, '0')}</div>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="imp-workflow">
        <div className="imp-shell">
          <motion.div
            className="imp-section-head"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.45 }}
          >
            <span className="imp-section-label">Workflow</span>
            <h2>An inventory flow that stays organized from setup to replenishment.</h2>
          </motion.div>

          <div className="imp-workflow-grid">
            {workflowSteps.map((step, index) => (
              <motion.article
                key={step.title}
                className="imp-workflow-card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <div className="imp-workflow-number">0{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </motion.article>
            ))}
          </div>

          <motion.div
            className="imp-footer-cta"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.45 }}
          >
            <div>
              <span className="imp-section-label imp-section-label--light">Ready to improve inventory control?</span>
              <h3>Use Microbiz to keep stock visible, organized, and ready for action.</h3>
              <p>
                Bring purchasing, manufacturing, locations, batches, and replenishment into one
                inventory experience your team can trust every day.
              </p>
            </div>
            <div className="imp-actions">
              <Link to="/register" className="imp-cta">Create Account</Link>
              <Link to="/login" className="imp-cta imp-cta--ghost-light">Sign In</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <MarketingFooter />

      <style>{`
        .imp-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(255, 117, 31, 0.1), transparent 26%),
            linear-gradient(180deg, #f6f9fc 0%, #ffffff 38%, #f2f5fa 100%);
          color: #0B2247;
          font-family: Manrope, sans-serif;
        }

        .imp-shell {
          width: min(1160px, calc(100% - 48px));
          margin: 0 auto;
        }

        .imp-nav {
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

        .imp-logo {
          display: flex;
          align-items: center;
          text-decoration: none;
        }

        .imp-logo-img {
          height: 36px;
          object-fit: contain;
        }

        .imp-nav-links {
          display: flex;
          gap: 2.2rem;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .imp-nav-links a {
          text-decoration: none;
          color: #5a6a7e;
          font-size: 0.92rem;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .imp-nav-links a:hover {
          color: #0B2247;
        }

        .imp-nav-signin {
          color: #0B2247 !important;
          font-weight: 700 !important;
        }

        .imp-nav-cta,
        .imp-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 700;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }

        .imp-nav-cta {
          background: #0B2247;
          color: #ffffff !important;
          padding: 0.55rem 1.3rem;
          font-size: 0.88rem !important;
        }

        .imp-nav-cta:hover {
          background: #FF751F !important;
          transform: translateY(-1px);
        }

        .imp-hero {
          position: relative;
          overflow: hidden;
          padding: 126px 0 36px;
        }

        .imp-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(360px, 0.95fr);
          gap: 42px;
          align-items: center;
          min-height: calc(100vh - 210px);
        }

        .imp-kicker,
        .imp-section-label {
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

        .imp-section-label--light {
          background: rgba(255, 255, 255, 0.12);
          color: #ffd7bd;
        }

        .imp-kicker {
          margin-bottom: 18px;
        }

        .imp-hero-copy {
          max-width: 650px;
        }

        .imp-hero-copy h1 {
          margin: 0 0 18px;
          font-size: clamp(2.4rem, 4.2vw, 4.6rem);
          line-height: 0.95;
          letter-spacing: -0.05em;
        }

        .imp-hero-copy p {
          margin: 0;
          max-width: 620px;
          font-size: 1.08rem;
          line-height: 1.9;
          color: #5a6a7e;
        }

        .imp-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        .imp-actions--hero {
          margin-top: 28px;
        }

        .imp-cta {
          background: #FF751F;
          color: #ffffff;
          padding: 12px 18px;
          box-shadow: 0 14px 28px rgba(255, 117, 31, 0.22);
        }

        .imp-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 18px 34px rgba(255, 117, 31, 0.28);
        }

        .imp-cta--ghost {
          background: rgba(255, 255, 255, 0.8);
          color: #0B2247;
          border: 1px solid rgba(11, 34, 71, 0.12);
          box-shadow: none;
        }

        .imp-cta--ghost:hover {
          color: #FF751F;
          border-color: rgba(255, 117, 31, 0.3);
          box-shadow: none;
        }

        .imp-cta--ghost-light {
          background: transparent;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.24);
          box-shadow: none;
        }

        .imp-cta--ghost-light:hover {
          border-color: rgba(255, 255, 255, 0.46);
          color: #ffffff;
          box-shadow: none;
        }

        .imp-hero-visual {
          position: relative;
          min-height: 590px;
          display: flex;
          justify-content: center;
          align-items: center;
          isolation: isolate;
        }

        .imp-orb {
          position: absolute;
          border-radius: 999px;
          filter: blur(4px);
          z-index: 0;
        }

        .imp-orb--orange {
          width: min(70vw, 410px);
          aspect-ratio: 1;
          top: 10%;
          right: 8%;
          background: radial-gradient(circle, rgba(255, 117, 31, 0.24) 0%, rgba(255, 117, 31, 0.08) 55%, rgba(255, 117, 31, 0) 76%);
        }

        .imp-orb--navy {
          width: min(62vw, 340px);
          aspect-ratio: 1;
          bottom: 10%;
          left: 4%;
          background: radial-gradient(circle, rgba(11, 34, 71, 0.18) 0%, rgba(11, 34, 71, 0.06) 52%, rgba(11, 34, 71, 0) 74%);
        }

        .imp-hero-frame {
          position: relative;
          z-index: 1;
          width: min(100%, 650px);
          overflow: hidden;
          background: transparent;
          border-radius: 0;
          padding: 14px;
        }

        .imp-hero-frame img {
          display: block;
          width: 100%;
          height: auto;
          border-radius: 0;
          object-fit: cover;
        }

        .imp-side-card {
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

        .imp-side-card--left {
          left: 0;
          bottom: 82px;
        }

        .imp-side-card--right {
          right: 0;
          top: 72px;
        }

        .imp-side-card-label,
        .imp-overview-eyebrow {
          display: block;
          margin-bottom: 10px;
          color: #FF751F;
          font-size: 0.77rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .imp-side-card strong {
          display: block;
          line-height: 1.5;
          font-size: 1rem;
        }

        .imp-metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-top: 34px;
        }

        .imp-metric-card,
        .imp-overview-card,
        .imp-card,
        .imp-workflow-card {
          background: rgba(255, 255, 255, 0.84);
          border: 1px solid rgba(11, 34, 71, 0.08);
          border-radius: 4px;
          box-shadow: 0 22px 48px rgba(15, 23, 42, 0.07);
          backdrop-filter: blur(12px);
        }

        .imp-metric-card {
          padding: 22px 24px;
        }

        .imp-metric-card strong {
          display: block;
          margin-bottom: 6px;
          font-size: 1.15rem;
        }

        .imp-metric-card span {
          color: #5a6a7e;
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .imp-overview,
        .imp-capabilities,
        .imp-workflow {
          padding: 38px 0 88px;
        }

        .imp-overview-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.9fr 0.9fr;
          gap: 22px;
        }

        .imp-overview-card {
          padding: 28px;
        }

        .imp-overview-card--feature {
          background: linear-gradient(135deg, rgba(11, 34, 71, 0.96) 0%, rgba(22, 53, 110, 0.96) 100%);
          color: #ffffff;
          box-shadow: 0 26px 60px rgba(11, 34, 71, 0.18);
        }

        .imp-overview-card--feature p {
          color: rgba(255, 255, 255, 0.82);
        }

        .imp-overview-card h2,
        .imp-section-head h2,
        .imp-footer-cta h3 {
          margin: 14px 0 14px;
          font-size: clamp(1.8rem, 3vw, 2.8rem);
          line-height: 1.08;
          letter-spacing: -0.03em;
        }

        .imp-overview-card p,
        .imp-section-head p,
        .imp-workflow-card p,
        .imp-footer-cta p {
          margin: 0;
          color: #5a6a7e;
          line-height: 1.8;
          font-size: 0.98rem;
        }

        .imp-section-head {
          max-width: 760px;
          margin-bottom: 28px;
        }

        .imp-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        .imp-card {
          padding: 28px;
        }

        .imp-card-index,
        .imp-workflow-number {
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

        .imp-card h3,
        .imp-workflow-card h3 {
          margin: 0 0 12px;
          font-size: 1.24rem;
          line-height: 1.35;
        }

        .imp-card p {
          margin: 0;
          color: #5a6a7e;
          line-height: 1.85;
          font-size: 0.98rem;
        }

        .imp-workflow-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
        }

        .imp-workflow-card {
          padding: 28px;
        }

        .imp-footer-cta {
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

        .imp-footer-cta p {
          color: rgba(255, 255, 255, 0.82);
          max-width: 620px;
        }

        @media (max-width: 1100px) {
          .imp-hero-grid,
          .imp-overview-grid,
          .imp-workflow-grid {
            grid-template-columns: 1fr;
          }

          .imp-hero-grid {
            min-height: auto;
          }

          .imp-hero-visual {
            min-height: 520px;
          }

          .imp-footer-cta {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 900px) {
          .imp-nav-links {
            display: none;
          }

          .imp-hero {
            padding: 98px 0 32px;
          }

          .imp-grid,
          .imp-metrics {
            grid-template-columns: 1fr;
          }

          .imp-hero-copy h1 {
            font-size: clamp(2.5rem, 11vw, 4rem);
          }

          .imp-side-card {
            width: min(220px, 46%);
          }

          .imp-side-card--right {
            top: 34px;
          }

          .imp-side-card--left {
            bottom: 36px;
          }
        }

        @media (max-width: 640px) {
          .imp-shell {
            width: min(100% - 28px, 1160px);
          }

          .imp-hero {
            padding-top: 86px;
          }

          .imp-hero-visual {
            min-height: 370px;
            display: grid;
            gap: 14px;
          }

          .imp-hero-frame {
            padding: 10px;
            border-radius: 0;
          }

          .imp-side-card {
            position: static;
            width: 100%;
          }

          .imp-orb {
            display: none;
          }

          .imp-card,
          .imp-overview-card,
          .imp-workflow-card,
          .imp-footer-cta,
          .imp-metric-card {
            padding: 22px;
          }

          .imp-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}

export default InventoryManagementPage
