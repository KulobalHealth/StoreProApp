import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HIcon } from '../components/HIcon'
import {
  Add01Icon,
  ArrowLeft01Icon,
  Cancel02Icon,
  CheckmarkCircle02Icon,
  FileValidationIcon,
  Loading03Icon,
  MinusSignIcon,
  Package01Icon,
  RotateLeft01Icon,
  Search01Icon,
  Tick01Icon,
} from '@hugeicons/core-free-icons'
import { listProductsByBranch, listSales, updateProduct } from '../api/awoselDb.js'
import { getSessionBranchId } from '../utils/branch'

const extractList = (response, keys = []) => {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key]
  }
  return []
}

const ReturnItems = () => {
  const navigate = useNavigate()
  const [receiptNumber, setReceiptNumber] = useState('')
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0])
  const [reason, setReason] = useState('')
  const [returning, setReturning] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [fetching, setFetching] = useState(false)
  const [sale, setSale] = useState(null)
  const [saleItems, setSaleItems] = useState([])

  const reasons = ['Customer Return', 'Damaged Goods', 'Wrong Item Sold', 'Expired Product Swap', 'Supplier Return', 'Stock Adjustment', 'Other']

  const handleFetchSale = async () => {
    setError('')
    if (!receiptNumber.trim()) {
      setError('Please enter a receipt number')
      return
    }

    try {
      setFetching(true)
      const branchId = getSessionBranchId()
      const query = { branch_id: branchId }
      if (returnDate) query.date = returnDate

      const res = await listSales(query)
      const sales = extractList(res, ['sales'])
      const match = sales.find((item) => (
        (item.receipt_number || '').toLowerCase() === receiptNumber.trim().toLowerCase()
      ))

      if (!match) {
        setError(`No sale found with receipt number "${receiptNumber.trim()}". Try a different date.`)
        setSale(null)
        setSaleItems([])
        return
      }

      setSale(match)
      const items = (match.items || match.sale_items || []).map((item, index) => ({
        index,
        productId: item.product_id || item.productId || '',
        productName: item.product_name || item.name || 'Unknown Item',
        quantitySold: Number(item.quantity_sold || item.quantity || 0),
        unitPrice: Number(item.unit_price || item.price || 0),
        unit: item.unit_name || item.unit || '—',
        returnQty: 0,
        checked: false,
      }))
      setSaleItems(items)
    } catch (err) {
      setError(err.message || 'Failed to fetch sale')
      setSale(null)
      setSaleItems([])
    } finally {
      setFetching(false)
    }
  }

  const toggleItem = (index) => {
    setSaleItems((prev) => prev.map((item, i) => (
      i === index
        ? { ...item, checked: !item.checked, returnQty: !item.checked ? (item.returnQty || item.quantitySold) : 0 }
        : item
    )))
  }

  const updateReturnQty = (index, qty) => {
    setSaleItems((prev) => prev.map((item, i) => (
      i === index ? { ...item, returnQty: Math.min(Math.max(0, qty), item.quantitySold) } : item
    )))
  }

  const selectedItems = saleItems.filter((item) => item.checked && item.returnQty > 0)
  const totalReturnItems = selectedItems.reduce((sum, item) => sum + item.returnQty, 0)

  const handleSubmit = async (event) => {
    if (event) event.preventDefault()
    setError('')

    if (selectedItems.length === 0) {
      setError('Please select at least one item to return')
      return
    }

    if (!reason) {
      setError('Please select a reason for the return')
      return
    }

    try {
      setReturning(true)
      const branchId = getSessionBranchId()
      const productsResponse = await listProductsByBranch(branchId)
      const products = extractList(productsResponse, ['products'])

      for (const item of selectedItems) {
        if (!item.productId || item.returnQty <= 0) continue
        const product = products.find((productItem) => (
          (productItem.uuid || productItem.id) === item.productId
          || String(productItem.id) === String(item.productId)
        ))
        if (!product) continue

        const newStock = (Number(product.quantity ?? product.stock) || 0) + Number(item.returnQty)
        await updateProduct(product.uuid || product.id, { quantity: newStock })
      }

      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Failed to process return')
    } finally {
      setReturning(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-full bg-surface-page p-4 sm:p-6">
        <div className="mx-auto w-full max-w-3xl rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-green-50 px-6 py-8 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <HIcon icon={CheckmarkCircle02Icon} size={28} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Return Processed</h2>
            <p className="text-sm text-gray-600 mt-2 text-center">
              <span className="font-semibold">{totalReturnItems}</span> item{totalReturnItems !== 1 ? 's' : ''} returned to inventory.
            </p>
            <div className="mt-3 w-full max-w-xs space-y-1">
              {selectedItems.map((item, index) => (
                <div key={index} className="flex justify-between text-xs text-gray-600">
                  <span className="truncate">{item.productName}</span>
                  <span className="font-semibold text-gray-800 ml-2 shrink-0">×{item.returnQty}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
              <span>Receipt: <span className="font-semibold text-gray-700">{receiptNumber}</span></span>
              <span>·</span>
              <span>Reason: <span className="font-semibold text-gray-700">{reason}</span></span>
            </div>
          </div>
          <div className="px-6 py-4 flex justify-end bg-gray-50 border-t">
            <button
              onClick={() => navigate('/inventory')}
              className="bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors text-sm flex items-center gap-2"
            >
              <HIcon icon={Tick01Icon} size={16} />
              Done
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-surface-page p-4 sm:p-6 space-y-4">
      {returning && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4 shadow-2xl">
            <HIcon icon={Loading03Icon} size={48} className="animate-spin text-orange-500" />
            <p className="text-lg font-semibold text-gray-800">Processing Return...</p>
            <p className="text-sm text-gray-500">Please wait, do not close this page.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <HIcon icon={ArrowLeft01Icon} size={16} />
            Back
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Return Item</h1>
            <p className="text-xs text-gray-500 mt-0.5">Look up a sale and select items to return</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl w-full max-w-6xl border border-gray-200 flex flex-col shadow-sm">
        <div className="flex-1 overflow-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <HIcon icon={Cancel02Icon} size={16} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <HIcon icon={Search01Icon} size={15} className="text-gray-500" />
              Look Up Sale
            </h3>
            <div className="flex flex-col sm:flex-row items-end gap-3">
              <div className="flex-1 w-full">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Receipt Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={receiptNumber}
                  onChange={(e) => {
                    setReceiptNumber(e.target.value)
                    if (sale) {
                      setSale(null)
                      setSaleItems([])
                    }
                  }}
                  placeholder="Enter receipt number..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div className="w-full sm:w-44">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Sale Date</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => {
                    setReturnDate(e.target.value)
                    if (sale) {
                      setSale(null)
                      setSaleItems([])
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <button
                type="button"
                onClick={handleFetchSale}
                disabled={fetching || !receiptNumber.trim()}
                className="w-full sm:w-auto px-5 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shrink-0"
              >
                {fetching ? <HIcon icon={Loading03Icon} size={16} className="animate-spin" /> : <HIcon icon={Search01Icon} size={16} />}
                {fetching ? 'Searching...' : 'Fetch Sale'}
              </button>
            </div>
          </div>

          {sale && (
            <>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                  <div>
                    <span className="text-gray-500">Receipt:</span>{' '}
                    <span className="font-semibold text-gray-900">{sale.receipt_number || '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>{' '}
                    <span className="font-semibold text-gray-900">{sale.created_at ? new Date(sale.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Total:</span>{' '}
                    <span className="font-semibold text-gray-900">₵{(Number(sale.total) || 0).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Payment:</span>{' '}
                    <span className="font-semibold text-gray-900">{sale.payment_method || '—'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Select items to return</h3>
                {saleItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <HIcon icon={Package01Icon} size={36} className="mx-auto mb-2 text-gray-300" />
                    No line items found in this sale.
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="w-10 px-3 py-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={saleItems.length > 0 && saleItems.every((item) => item.checked)}
                              onChange={() => {
                                const allChecked = saleItems.every((item) => item.checked)
                                setSaleItems((prev) => prev.map((item) => ({ ...item, checked: !allChecked, returnQty: !allChecked ? item.quantitySold : 0 })))
                              }}
                              className="rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                            />
                          </th>
                          <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Product</th>
                          <th className="px-3 py-2.5 text-right font-semibold text-gray-600">Sold</th>
                          <th className="px-3 py-2.5 text-right font-semibold text-gray-600">Unit Price</th>
                          <th className="px-3 py-2.5 text-center font-semibold text-gray-600 w-28">Return Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {saleItems.map((item, index) => (
                          <tr
                            key={index}
                            className={`border-b border-gray-100 last:border-b-0 transition-colors ${
                              item.checked ? 'bg-orange-50/60' : 'hover:bg-gray-50'
                            }`}
                          >
                            <td className="px-3 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={() => toggleItem(index)}
                                className="rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                              />
                            </td>
                            <td className="px-3 py-3">
                              <p className="font-medium text-gray-900">{item.productName}</p>
                              {item.unit !== '—' && <p className="text-xs text-gray-500">{item.unit}</p>}
                            </td>
                            <td className="px-3 py-3 text-right text-gray-700 font-medium">{item.quantitySold}</td>
                            <td className="px-3 py-3 text-right text-gray-600">₵{item.unitPrice.toFixed(2)}</td>
                            <td className="px-3 py-3">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => updateReturnQty(index, item.returnQty - 1)}
                                  disabled={!item.checked || item.returnQty <= 0}
                                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <HIcon icon={MinusSignIcon} size={14} />
                                </button>
                                <input
                                  type="number"
                                  min={0}
                                  max={item.quantitySold}
                                  value={item.checked ? item.returnQty : 0}
                                  onChange={(e) => updateReturnQty(index, parseInt(e.target.value, 10) || 0)}
                                  disabled={!item.checked}
                                  className="w-14 text-center px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-100 disabled:text-gray-400"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateReturnQty(index, item.returnQty + 1)}
                                  disabled={!item.checked || item.returnQty >= item.quantitySold}
                                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <HIcon icon={Add01Icon} size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Return Reason <span className="text-red-500">*</span></label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                >
                  <option value="">Select a reason...</option>
                  {reasons.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>

              {selectedItems.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{selectedItems.length}</span> item{selectedItems.length !== 1 ? 's' : ''} selected · <span className="font-semibold text-gray-900">{totalReturnItems}</span> total units
                  </div>
                  <div className="text-sm font-bold text-orange-600">
                    Refund: ₵{selectedItems.reduce((sum, item) => sum + item.returnQty * item.unitPrice, 0).toFixed(2)}
                  </div>
                </div>
              )}
            </>
          )}

          {!sale && !fetching && (
            <div className="text-center py-10 text-gray-400">
              <HIcon icon={FileValidationIcon} size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Enter a receipt number above and click <span className="font-semibold text-gray-600">"Fetch Sale"</span> to look up the transaction.</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="bg-white border border-gray-200 text-gray-700 px-5 py-2 rounded-lg font-medium hover:bg-gray-50 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={returning || selectedItems.length === 0}
            className="bg-orange-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-2"
          >
            <HIcon icon={RotateLeft01Icon} size={16} />
            Process Return ({totalReturnItems})
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReturnItems
