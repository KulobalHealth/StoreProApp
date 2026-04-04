import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../MainLogo.jpeg'
import MarketingFooter from '../components/MarketingFooter'

export default function PrivacyPolicy() {
  const { hash } = useLocation()

  useEffect(() => {
    if (hash === '#terms') {
      const el = document.getElementById('terms')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollTo(0, 0)
    }
  }, [hash])

  return (
    <div className="pp-root">
      <style>{ppStyles}</style>

      {/* NAV */}
      <nav className="pp-nav">
        <Link to="/" className="pp-nav-logo">
          <img src={logo} alt="StorePro" style={{ height: '32px', objectFit: 'contain' }} />
        </Link>
        <div className="pp-nav-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Use</a>
          <Link to="/">← Back to Home</Link>
        </div>
      </nav>

      {/* ─── PRIVACY POLICY ─── */}
      <article className="pp-content" id="privacy">
        <header className="pp-header">
          <p className="pp-label">Legal</p>
          <h1>Privacy Policy</h1>
          <p className="pp-effective">Effective Date: 29 March 2026</p>
        </header>

        <section className="pp-section">
          <h2>1. Introduction</h2>
          <p>Data Leap Technologies Inc. ("we," "us," or "our") operates MicroBiz, a cloud-based store management platform designed for small and medium-sized businesses. We are committed to protecting your personal information and your right to privacy.</p>
          <p>This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use MicroBiz. Please read this policy carefully. If you do not agree with its terms, please discontinue use of the platform.</p>
        </section>

        <section className="pp-section">
          <h2>2. Information We Collect</h2>

          <h3>2.1 Information You Provide Directly</h3>
          <p>When you register and use MicroBiz, we collect the following:</p>
          <ul>
            <li><strong>Account information:</strong> full name, business name, email address, phone number, and password</li>
            <li><strong>Business profile:</strong> store type, location, number of branches, and operating hours</li>
            <li><strong>Product and inventory data:</strong> product names, SKUs, pricing, stock quantities, and supplier details</li>
            <li><strong>Transaction records:</strong> sales data, payment methods, receipt information, and purchase orders</li>
            <li><strong>Staff information:</strong> names, roles, and login credentials of staff members you add to the platform</li>
            <li><strong>Support communications:</strong> messages, tickets, or feedback submitted to our team</li>
          </ul>

          <h3>2.2 Information Collected Automatically</h3>
          <p>When you access MicroBiz, we automatically collect certain technical data, including:</p>
          <ul>
            <li><strong>Device information:</strong> device type, operating system, and browser version</li>
            <li><strong>Usage data:</strong> features accessed, pages visited, session duration, and click activity</li>
            <li><strong>Log data:</strong> IP address, access timestamps, error logs, and referring URLs</li>
            <li><strong>Location data:</strong> approximate location derived from your IP address (not GPS-level precision)</li>
          </ul>

          <h3>2.3 Information From Third Parties</h3>
          <p>We may receive information about you from payment processors (e.g., Mobile Money operators), SMS gateway providers used for receipts and alerts, and third-party integrations you choose to connect to MicroBiz.</p>
        </section>

        <section className="pp-section">
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Create and manage your MicroBiz account</li>
            <li>Provide, operate, and improve the platform and its features</li>
            <li>Process transactions and generate reports and analytics for your business</li>
            <li>Send transactional communications such as receipts, low-stock alerts, and system notifications</li>
            <li>Provide customer support and respond to your inquiries</li>
            <li>Detect, prevent, and address fraud, security breaches, or technical issues</li>
            <li>Comply with legal obligations under Ghanaian law and applicable regulations</li>
            <li>Conduct internal analytics and research to improve our services</li>
            <li>Send you product updates, new feature announcements, and promotional content (you may opt out at any time)</li>
          </ul>
        </section>

        <section className="pp-section">
          <h2>4. Legal Basis for Processing</h2>
          <p>We process your personal data on the following legal bases:</p>
          <ul>
            <li><strong>Contract performance:</strong> to fulfill our obligations under our agreement with you as a subscriber</li>
            <li><strong>Legitimate interests:</strong> to improve our services, prevent fraud, and ensure platform security</li>
            <li><strong>Legal compliance:</strong> to meet obligations under applicable Ghanaian laws, including the Data Protection Act, 2012 (Act 843)</li>
            <li><strong>Consent:</strong> where you have explicitly given permission for specific processing activities</li>
          </ul>
        </section>

        <section className="pp-section">
          <h2>5. Data Sharing and Disclosure</h2>

          <h3>5.1 Service Providers</h3>
          <p>We may share your data with trusted third-party service providers who assist us in operating the platform, including cloud hosting providers, payment processors, SMS gateway providers, and analytics tools. These providers are contractually bound to handle your data only as instructed by us.</p>

          <h3>5.2 Business Transfers</h3>
          <p>If Data Leap Technologies Inc. is involved in a merger, acquisition, or asset sale, your data may be transferred as part of that transaction. We will notify you before your data is transferred and becomes subject to a different privacy policy.</p>

          <h3>5.3 Legal Requirements</h3>
          <p>We may disclose your information where required to do so by law, court order, or in response to valid requests by public authorities, including the Data Protection Commission of Ghana.</p>

          <h3>5.4 We Do Not Sell Your Data</h3>
          <p>Data Leap Technologies Inc. does not sell, rent, or trade your personal information to third parties for their marketing purposes.</p>
        </section>

        <section className="pp-section">
          <h2>6. Data Retention</h2>
          <p>We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting <a href="mailto:support@dataleaptech.com">support@dataleaptech.com</a>.</p>
          <p>Some data may be retained for a limited period after account deletion where required by law (e.g., financial transaction records) or for legitimate business purposes such as resolving disputes.</p>
        </section>

        <section className="pp-section">
          <h2>7. Data Security</h2>
          <p>We implement industry-standard security measures to protect your information, including:</p>
          <ul>
            <li>Encryption of data in transit using TLS/SSL protocols</li>
            <li>Encrypted storage of sensitive credentials and passwords</li>
            <li>Role-based access controls to limit staff access to data</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Two-factor authentication options for account access</li>
          </ul>
          <p>No method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security. In the event of a data breach, we will notify affected users in accordance with applicable law.</p>
        </section>

        <section className="pp-section">
          <h2>8. Your Rights Under the Data Protection Act, 2012 (Ghana)</h2>
          <p>As a data subject under Ghanaian law, you have the right to:</p>
          <ul>
            <li><strong>Access:</strong> request a copy of the personal data we hold about you</li>
            <li><strong>Correction:</strong> request correction of inaccurate or incomplete data</li>
            <li><strong>Deletion:</strong> request that we delete your personal data, subject to legal obligations</li>
            <li><strong>Objection:</strong> object to certain types of data processing, including direct marketing</li>
            <li><strong>Portability:</strong> request a structured, machine-readable copy of your data</li>
            <li><strong>Withdrawal of consent:</strong> withdraw consent for processing at any time, without affecting the lawfulness of prior processing</li>
          </ul>
          <p>To exercise any of these rights, contact us at: <a href="mailto:privacy@dataleaptech.com">privacy@dataleaptech.com</a>. We will respond within 30 days.</p>
        </section>

        <section className="pp-section">
          <h2>9. Cookies and Tracking</h2>
          <p>MicroBiz uses cookies and similar technologies to maintain your session, remember preferences, and improve your experience. You may control cookie settings through your browser. Disabling cookies may affect some platform features.</p>
        </section>

        <section className="pp-section">
          <h2>10. Children's Privacy</h2>
          <p>MicroBiz is not directed at individuals under the age of 18. We do not knowingly collect personal information from minors. If you believe a minor has provided us with their data, please contact us immediately and we will delete it.</p>
        </section>

        <section className="pp-section">
          <h2>11. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of material changes via email or a prominent in-app notice at least 14 days before the changes take effect. Your continued use of MicroBiz after the effective date constitutes acceptance of the updated policy.</p>
        </section>

        <div className="pp-divider" />

        {/* ─── TERMS OF USE ─── */}
        <header className="pp-header" id="terms">
          <h1>Terms of Use</h1>
          <p className="pp-effective">Effective Date: 29 March 2026</p>
        </header>

        <section className="pp-section">
          <h2>1. Acceptance of Terms</h2>
          <p>By registering for, accessing, or using MicroBiz (the "Platform"), you ("User" or "Subscriber") agree to be legally bound by these Terms of Use. These Terms constitute a binding agreement between you and Data Leap Technologies Inc. ("Company," "we," or "us").</p>
          <p>If you are accepting these Terms on behalf of a business or organization, you represent that you have the authority to bind that entity. If you do not agree to these Terms, you must immediately cease use of the Platform.</p>
        </section>

        <section className="pp-section">
          <h2>2. Description of Service</h2>
          <p>MicroBiz is a Software-as-a-Service (SaaS) store management system that provides small and medium-sized businesses with tools for:</p>
          <ul>
            <li>Inventory and stock management</li>
            <li>Point of Sale (POS) operations</li>
            <li>Sales reporting and business analytics</li>
            <li>Staff and role-based access management</li>
            <li>Supplier and purchase order management</li>
            <li>Multi-branch management (Enterprise plan)</li>
          </ul>
          <p>We reserve the right to modify, suspend, or discontinue any part of the Platform at any time, with reasonable prior notice where possible.</p>
        </section>

        <section className="pp-section">
          <h2>3. Eligibility and Account Registration</h2>

          <h3>3.1 Eligibility</h3>
          <p>You must be at least 18 years of age and legally capable of entering into a binding contract to use MicroBiz. By registering, you confirm that you meet these requirements.</p>

          <h3>3.2 Account Registration</h3>
          <p>You agree to provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.</p>
          <p>You must notify us immediately at <a href="mailto:support@dataleaptech.com">support@dataleaptech.com</a> of any unauthorized use of your account. We are not liable for losses caused by unauthorized access due to your failure to secure your credentials.</p>

          <h3>3.3 Account Verification</h3>
          <p>We reserve the right to verify your identity or business details before activating or maintaining your account. Providing false information is grounds for immediate account suspension.</p>
        </section>

        <section className="pp-section">
          <h2>4. Subscription Plans and Payment</h2>

          <h3>4.1 Plans</h3>
          <p>MicroBiz is available on the following subscription tiers:</p>
          <ul>
            <li><strong>Starter (Free):</strong> Limited features for solo sellers and micro-businesses</li>
            <li><strong>Growth (GHS 99/month):</strong> Full-featured plan for established small businesses</li>
            <li><strong>Enterprise (Custom pricing):</strong> Multi-branch, high-volume, and custom integration plans</li>
          </ul>
          <p>Plan features and limits are described on our website and may be updated with prior notice.</p>

          <h3>4.2 Payment Terms</h3>
          <p>Paid subscriptions are billed monthly or annually in advance. Accepted payment methods include Mobile Money (MTN MoMo, Vodafone Cash, AirtelTigo Money), bank transfer, and card payments where available.</p>
          <p>All fees are non-refundable except where required by law or explicitly stated otherwise. Failure to pay will result in downgrade to the free tier or account suspension after a 7-day grace period.</p>

          <h3>4.3 Taxes</h3>
          <p>Prices displayed do not include applicable VAT or other taxes where required by Ghanaian law. You are responsible for any taxes applicable to your subscription.</p>

          <h3>4.4 Free Trial</h3>
          <p>New subscribers on the Growth plan receive a 14-day free trial. No credit card is required to begin. At the end of the trial, your account will automatically downgrade to the Starter plan unless you provide payment details.</p>
        </section>

        <section className="pp-section">
          <h2>5. Acceptable Use</h2>

          <h3>5.1 Permitted Use</h3>
          <p>You may use MicroBiz solely for lawful business purposes and in accordance with these Terms.</p>

          <h3>5.2 Prohibited Conduct</h3>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Platform for any illegal activity, fraud, or money laundering</li>
            <li>Upload false, misleading, or fabricated business or product information</li>
            <li>Attempt to reverse-engineer, decompile, or extract the source code of the Platform</li>
            <li>Use automated tools, bots, or scrapers to access or extract data from the Platform</li>
            <li>Circumvent any security, authentication, or access control measures</li>
            <li>Share your account credentials with unauthorized parties</li>
            <li>Use the Platform to infringe the intellectual property rights of any third party</li>
            <li>Transmit malware, viruses, or any code designed to disrupt the Platform</li>
            <li>Attempt to gain unauthorized access to other users' accounts or data</li>
          </ul>
          <p>Violation of these prohibitions may result in immediate account suspension or termination without refund.</p>
        </section>

        <section className="pp-section">
          <h2>6. Intellectual Property</h2>

          <h3>6.1 Our Property</h3>
          <p>MicroBiz, including its software, design, branding, logos, features, and documentation, is the exclusive intellectual property of Data Leap Technologies Inc. Nothing in these Terms grants you any ownership rights in the Platform.</p>

          <h3>6.2 Your Data</h3>
          <p>You retain full ownership of all business data you enter into MicroBiz, including product records, sales data, and customer information. You grant us a limited, non-exclusive license to process and store this data solely to provide the service.</p>

          <h3>6.3 Feedback</h3>
          <p>Any feedback, suggestions, or ideas you submit to us regarding MicroBiz may be used by us freely without obligation or compensation to you.</p>
        </section>

        <section className="pp-section">
          <h2>7. Data and Privacy</h2>
          <p>Your use of MicroBiz is also governed by our <a href="#privacy">Privacy Policy</a> (Part One of this document), which is incorporated herein by reference. By using the Platform, you consent to the data practices described in the Privacy Policy.</p>
        </section>

        <section className="pp-section">
          <h2>8. Uptime and Service Availability</h2>
          <p>We aim to maintain 99% platform uptime. Scheduled maintenance will be communicated at least 48 hours in advance where possible. We are not liable for downtime caused by factors outside our control, including internet service interruptions, third-party outages, force majeure events, or actions of users.</p>
        </section>

        <section className="pp-section">
          <h2>9. Limitation of Liability</h2>
          <p>To the maximum extent permitted by applicable Ghanaian law:</p>
          <ul>
            <li>The Platform is provided on an "as is" and "as available" basis without warranties of any kind</li>
            <li>Data Leap Technologies Inc. shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of MicroBiz</li>
            <li>Our total liability to you for any claim shall not exceed the amount you paid us in the three (3) months preceding the event giving rise to the claim</li>
          </ul>
          <p>Nothing in these Terms limits our liability for death or personal injury caused by our negligence, fraud, or any liability that cannot be excluded by law.</p>
        </section>

        <section className="pp-section">
          <h2>10. Indemnification</h2>
          <p>You agree to indemnify, defend, and hold harmless Data Leap Technologies Inc. and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses (including legal fees) arising from: (a) your use of the Platform; (b) your violation of these Terms; (c) your violation of any third-party rights; or (d) your business operations conducted through MicroBiz.</p>
        </section>

        <section className="pp-section">
          <h2>11. Termination</h2>

          <h3>11.1 Termination by You</h3>
          <p>You may cancel your MicroBiz account at any time by contacting <a href="mailto:support@dataleaptech.com">support@dataleaptech.com</a> or using the account settings. Cancellation takes effect at the end of your current billing period.</p>

          <h3>11.2 Termination by Us</h3>
          <p>We may suspend or terminate your account immediately, without prior notice, if you: violate these Terms; engage in fraudulent activity; fail to pay fees; or create legal, regulatory, or reputational risk for Data Leap Technologies Inc.</p>

          <h3>11.3 Effect of Termination</h3>
          <p>Upon termination, your right to access the Platform ceases immediately. We will retain a copy of your data for 30 days following termination, after which it will be permanently deleted. You may request an export of your data before deletion.</p>
        </section>

        <section className="pp-section">
          <h2>12. Governing Law and Dispute Resolution</h2>
          <p>These Terms are governed by and construed in accordance with the laws of the Republic of Ghana.</p>
          <p>Any dispute arising from or relating to these Terms or your use of MicroBiz shall first be attempted to be resolved amicably through direct negotiation within 30 days of written notice. If unresolved, disputes shall be submitted to the jurisdiction of the courts of Ghana.</p>
        </section>

        <section className="pp-section">
          <h2>13. Changes to These Terms</h2>
          <p>We may update these Terms from time to time to reflect changes in our services, legal requirements, or business practices. We will notify you of material changes at least 14 days before they take effect via email or an in-app notice. Your continued use of MicroBiz after the effective date constitutes your acceptance of the revised Terms.</p>
        </section>

        <section className="pp-section">
          <h2>14. Entire Agreement</h2>
          <p>These Terms, together with the Privacy Policy and any applicable Subscription Agreement, constitute the entire agreement between you and Data Leap Technologies Inc. regarding MicroBiz and supersede all prior agreements, understandings, or representations.</p>
        </section>

        <section className="pp-section">
          <h2>15. Severability</h2>
          <p>If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.</p>
        </section>

        <section className="pp-section">
          <h2>16. Contact Us</h2>
          <p>For questions, concerns, or notices regarding these Terms or our Privacy Policy, please contact:</p>
          <div className="pp-contact">
            <p><strong>Company:</strong> Data Leap Technologies Inc.</p>
            <p><strong>Product Support:</strong> <a href="mailto:support@dataleaptech.com">support@dataleaptech.com</a></p>
            <p><strong>Privacy Inquiries:</strong> <a href="mailto:privacy@dataleaptech.com">privacy@dataleaptech.com</a></p>
            <p><strong>Legal Notices:</strong> <a href="mailto:legal@dataleaptech.com">legal@dataleaptech.com</a></p>
            <p><strong>Address:</strong> Accra, Ghana</p>
            <p><strong>Website:</strong> <a href="https://www.dataleaptech.com" target="_blank" rel="noopener noreferrer">www.dataleaptech.com</a></p>
          </div>
        </section>
      </article>

      {/* FOOTER */}
      <MarketingFooter />
    </div>
  )
}

