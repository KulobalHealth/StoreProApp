import React from 'react'
import { motion } from 'motion/react'
import { useLocation } from 'react-router-dom'
import logo from '../MainLogo.jpeg'

const MarketingFooter = () => {
  const { pathname } = useLocation()
  const isHome = pathname === '/' || pathname === '/landing'

  const featureHref = isHome ? '#features' : '/#features'
  const pricingHref = isHome ? '#pricing' : '/#pricing'
  const howHref = isHome ? '#how' : '/#how'
  const reviewsHref = isHome ? '#testimonials' : '/#testimonials'

  return (
    <>
      <motion.footer
        className="mf-footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className="mf-footer-logo">
          <img src={logo} alt="MicroBiz" style={{ height: '28px', objectFit: 'contain' }} />
        </span>
        <ul className="mf-footer-links">
          <li><a href={featureHref}>Learning Hub</a></li>
          <li><a href={pricingHref}>Accounting</a></li>
          <li><a href={howHref}>Security</a></li>
          <li><a href={reviewsHref}>Business Reports</a></li>
        </ul>
        <span className="mf-footer-copy">© 2026 MicroBiz. All rights reserved.</span>
      </motion.footer>

      <style>{`
        .mf-footer {
          background: #f4f6f9;
          border-top: 1px solid #e2e8f0;
          padding: 3rem 5%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .mf-footer-logo {
          display: flex;
          align-items: center;
        }

        .mf-footer-links {
          display: flex;
          gap: 2rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .mf-footer-links a {
          text-decoration: none;
          color: #5a6a7e;
          font-size: 0.85rem;
          transition: color 0.2s;
        }

        .mf-footer-links a:hover {
          color: #0B2247;
        }

        .mf-footer-copy {
          font-size: 0.8rem;
          color: #5a6a7e;
        }

        @media (max-width: 900px) {
          .mf-footer {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </>
  )
}

export default MarketingFooter
