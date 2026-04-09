import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { HIcon } from '../components/HIcon'
import { CheckmarkCircle02Icon, Loading03Icon, Tag01Icon } from '@hugeicons/core-free-icons'
import { verifyPayment } from '../api/awoselDb'

const getFirstFiniteNumber = (...values) => {
  for (const value of values) {
    const numberValue = Number(value)
    if (Number.isFinite(numberValue)) return numberValue
  }
  return null
}

const PaymentSuccess = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { planName, amount, reference: stateReference } = location.state || {}
  const [verifying, setVerifying] = useState(false)
  const [verificationDone, setVerificationDone] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [verifiedAmount, setVerifiedAmount] = useState(null)
  const [verifiedReference, setVerifiedReference] = useState('')

  const paymentReference = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return (
      params.get('reference')
      || params.get('trxref')
      || params.get('paystack_reference')
      || stateReference
      || localStorage.getItem('awosel_last_payment_reference')
      || ''
    )
  }, [location.search, stateReference])

  useEffect(() => {
    let cancelled = false

    const runVerification = async () => {
      if (!paymentReference) {
        if (!cancelled) setVerificationDone(true)
        return
      }

      try {
        setVerifying(true)
        setVerifyError('')
        const res = await verifyPayment({ reference: paymentReference })
        const data = res?.data || {}
        const paidAmount = getFirstFiniteNumber(
          data?.amount_paid,
          data?.paid_amount,
          data?.amount,
          data?.payment?.amount_paid,
          data?.payment?.paid_amount,
          data?.payment?.amount,
          res?.amount,
        )
        const responseReference = data?.reference
          || data?.paystack_reference
          || data?.payment?.reference
          || data?.payment?.paystack_reference
          || paymentReference
        if (!cancelled) {
          setVerifiedReference(responseReference)
          if (paidAmount !== null) {
            setVerifiedAmount(paidAmount)
            localStorage.setItem('awosel_wallet_created', 'true')
          }
          localStorage.removeItem('awosel_last_payment_reference')
        }
      } catch (err) {
        if (!cancelled) {
          setVerifyError(err.message || 'Could not verify payment yet.')
        }
      } finally {
        if (!cancelled) {
          setVerifying(false)
          setVerificationDone(true)
        }
      }
    }

    runVerification()
    return () => { cancelled = true }
  }, [paymentReference])

  const displayAmount = verifiedAmount ?? getFirstFiniteNumber(amount)

  if (!verificationDone || verifying) {
    return (
      <div className="flex min-h-full items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
            <HIcon icon={Loading03Icon} size={24} className="animate-spin text-primary-600" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">Verifying payment</h1>
          <p className="mt-1 text-sm text-gray-500">Please wait while we confirm your transaction.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm text-center">
        {/* Check icon */}
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: '#ecfdf3' }}
        >
          <HIcon icon={CheckmarkCircle02Icon} size={36} style={{ color: '#059669' }} />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900">Payment Successful</h1>
        <p className="mt-2 text-sm text-gray-500">
          {displayAmount !== null
            ? `Your payment of GHS ${displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} has been processed.`
            : 'Your payment has been processed successfully.'}
        </p>

        {verifiedReference && (
          <p className="mt-2 text-[11px] text-gray-400">Reference: {verifiedReference}</p>
        )}

        {verifyError && (
          <p className="mt-2 text-xs text-amber-600">{verifyError}</p>
        )}

        {planName && (
          <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-gray-100 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
            <HIcon icon={Tag01Icon} size={14} className="text-gray-400" />
            {planName} Plan
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => navigate('/branch-dashboard')}
          className="mt-8 w-full rounded-xl py-3 text-sm font-bold text-white transition-all hover:opacity-90 shadow-md"
          style={{ backgroundColor: '#FF7521' }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}

export default PaymentSuccess
