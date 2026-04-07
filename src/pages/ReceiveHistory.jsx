import React, { useEffect, useMemo, useState } from 'react'
import { HIcon } from '../components/HIcon'
import {
  Calendar02Icon,
  CheckListIcon,
  DeliveryTruck01Icon,
  Loading03Icon,
  Package01Icon,
  RefreshIcon,
  Search01Icon,
} from '@hugeicons/core-free-icons'
import { getReceipt, listReceipts } from '../api/awoselDb.js'
import { getSessionBranchId } from '../utils/branch.js'

const extractReceiptList = (response) => {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.stockReceipts)) return response.stockReceipts
  if (Array.isArray(response?.stock_receipts)) return response.stock_receipts
  if (Array.isArray(response?.receipts)) return response.receipts
  return []
}

const extractReceipt = (response) => {
  if (!response) return null
  return response?.data || response?.stockReceipt || response?.stock_receipt || response?.receipt || response
}

const normalizeReceiptId = (receipt) => (
  receipt?.uuid || receipt?.id || receipt?.stock_receipt_id || receipt?.stockReceiptId || null
)

const normalizeReceiptItems = (receipt) => {
  const rawItems = Array.isArray(receipt?.items)
    ? receipt.items
    : Array.isArray(receipt?.receipt_items)
      ? receipt.receipt_items
      : Array.isArray(receipt?.receiptItems)
        ? receipt.receiptItems
        : []

  return rawItems.map((item) => ({
    id: item?.uuid || item?.id || item?.product_id || item?.productId,
    name: item?.product_name || item?.productName || item?.name || item?.product?.name || 'Unnamed item',
    quantity: Number(item?.quantity) || 0,
    unitCost: Number(item?.unit_cost ?? item?.unitCost) || 0,
    totalCost: Number(item?.total_cost ?? item?.totalCost) || ((Number(item?.quantity) || 0) * (Number(item?.unit_cost ?? item?.unitCost) || 0)),
  }))
}

const normalizeReceipt = (receipt) => {
  const items = normalizeReceiptItems(receipt)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0) || items.length || Number(receipt?.item_count) || 0
  const totalCost = Number(receipt?.total_cost ?? receipt?.totalCost ?? receipt?.total_amount ?? receipt?.totalAmount)
    || items.reduce((sum, item) => sum + item.totalCost, 0)
  const status = String(receipt?.status || receipt?.receipt_status || (receipt?.received_at || receipt?.receivedAt ? 'received' : 'pending')).toLowerCase()

  return {
    id: normalizeReceiptId(receipt),
    receiptNumber: receipt?.receipt_number || receipt?.receiptNumber || receipt?.po_number || receipt?.poNumber || `RCV-${receipt?.id || receipt?.uuid || '—'}`,
    supplierName: receipt?.supplier_name || receipt?.supplierName || receipt?.supplier?.name || receipt?.supplier || 'Unknown supplier',
    status,
    receivedAt: receipt?.received_at || receipt?.receivedAt || receipt?.received_date || receipt?.receivedDate || '',
    createdAt: receipt?.created_at || receipt?.createdAt || receipt?.date || '',
    items,
    itemCount,
    totalCost,
  }
}