const ppStyles = `
.pp-root {
  --ink: #0B2247;
  --amber: #FF751F;
  --muted: #5a6a7e;
  --border: #e2e8f0;
  --bg: #f9fafb;
  font-family: 'Manrope', sans-serif;
  color: var(--ink);
  background: var(--bg);
  min-height: 100vh;
}

.pp-root *, .pp-root *::before, .pp-root *::after {
  box-sizing: border-box;
}

/* NAV */
.pp-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 5%;
  background: #fff;
  border-bottom: 1px solid var(--border);
}

.pp-nav-logo {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--ink);
  text-decoration: none;
}

.pp-nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.pp-nav-links a {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--muted);
  text-decoration: none;
  transition: color 0.2s;
}

.pp-nav-links a:hover {
  color: var(--ink);
}

/* CONTENT */
.pp-content {
  max-width: 740px;
  margin: 0 auto;
  padding: 3.5rem 1.5rem 5rem;
}

.pp-header {
  margin-bottom: 3rem;
  padding-top: 1rem;
}

.pp-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--amber);
  margin-bottom: 0.6rem;
}

.pp-header h1 {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1.2;
  color: var(--ink);
  margin: 0 0 0.5rem;
}

.pp-effective {
  font-size: 0.85rem;
  color: var(--muted);
}

/* SECTIONS */
.pp-section {
  margin-bottom: 2.5rem;
}

.pp-section h2 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--ink);
  margin: 0 0 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--amber);
  display: inline-block;
}

.pp-section h3 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--ink);
  margin: 1.5rem 0 0.5rem;
}

.pp-section p {
  font-size: 0.88rem;
  line-height: 1.75;
  color: var(--muted);
  margin: 0 0 0.75rem;
}

.pp-section ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 1rem;
}

.pp-section ul li {
  font-size: 0.88rem;
  line-height: 1.75;
  color: var(--muted);
  padding-left: 1.25rem;
  position: relative;
  margin-bottom: 0.35rem;
}

.pp-section ul li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.65em;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--amber);
}

.pp-section ul li strong {
  color: var(--ink);
}

.pp-section a {
  color: var(--amber);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.pp-section a:hover {
  color: #e5680f;
}

/* CONTACT BLOCK */
.pp-contact {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 1.25rem 1.5rem;
  margin-top: 0.75rem;
}

.pp-contact p {
  margin-bottom: 0.4rem;
}

/* DIVIDER */
.pp-divider {
  height: 1px;
  background: var(--border);
  margin: 4rem 0;
}

/* FOOTER */
.pp-footer {
  background: var(--bg);
  border-top: 1px solid var(--border);
  padding: 3rem 5%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.pp-footer-logo {
  display: flex;
  align-items: center;
}

.pp-footer-links {
  display: flex;
  gap: 2rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.pp-footer-links a {
  text-decoration: none;
  color: var(--muted);
  font-size: 0.85rem;
  transition: color 0.2s;
}

.pp-footer-links a:hover {
  color: var(--ink);
}

.pp-footer-copy {
  font-size: 0.8rem;
  color: var(--muted);
}

/* RESPONSIVE */
@media (max-width: 600px) {
  .pp-content { padding: 2.5rem 1.25rem 4rem; }
  .pp-header h1 { font-size: 1.6rem; }
  .pp-nav-links { gap: 0.8rem; }
  .pp-nav-links a { font-size: 0.75rem; }
  .pp-footer { flex-direction: column; text-align: center; }
}
`
