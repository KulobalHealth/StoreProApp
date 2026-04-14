import React, { useEffect, useMemo, useState } from 'react'
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
import { getWallet, initiatePayment, listPayments } from '../api/awoselDb'
import { getSessionOrgId } from '../utils/branch'

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

  const handleContactSales = () => {
    const subject = encodeURIComponent('StorePro Billing Inquiry')
    const body = encodeURIComponent('Hi Sales Team,\n\nI need help choosing the right plan for my business.\n\nThanks.')
    window.location.href = `mailto:support@dataleaptech.com?subject=${subject}&body=${body}`
  }

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
      <div className="grid gap-4 lg:grid-cols-2">
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

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                {/* Plan header */}
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: plan.iconBg }}>
                    <HIcon icon={plan.icon} size={18} style={{ color: plan.iconColor }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="mt-0.5 text-sm text-gray-500">{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold tracking-tight text-gray-900">
                    GHS {price.toLocaleString()}
                  </span>
                  <span className="text-sm font-medium text-gray-400">/ {period}</span>
                </div>
                <p className="mt-1 text-xs text-gray-400">per store · billed {billingCycle}</p>

                {/* Divider */}
                <div className="my-4 h-px bg-gray-100" />

                {/* Features */}
                <div className="mb-5 flex-1">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">What's included</p>
                  <ul className="space-y-2">
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
                  className={`w-full rounded-lg py-2.5 text-sm font-bold transition-all ${
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
          <button
            type="button"
            onClick={handleContactSales}
            className="shrink-0 rounded-xl border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
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
  const [walletLoading, setWalletLoading] = useState(true)
  const [walletError, setWalletError] = useState('')
  const [walletCreated, setWalletCreated] = useState(() => localStorage.getItem('awosel_wallet_created') === 'true')
  const [walletType, setWalletType] = useState('paystack')
  const [network, setNetwork] = useState('MTN')
  const [offlinePaymentType, setOfflinePaymentType] = useState('OFFLINE_MOBILE_PAYMENT')
  const [setupAmount, setSetupAmount] = useState('')
  const [offlineProofFile, setOfflineProofFile] = useState(null)
  const [setupError, setSetupError] = useState('')
  const [setupSubmitting, setSetupSubmitting] = useState(false)
  const [balance, setBalance] = useState(2400)
  const [loadAmount, setLoadAmount] = useState('')
  const [showLoadForm, setShowLoadForm] = useState(false)
  const [topUpSubmitting, setTopUpSubmitting] = useState(false)
  const [topUpError, setTopUpError] = useState('')

  const [payments, setPayments] = useState([])

  const extractList = (response, keys = []) => {
    if (Array.isArray(response)) return response
    if (Array.isArray(response?.data)) return response.data
    for (const key of keys) {
      if (Array.isArray(response?.[key])) return response[key]
      if (Array.isArray(response?.data?.[key])) return response.data[key]
    }
    return []
  }

  const pickWalletData = (response) => {
    if (!response) return null
    if (response?.data && !Array.isArray(response.data)) return response.data
    if (response?.wallet && !Array.isArray(response.wallet)) return response.wallet
    if (!Array.isArray(response)) return response
    return null
  }

  useEffect(() => {
    let cancelled = false

    const loadWalletData = async () => {
      try {
        setWalletLoading(true)
        setWalletError('')
        const [walletResponse, paymentsResponse] = await Promise.all([
          getWallet(),
          listPayments(),
        ])

        const walletData = pickWalletData(walletResponse)
        const paymentsData = extractList(paymentsResponse, ['payments', 'items'])

        if (cancelled) return

        setPayments(paymentsData)

        const walletBalance = Number(
          walletData?.balance
          ?? walletData?.wallet_balance
          ?? walletData?.available_balance
          ?? 0
        )
        if (Number.isFinite(walletBalance)) {
          setBalance(walletBalance)
        }

        const walletPaymentType = String(walletData?.payment_type || walletData?.default_payment_type || '').toUpperCase()
        if (walletPaymentType === 'PAYSTACK') {
          setWalletType('paystack')
        } else if (walletPaymentType === 'OFFLINE_MOBILE_PAYMENT' || walletPaymentType === 'BANK_PAYMENT') {
          setWalletType('offline')
          setOfflinePaymentType(walletPaymentType)
        }

        if (walletData?.network) {
          setNetwork(walletData.network)
        }

        const walletExists = Boolean(
          walletData && (
            walletData?.id
            || walletData?.publicId
            || walletData?.public_id
            || walletData?.wallet_id
            || walletData?.balance != null
            || walletData?.wallet_balance != null
            || walletData?.available_balance != null
          )
        )

        if (walletExists) {
          setWalletCreated(true)
          localStorage.setItem('awosel_wallet_created', 'true')
        }
      } catch (err) {
        if (!cancelled) {
          setWalletError(err.message || 'Could not load wallet information.')
        }
      } finally {
        if (!cancelled) {
          setWalletLoading(false)
        }
      }
    }

    loadWalletData()
    return () => { cancelled = true }
  }, [])

  const totals = useMemo(() => {
    const normalizeStatus = (status) => String(status || '').toUpperCase()
    const normalizeType = (type) => String(type || '').toUpperCase()

    const successfulPayments = payments.filter((payment) => {
      const status = normalizeStatus(payment.status)
      return status === 'PAID' || status === 'SUCCESS' || status === 'COMPLETED'
    })

    const totalLoaded = successfulPayments
      .filter((payment) => normalizeType(payment.transaction_type || payment.type) === 'CREDIT')
      .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0)

    const totalSpent = successfulPayments
      .filter((payment) => normalizeType(payment.transaction_type || payment.type) === 'DEBIT')
      .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0)

    const nextPending = payments.find((payment) => normalizeStatus(payment.status).includes('AWAITING'))

    return {
      totalLoaded,
      totalSpent,
      nextPendingDate: nextPending?.created_at || nextPending?.date || null,
    }
  }, [payments])

  const quickAmounts = [100, 500, 1000, 2000]

  if (walletLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <div className="rounded-2xl border border-gray-100 bg-white px-8 py-6 text-center shadow-sm">
          <p className="text-sm font-medium text-gray-700">Loading wallet...</p>
          <p className="mt-1 text-xs text-gray-500">Fetching wallet info and payment history.</p>
        </div>
      </div>
    )
  }

  const handleCreateWallet = async (e) => {
    e.preventDefault()
    setSetupError('')
    const amount = parseFloat(setupAmount)
    const organizationId = getSessionOrgId()

    if (!Number.isFinite(amount) || amount <= 0) {
      setSetupError('Please enter a valid amount greater than 0.')
      return
    }

    if (!organizationId) {
      setSetupError('Organization ID is missing. Please log in again and retry.')
      return
    }

    if (walletType === 'offline' && !offlineProofFile) {
      setSetupError('Please upload proof of payment for offline payment.')
      return
    }

    try {
      setSetupSubmitting(true)
      const paymentType = walletType === 'paystack' ? 'PAYSTACK' : offlinePaymentType
      const apiAmount = Number(amount.toFixed(2))
      const payload = {
        amount: apiAmount,
        organizationId: String(organizationId),
        payment_type: paymentType,
        network,
        currency: 'GHS',
        proof_file_name: offlineProofFile?.name || null,
      }

      const res = await initiatePayment(payload)
      const paymentData = res?.data || {}
      const paymentReference = paymentData?.reference
        || paymentData?.paystack_reference
        || paymentData?.publicId
        || paymentData?.public_id
        || ''
      const paymentUrl = paymentData?.authorization_url
        || paymentData?.paystack_authorization_url
        || res?.authorization_url
        || res?.paystack_authorization_url
        || ''

      if (walletType === 'paystack') {
        if (!paymentUrl) {
          setSetupError('Payment initialized, but no Paystack URL was returned.')
          return
        }
        if (paymentReference) {
          localStorage.setItem('awosel_last_payment_reference', paymentReference)
        }
        window.location.assign(paymentUrl)
        return
      }

      setWalletCreated(true)
      localStorage.setItem('awosel_wallet_created', 'true')
      setBalance((prev) => prev + amount)
      onLoadSuccess?.(amount)
    } catch (err) {
      setSetupError(err.message || 'Failed to initiate payment.')
    } finally {
      setSetupSubmitting(false)
    }
  }

  const handleLoadWallet = async (e) => {
    e.preventDefault()
    setTopUpError('')
    const amount = parseFloat(loadAmount)
    const organizationId = getSessionOrgId()

    if (!Number.isFinite(amount) || amount <= 0) {
      setTopUpError('Please enter a valid amount greater than 0.')
      return
    }

    if (!organizationId) {
      setTopUpError('Organization ID is missing. Please log in again and retry.')
      return
    }

    try {
      setTopUpSubmitting(true)
      const payload = {
        amount: Number(amount.toFixed(2)),
        organizationId: String(organizationId),
        payment_type: 'PAYSTACK',
        network,
        currency: 'GHS',
      }

      const res = await initiatePayment(payload)
      const paymentData = res?.data || {}
      const paymentReference = paymentData?.reference
        || paymentData?.paystack_reference
        || paymentData?.publicId
        || paymentData?.public_id
        || ''
      const paymentUrl = paymentData?.authorization_url
        || paymentData?.paystack_authorization_url
        || res?.authorization_url
        || res?.paystack_authorization_url
        || ''

      if (!paymentUrl) {
        setTopUpError('Payment initialized, but no Paystack URL was returned.')
        return
      }

      if (paymentReference) {
        localStorage.setItem('awosel_last_payment_reference', paymentReference)
      }

      window.location.assign(paymentUrl)
    } catch (err) {
      setTopUpError(err.message || 'Failed to initiate top-up payment.')
    } finally {
      setTopUpSubmitting(false)
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
            <h2 className="text-xl font-bold text-gray-900">Top Up Your Wallet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
              Initiate wallet funding with Paystack or submit an offline payment with proof.
            </p>
          </div>

          {/* Wallet form card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
            {/* Type selector */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              {[
                { key: 'paystack', icon: SmartPhone01Icon, label: 'Paystack', desc: 'Card, bank transfer, mobile money' },
                { key: 'offline', icon: Building03Icon, label: 'Offline Payment', desc: 'Manual transfer + proof upload' },
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
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Network</label>
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                >
                  <option value="MTN">MTN</option>
                  <option value="Vodafone">Vodafone</option>
                  <option value="AirtelTogo">AirtelTogo</option>
                </select>
              </div>

              {walletType === 'paystack' ? (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Amount</label>
                    <input
                      type="number"
                      value={setupAmount}
                      onChange={(e) => setSetupAmount(e.target.value)}
                      placeholder="e.g. 500"
                      min="1"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Offline Payment Type</label>
                    <select
                      value={offlinePaymentType}
                      onChange={(e) => setOfflinePaymentType(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    >
                      <option value="OFFLINE_MOBILE_PAYMENT">Offline Mobile Payment</option>
                      <option value="BANK_PAYMENT">Bank Payment</option>
                    </select>
                  </div>

                  <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-gray-700">
                    <p className="font-semibold text-gray-900">Offline Payment Instructions</p>
                    <ul className="mt-2 space-y-1 text-xs sm:text-sm">
                      <li><span className="font-semibold">Mobile Money Number:</span> 0535614493</li>
                      <li><span className="font-semibold">Bank Account:</span> 9040013722409</li>
                      <li><span className="font-semibold">Account Name:</span> Data Leap Technologies Ltd</li>
                    </ul>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Amount</label>
                    <input
                      type="number"
                      value={setupAmount}
                      onChange={(e) => setSetupAmount(e.target.value)}
                      placeholder="e.g. 500"
                      min="1"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Upload Proof of Payment</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setOfflineProofFile(e.target.files?.[0] || null)}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 file:mr-3 file:rounded-md file:border-0 file:bg-orange-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-orange-700"
                    />
                    {offlineProofFile && (
                      <p className="mt-1 text-xs text-gray-500">Selected file: {offlineProofFile.name}</p>
                    )}
                  </div>
                </>
              )}

              {setupError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {setupError}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={setupSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg"
                  style={{ backgroundColor: '#FF7521' }}
                >
                  <HIcon icon={Shield01Icon} size={14} />
                  {setupSubmitting ? 'Processing...' : walletType === 'paystack' ? 'Proceed to Paystack' : 'Submit Offline Payment'}
                </button>
                <p className="mt-3 text-center text-[11px] text-gray-400">
                  <HIcon icon={LockIcon} size={10} className="mr-1 inline" />
                  Transactions are initiated via /payments/initiate
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
      {walletError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {walletError}
        </div>
      )}

      {/* Balance + Quick stats row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main balance card */}
        <div className="lg:col-span-2 rounded-[2px] bg-gradient-to-br from-gray-900 to-gray-800 p-6 sm:p-8 text-white">
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
                <HIcon icon={walletType === 'paystack' ? SmartPhone01Icon : Building03Icon} size={14} />
                {walletType === 'paystack' ? 'Paystack enabled' : 'Offline payment enabled'}
              </p>
            </div>
            <button
              onClick={() => setShowLoadForm(!showLoadForm)}
              className="flex items-center gap-2 rounded-[2px] px-5 py-3 text-sm font-bold text-gray-900 transition-all hover:opacity-90 shadow-sm"
              style={{ backgroundColor: '#FF7521', color: '#fff' }}
            >
              <HIcon icon={Add01Icon} size={14} />
              Top Up Wallet
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
                    className={`rounded-[2px] py-2 text-xs font-bold transition-all ${
                      loadAmount === String(amt)
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    GHS {amt.toLocaleString()}
                  </button>
                ))}
              </div>
              {topUpError && (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {topUpError}
                </div>
              )}
              <form onSubmit={handleLoadWallet} className="flex gap-3">
                <input
                  type="number"
                  value={loadAmount}
                  onChange={(e) => setLoadAmount(e.target.value)}
                  placeholder="Or enter custom amount"
                  min="1"
                  required
                  className="flex-1 rounded-[2px] border-0 bg-white/10 px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <button
                  type="submit"
                  disabled={topUpSubmitting}
                  className="rounded-[2px] px-6 py-3 text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#059669' }}
                >
                  {topUpSubmitting ? 'Processing...' : 'Proceed'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowLoadForm(false); setLoadAmount('') }}
                  className="rounded-[2px] bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20"
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
                <p className="text-lg font-bold text-gray-900">GHS {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
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
                <p className="text-lg font-bold text-gray-900">GHS {totals.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
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
                <p className="text-lg font-bold text-gray-900">
                  {totals.nextPendingDate
                    ? new Date(totals.nextPendingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : '—'}
                </p>
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
          <button className="flex items-center gap-2 rounded-[2px] border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50">
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
              {payments.length === 0 ? (
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
                payments.map((payment, index) => {
                  const paymentDate = payment?.created_at || payment?.updated_at || payment?.date
                  const paymentReference = payment?.invoice || payment?.reference || payment?.paystack_reference || payment?.public_id || payment?.publicId || `PMT-${index + 1}`
                  const paymentType = payment?.payment_type || payment?.type || payment?.method || 'Wallet'
                  const paymentStatus = payment?.status || 'Pending'
                  const paymentAmount = Number(payment?.amount) || 0

                  return (
                  <tr key={payment?.id || paymentReference || index} className="transition-colors hover:bg-gray-50/60">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 sm:px-8">
                      {paymentDate
                        ? new Date(paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 sm:px-8">
                      <span className="text-xs font-mono font-medium text-gray-500">{paymentReference}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                        <HIcon icon={Tag01Icon} size={10} className="text-gray-400" />
                        {payment?.plan || 'Wallet Top-up'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">{paymentType}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right font-semibold text-gray-900 sm:px-8">
                      GHS {paymentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center sm:px-8">
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: '#ecfdf3', color: '#047857' }}>
                        <HIcon icon={CheckmarkCircle02Icon} size={10} />
                        {paymentStatus}
                      </span>
                    </td>
                  </tr>
                )})
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
      <div className="shrink-0 border-b border-gray-200 bg-white px-6 py-2.5 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900">Billing & Subscription</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 rounded-md bg-gray-100 p-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <HIcon icon={tab.icon} size={11} />
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