const ReceiveHistory = () => {
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const branchId = getSessionBranchId()

  const loadReceipts = async ({ silent = false } = {}) => {
    if (!branchId) {
      setError('No active branch selected.')
      setLoading(false)
      return
    }

    if (silent) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError('')

    try {
      const receiptsResponse = await listReceipts(branchId)
      const receiptSummaries = extractReceiptList(receiptsResponse)
      const detailedReceipts = await Promise.all(
        receiptSummaries.map(async (receiptSummary) => {
          const receiptId = normalizeReceiptId(receiptSummary)
          if (!receiptId) return normalizeReceipt(receiptSummary)

          try {
            const receiptDetailResponse = await getReceipt(receiptId)
            const receiptDetail = extractReceipt(receiptDetailResponse)
            return normalizeReceipt({ ...receiptSummary, ...receiptDetail })
          } catch {
            return normalizeReceipt(receiptSummary)
          }
        })
      )

      const allReceipts = detailedReceipts
        .filter((receipt) => receipt.id)

      allReceipts.sort((left, right) => new Date(right.receivedAt || right.createdAt || 0) - new Date(left.receivedAt || left.createdAt || 0))
      setReceipts(allReceipts)
    } catch (err) {
      setError(err.message || 'Failed to load receive history.')
      setReceipts([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadReceipts()
  }, [branchId])

  const filteredReceipts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return receipts

    return receipts.filter((receipt) => (
      receipt.receiptNumber.toLowerCase().includes(query)
      || receipt.supplierName.toLowerCase().includes(query)
      || receipt.status.toLowerCase().includes(query)
    ))
  }, [receipts, searchTerm])

  const receivedCount = filteredReceipts.filter((receipt) => receipt.status === 'received').length
  const pendingCount = filteredReceipts.filter((receipt) => receipt.status !== 'received').length
  const totalUnits = filteredReceipts.reduce((sum, receipt) => sum + receipt.itemCount, 0)
  const totalValue = filteredReceipts.reduce((sum, receipt) => sum + (Number(receipt.totalCost) || 0), 0)

  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500 text-white">
                <HIcon icon={CheckListIcon} size={20}  />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">Receive History</h1>
                <p className="text-xs text-gray-500">Review stock receipts that are received or still waiting to be accepted.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => loadReceipts({ silent: true })}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              <HIcon icon={RefreshIcon} size={16} className={refreshing ? 'animate-spin' : ''}  />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total receipts</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{filteredReceipts.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Waiting acceptance</p>
            <p className="mt-2 text-2xl font-bold text-amber-600">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Received receipts</p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">{receivedCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Units in history</p>
            <p className="mt-2 text-2xl font-bold text-primary-600">{totalUnits}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Receipt value</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">₵{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="relative">
            <HIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}  />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by receipt number, supplier, or status..."
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center px-6 py-12 text-sm text-gray-500">
              <HIcon icon={Loading03Icon} size={18} className="mr-2 animate-spin"  />
              Loading receive history...
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center text-sm text-red-600">{error}</div>
          ) : filteredReceipts.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-500">
              No stock receipts found for this branch.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Receipt</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Supplier</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Items Received</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredReceipts.map((receipt) => (
                    <tr key={receipt.id} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{receipt.receiptNumber}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-2 text-sm text-gray-700">
                          <HIcon icon={DeliveryTruck01Icon} size={15} className="text-gray-400"  />
                          {receipt.supplierName}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          receipt.status === 'received'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {receipt.status === 'received' ? 'Received' : 'Waiting acceptance'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="inline-flex items-center gap-2">
                          <HIcon icon={Calendar02Icon} size={15} className="text-gray-400"  />
                          {receipt.receivedAt || receipt.createdAt
                            ? new Date(receipt.receivedAt || receipt.createdAt).toLocaleString()
                            : '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex items-start gap-2">
                          <HIcon icon={Package01Icon} size={15} className="text-gray-400 mt-0.5 shrink-0"  />
                          <div>
                            <p className="font-medium text-gray-900">{receipt.itemCount} unit{receipt.itemCount === 1 ? '' : 's'}</p>
                            {receipt.items.length > 0 ? (
                              <p className="mt-1 text-xs text-gray-500">
                                {receipt.items
                                  .slice(0, 3)
                                  .map((item) => `${item.name} (${item.quantity})`)
                                  .join(', ')}
                                {receipt.items.length > 3 ? ` and ${receipt.items.length - 3} more` : ''}
                              </p>
                            ) : (
                              <p className="mt-1 text-xs text-gray-400">Item details not returned in list response.</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        ₵{Number(receipt.totalCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReceiveHistory