import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HIcon } from '../components/HIcon'
import {
  CrownIcon,
  StarIcon,
  HeadsetIcon,
  Mail01Icon,
  Wallet02Icon,
  Shield01Icon,
  LockIcon,
  SmartPhone01Icon,
  Building03Icon,
  Add01Icon,
  ArrowMoveUpRightIcon,
  ReceiptDollarIcon,
  CalendarCheckIn01Icon,
  Download01Icon,
  Tag01Icon,
  CheckmarkCircle02Icon,
  Cancel02Icon,
  Tick01Icon,
  Rocket01Icon,
  Building01Icon,
} from '@hugeicons/core-free-icons'

/* ─── Current Plan Banner ─── */
const CurrentPlanBanner = ({ planName = 'Starter', renewalDate = 'Apr 30, 2026' }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: '#FFF3EB' }}>
          <HIcon icon={CrownIcon} size={20} style={{ color: '#FF7521' }} />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Current Plan</p>
          <p className="text-lg font-bold text-gray-900">{planName}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: '#ecfdf3', color: '#047857' }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#047857' }} />
          Active
        </span>
        <span className="text-gray-400">·</span>
        <span className="text-gray-500">Renews {renewalDate}</span>
      </div>
    </div>
  </div>
)

/* ─── Billing Plan Tab ─── */
const BillingPlanTab = ({ onSubscribe }) => {
  const [billingCycle, setBillingCycle] = useState('monthly')

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small businesses getting started',
      monthlyPrice: 300,
      yearlyPrice: 3000,
      icon: Rocket01Icon,
      iconBg: '#EEF2FF',
      iconColor: '#6366F1',
      features: [
        { text: 'Single store access', included: true },
        { text: 'Up to 500 products', included: true },
        { text: 'POS & Inventory management', included: true },
        { text: 'Basic sales reports', included: true },
        { text: 'Email support (48h response)', included: true },
        { text: 'Advanced analytics', included: false },
        { text: 'Multi-user access', included: false },
        { text: 'API access', included: false },
      ],
    },
    {
      name: 'Business',
      description: 'For growing businesses that need more power',
      monthlyPrice: 1200,
      yearlyPrice: 12000,
      icon: Building01Icon,
      iconBg: '#FFF3EB',
      iconColor: '#FF7521',
      popular: true,
      features: [
        { text: 'Single store access', included: true },
        { text: 'Unlimited products', included: true },
        { text: 'POS, Inventory & Accounting', included: true },
        { text: 'Advanced reports & analytics', included: true },
        { text: 'Multi-user access (up to 10)', included: true },
        { text: 'Priority support (4h response)', included: true },
        { text: 'API access', included: true },
        { text: 'Custom integrations', included: true },
      ],
    },
  ]

  return (
    <div className="space-y-8">
      {/* Current plan banner */}
      <CurrentPlanBanner />

      {/* Section header with billing cycle toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Choose Your Plan</h2>
          <p className="mt-1 text-sm text-gray-500">Select the plan that best fits your business needs. Upgrade or downgrade anytime.</p>
        </div>
        <div className="flex items-center gap-3 rounded-full bg-gray-100 p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              billingCycle === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              billingCycle === 'yearly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Yearly
            <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: '#059669' }}>
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {plans.map((plan) => {
          const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
          const period = billingCycle === 'monthly' ? 'month' : 'year'

          return (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl bg-white transition-shadow hover:shadow-lg ${
                plan.popular
                  ? 'ring-2 shadow-md'
                  : 'border border-gray-200'
              }`}
              style={plan.popular ? { ringColor: '#FF7521', '--tw-ring-color': '#FF7521' } : undefined}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-6 z-10">
                  <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm" style={{ backgroundColor: '#FF7521' }}>
                    <HIcon icon={StarIcon} size={10} className="text-white" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex flex-1 flex-col p-6 sm:p-8">
                {/* Plan header */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: plan.iconBg }}>
                    <HIcon icon={plan.icon} size={20} style={{ color: plan.iconColor }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="mt-0.5 text-sm text-gray-500">{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold tracking-tight text-gray-900">
                    GHS {price.toLocaleString()}
                  </span>
                  <span className="text-sm font-medium text-gray-400">/ {period}</span>
                </div>
                <p className="mt-1 text-xs text-gray-400">per store · billed {billingCycle}</p>

                {/* Divider */}
                <div className="my-6 h-px bg-gray-100" />

                {/* Features */}
                <div className="mb-8 flex-1">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">What's included</p>
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f.text} className={`flex items-start gap-2.5 text-sm ${f.included ? 'text-gray-700' : 'text-gray-300'}`}>
                        <HIcon
                          icon={f.included ? CheckmarkCircle02Icon : Cancel02Icon}
                          size={14}
                          className="mt-0.5"
                          style={{ color: f.included ? '#059669' : '#D1D5DB' }}
                        />
                        {f.text}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <button
                  onClick={() => plan.popular && onSubscribe?.(plan.name, price)}
                  className={`w-full rounded-xl py-3 text-sm font-bold transition-all ${
                    plan.popular
                      ? 'text-white shadow-md hover:shadow-lg cursor-pointer'
                      : 'border-2 border-gray-200 bg-white text-gray-700 cursor-default'
                  }`}
                  style={plan.popular ? { backgroundColor: '#FF7521' } : undefined}
                >
                  {plan.popular ? 'Upgrade to Business' : 'Current Plan'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* FAQ / need help */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
            <HIcon icon={HeadsetIcon} size={20} className="text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">Need help choosing a plan?</h3>
            <p className="mt-0.5 text-sm text-gray-500">Our team is here to help you find the right plan for your business. Chat with us or send an email.</p>
          </div>
          <button className="shrink-0 rounded-xl border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50">
            <HIcon icon={Mail01Icon} size={14} className="mr-2 text-gray-400" />
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Wallet Tab ─── */
const WalletTab = ({ onLoadSuccess }) => {
  const [walletCreated, setWalletCreated] = useState(false)
  const [walletType, setWalletType] = useState('momo')
  const [momoNumber, setMomoNumber] = useState('')
  const [momoProvider, setMomoProvider] = useState('MTN')
  const [bankName, setBankName] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [balance, setBalance] = useState(2400)
  const [loadAmount, setLoadAmount] = useState('')
  const [showLoadForm, setShowLoadForm] = useState(false)

  const [subscriptions] = useState([
    { id: 1, date: '2026-03-01', plan: 'Business', amount: 1200, stores: 1, method: 'Wallet', status: 'Paid', invoice: 'INV-2026-003' },
    { id: 2, date: '2026-02-01', plan: 'Business', amount: 1200, stores: 1, method: 'Wallet', status: 'Paid', invoice: 'INV-2026-002' },
    { id: 3, date: '2026-01-01', plan: 'Starter', amount: 300, stores: 1, method: 'Mobile Money', status: 'Paid', invoice: 'INV-2026-001' },
  ])

  const quickAmounts = [100, 500, 1000, 2000]

  const handleCreateWallet = (e) => {
    e.preventDefault()
    setWalletCreated(true)
  }

  const handleLoadWallet = (e) => {
    e.preventDefault()
    const amount = parseFloat(loadAmount)
    if (amount > 0) {
      setBalance((prev) => prev + amount)
      setLoadAmount('')
      setShowLoadForm(false)
      onLoadSuccess?.(amount)
    }
  }

  /* ── Create wallet onboarding ── */
  if (!walletCreated) {
    return (
      <div className="flex flex-1 items-start justify-center pt-4">
        <div className="w-full max-w-lg">
          {/* Onboarding header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: '#FFF3EB' }}>
              <HIcon icon={Wallet02Icon} size={28} style={{ color: '#FF7521' }} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Create Your Wallet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
              Link a payment method to fund your wallet. Your wallet balance is used to pay for your subscription automatically.
            </p>
          </div>

          {/* Wallet form card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
            {/* Type selector */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              {[
                { key: 'momo', icon: SmartPhone01Icon, label: 'Mobile Money', desc: 'MTN, Vodafone, AirtelTigo' },
                { key: 'bank', icon: Building03Icon, label: 'Bank Account', desc: 'Direct debit' },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setWalletType(option.key)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${
                    walletType === option.key
                      ? 'border-transparent bg-orange-50'
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                  }`}
                  style={walletType === option.key ? { borderColor: '#FF7521' } : undefined}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      walletType === option.key ? '' : 'bg-gray-100'
                    }`}
                    style={walletType === option.key ? { backgroundColor: '#FFF3EB' } : undefined}
                  >
                    <HIcon
                      icon={option.icon}
                      size={18}
                      style={{ color: walletType === option.key ? '#FF7521' : '#9CA3AF' }}
                    />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${walletType === option.key ? 'text-gray-900' : 'text-gray-600'}`}>
                      {option.label}
                    </p>
                    <p className="text-[11px] text-gray-400">{option.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <form onSubmit={handleCreateWallet} className="space-y-4">
              {walletType === 'momo' ? (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Provider</label>
                    <select
                      value={momoProvider}
                      onChange={(e) => setMomoProvider(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    >
                      <option value="MTN">MTN Mobile Money</option>
                      <option value="Vodafone">Vodafone Cash</option>
                      <option value="AirtelTigo">AirtelTigo Money</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      placeholder="0241234567"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. GCB Bank"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Account Number</label>
                    <input
                      type="text"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      placeholder="Account number"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg"
                  style={{ backgroundColor: '#FF7521' }}
                >
                  <HIcon icon={Shield01Icon} size={14} />
                  Create Secure Wallet
                </button>
                <p className="mt-3 text-center text-[11px] text-gray-400">
                  <HIcon icon={LockIcon} size={10} className="mr-1 inline" />
                  Your payment details are encrypted and secure
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  /* ── Wallet dashboard ── */
  return (
    <div className="space-y-6">
      {/* Balance + Quick stats row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main balance card */}
        <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 sm:p-8 text-white">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-400">
                <HIcon icon={Wallet02Icon} size={14} />
                Wallet Balance
              </p>
              <p className="mt-2 text-4xl font-extrabold tracking-tight">
                GHS {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                <HIcon icon={walletType === 'momo' ? SmartPhone01Icon : Building03Icon} size={14} />
                {walletType === 'momo' ? `${momoProvider} · ${momoNumber}` : `${bankName} · ${bankAccount}`}
              </p>
            </div>
            <button
              onClick={() => setShowLoadForm(!showLoadForm)}
              className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-gray-900 transition-all hover:opacity-90 shadow-sm"
              style={{ backgroundColor: '#FF7521', color: '#fff' }}
            >
              <HIcon icon={Add01Icon} size={14} />
              Load Wallet
            </button>
          </div>

          {/* Load form */}
          {showLoadForm && (
            <div className="mt-6 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="mb-3 text-xs font-semibold text-gray-300">Quick load amount</p>
              <div className="mb-3 grid grid-cols-4 gap-2">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setLoadAmount(String(amt))}
                    className={`rounded-lg py-2 text-xs font-bold transition-all ${
                      loadAmount === String(amt)
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    GHS {amt.toLocaleString()}
                  </button>
                ))}
              </div>
              <form onSubmit={handleLoadWallet} className="flex gap-3">
                <input
                  type="number"
                  value={loadAmount}
                  onChange={(e) => setLoadAmount(e.target.value)}
                  placeholder="Or enter custom amount"
                  min="1"
                  required
                  className="flex-1 rounded-xl border-0 bg-white/10 px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <button
                  type="submit"
                  className="rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#059669' }}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => { setShowLoadForm(false); setLoadAmount('') }}
                  className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20"
                >
                  Cancel
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="flex flex-col gap-4">
          <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: '#ecfdf3' }}>
                <HIcon icon={ArrowMoveUpRightIcon} size={16} style={{ color: '#059669' }} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">Total Loaded</p>
                <p className="text-lg font-bold text-gray-900">GHS 5,100.00</p>
              </div>
            </div>
          </div>
          <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: '#FFF3EB' }}>
                <HIcon icon={ReceiptDollarIcon} size={16} style={{ color: '#FF7521' }} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">Total Spent</p>
                <p className="text-lg font-bold text-gray-900">GHS 2,700.00</p>
              </div>
            </div>
          </div>
          <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <HIcon icon={CalendarCheckIn01Icon} size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">Next Payment</p>
                <p className="text-lg font-bold text-gray-900">Apr 30</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment history */}
      <div className="rounded-2xl border border-gray-100 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 sm:px-8">
          <div>
            <h3 className="font-bold text-gray-900">Payment History</h3>
            <p className="mt-0.5 text-xs text-gray-400">All subscription payments and wallet transactions</p>
          </div>
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50">
            <HIcon icon={Download01Icon} size={14} className="text-gray-400" />
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 sm:px-8">Date</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 sm:px-8">Invoice</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Plan</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Method</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 sm:px-8">Amount</th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-gray-400 sm:px-8">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center sm:px-8">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                        <HIcon icon={ReceiptDollarIcon} size={18} className="text-gray-300" />
                      </div>
                      <p className="text-sm font-medium text-gray-400">No payments yet</p>
                      <p className="text-xs text-gray-300">Payment history will appear here</p>
                    </div>
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="transition-colors hover:bg-gray-50/60">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 sm:px-8">
                      {new Date(sub.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 sm:px-8">
                      <span className="text-xs font-mono font-medium text-gray-500">{sub.invoice}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                        <HIcon icon={Tag01Icon} size={10} className="text-gray-400" />
                        {sub.plan}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">{sub.method}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right font-semibold text-gray-900 sm:px-8">
                      GHS {sub.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center sm:px-8">
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: '#ecfdf3', color: '#047857' }}>
                        <HIcon icon={CheckmarkCircle02Icon} size={10} />
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Billing Page ─── */
const Billing = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('plan')

  const handleSubscribe = (planName, amount) => {
    navigate('/payment-success', { state: { planName, amount } })
  }

  const handleLoadSuccess = (amount) => {
    navigate('/payment-success', { state: { amount } })
  }

  const tabs = [
    { id: 'plan', label: 'Billing Plan', icon: Tag01Icon },
    { id: 'wallet', label: 'Wallet', icon: Wallet02Icon },
  ]

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gray-50/50">
      {/* Page header */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-6 py-5 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Billing & Subscription</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your plan, wallet, and payment history</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <HIcon icon={tab.icon} size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content area — scrollable, fills remaining space */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-6xl px-6 py-8 sm:px-8 lg:px-10">
          {activeTab === 'plan' ? <BillingPlanTab onSubscribe={handleSubscribe} /> : <WalletTab onLoadSuccess={handleLoadSuccess} />}
        </div>
      </div>
    </div>
  )
}

export default Billing
