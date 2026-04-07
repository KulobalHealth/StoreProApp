import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { HIcon } from '../components/HIcon'
import { CheckmarkCircle02Icon, ShoppingBag01Icon, DashboardSpeed02Icon, ReceiptTextIcon, ArrowLeft01Icon } from '@hugeicons/core-free-icons'

const PosSuccess = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const transaction = location.state

  // If no transaction data, redirect back to POS
  if (!transaction) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <HIcon icon={ReceiptTextIcon} size={28} className="text-gray-400" />
        <div>
          <h2 className="text-lg font-bold text-gray-900">No Transaction Found</h2>
          <p className="mt-1 text-sm text-gray-500">There's no recent transaction to display.</p>
        </div>
        <button
          onClick={() => navigate('/pos')}
          className="mt-2 flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#FF7521' }}
        >
          <HIcon icon={ArrowLeft01Icon} size={16} />
          Go to POS
        </button>
      </div>
    )
  }

  const itemCount = (transaction.items || []).length
  const totalQty = (transaction.items || []).reduce((sum, item) => sum + item.qty, 0)

  return (
    <div className="flex h-full items-center justify-center overflow-auto p-4">
      <div className="w-full max-w-md bg-white px-8 py-10 text-center">
        {/* Check icon */}
        <div
          className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: '#ecfdf3' }}
        >
          <HIcon icon={CheckmarkCircle02Icon} size={44} style={{ color: '#059669' }} />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-extrabold text-gray-900">Sale Complete!</h1>
        <p className="mt-1 text-sm text-gray-500">
          Transaction {transaction.action || 'completed'} successfully
        </p>

        {/* Total */}
        <p className="mt-6 text-4xl font-extrabold" style={{ color: '#059669' }}>
          ₵{(transaction.total || 0).toFixed(2)}
        </p>
        {(transaction.change || 0) > 0 && (
          <p className="mt-1 text-sm text-gray-500">
            Change: <span className="font-bold" style={{ color: '#FF7521' }}>₵{(transaction.change || 0).toFixed(2)}</span>
          </p>
        )}

        {/* Details */}
        <div className="mx-auto mt-6 max-w-xs space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Receipt</span>
            <span className="font-mono text-xs font-bold text-gray-900">{transaction.receiptNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Payment</span>
            <span className="font-semibold capitalize text-gray-700">{transaction.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Items</span>
            <span className="font-semibold text-gray-700">{itemCount} {itemCount === 1 ? 'product' : 'products'} · {totalQty} qty</span>
          </div>
          {transaction.cashier && (
            <div className="flex justify-between">
              <span className="text-gray-400">Cashier</span>
              <span className="font-semibold text-gray-700">{transaction.cashier}</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col gap-2.5">
          <button
            onClick={() => navigate('/pos')}
            className="flex w-full items-center justify-center gap-2 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#FF7521' }}
          >
            <HIcon icon={ShoppingBag01Icon} size={18} />
            Start New Sale
          </button>
          <button
            onClick={() => navigate('/branch-dashboard')}
            className="flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          >
            <HIcon icon={DashboardSpeed02Icon} size={16} />
            Go to Dashboard
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          A copy of this transaction has been saved to your sales history.
        </p>
      </div>
    </div>
  )
}

export default PosSuccess
