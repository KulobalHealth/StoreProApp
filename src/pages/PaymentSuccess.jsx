import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { HIcon } from '../components/HIcon'
import { CheckmarkCircle02Icon, Tag01Icon } from '@hugeicons/core-free-icons'

const PaymentSuccess = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { planName, amount } = location.state || {}

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
          {amount
            ? `Your payment of GHS ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} has been processed.`
            : 'Your payment has been processed successfully.'}
        </p>

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
