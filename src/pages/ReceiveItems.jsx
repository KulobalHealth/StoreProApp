import React, { useEffect, useMemo, useState } from 'react'
import { HIcon } from '../components/HIcon'
import {
  Add01Icon,
  Alert02Icon,
  CheckListIcon,
  CheckmarkCircle01Icon,
  Delete01Icon,
  DeliveryTruck01Icon,
  Loading03Icon,
  Package01Icon,
  Search01Icon,
} from '@hugeicons/core-free-icons'
import {
  createReceipt,
  createReceiptBulk,
  deleteReceipt,
  listProductsByBranch,
  listSuppliers,
  receiveReceipt,
} from '../api/awoselDb.js'
import { getSessionBranchId, getSessionOrgId } from '../utils/branch.js'

const extractList = (response, keys = []) => {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key]
  }
  return []
}

const normalizeReceiptId = (receipt) => (
  receipt?.uuid || receipt?.id || receipt?.stock_receipt_id || receipt?.stockReceiptId || null
)

const looksLikeUuid = (value) => (
  typeof value === 'string'
  && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
)

const buildReceiptItems = (items) => items.map((item) => ({
  product_id: item.productId,
  quantity: String(Number(item.quantity) || 0),
  unit_cost: String(Number(item.unitCost) || 0),
  total_cost: String((Number(item.quantity) || 0) * (Number(item.unitCost) || 0)),
}))

const DEFAULT_REQUEST_STEPS = [
  { key: 'create', label: 'Create stock receipt', status: 'idle', message: 'Waiting to start.' },
  { key: 'bulk', label: 'Save selected items', status: 'idle', message: 'Waiting to start.' },
  { key: 'accept', label: 'Accept stock receipt', status: 'idle', message: 'Waiting to start.' },
]

const ReceiveItems = () => {
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSupplierId, setSelectedSupplierId] = useState('')
  const [paymentType, setPaymentType] = useState('credit')
  const [items, setItems] = useState([])
  const [requestSteps, setRequestSteps] = useState(DEFAULT_REQUEST_STEPS)

  const branchId = getSessionBranchId()
  const organizationId = getSessionOrgId()

  useEffect(() => {
    const loadData = async () => {
      if (!branchId) {
        setError('No active branch selected.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const [supplierResponse, productResponse] = await Promise.all([
          listSuppliers(branchId),
          listProductsByBranch(branchId),
        ])

        setSuppliers(extractList(supplierResponse))
        setProducts(extractList(productResponse, ['products']))
      } catch (err) {
        setError(err.message || 'Failed to load suppliers and products.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [branchId])

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return products.slice(0, 12)

    return products.filter((product) => {
      const name = (product.name || '').toLowerCase()
      const sku = (product.sku || '').toLowerCase()
      const barcode = (product.barcode || '').toLowerCase()
      return name.includes(query) || sku.includes(query) || barcode.includes(query)
    }).slice(0, 12)
  }, [products, searchTerm])

  const addItem = (product) => {
    const productId = product.uuid || product.id || product.productId
    if (!productId || items.some((item) => item.productId === productId)) return

    setItems((currentItems) => [
      ...currentItems,
      {
        productId,
        name: product.name || 'Unnamed product',
        sku: product.sku || '',
        quantity: '1',
        unitCost: String(product.cost ?? product.cost_price ?? ''),
      },
    ])
    setSearchTerm('')
    setSuccessMessage('')
  }

  const updateItem = (productId, field, value) => {
    setItems((currentItems) => currentItems.map((item) => (
      item.productId === productId ? { ...item, [field]: value } : item
    )))
  }

  const removeItem = (productId) => {
    setItems((currentItems) => currentItems.filter((item) => item.productId !== productId))
  }

  const resetRequestSteps = () => {
    setRequestSteps(DEFAULT_REQUEST_STEPS.map((step) => ({ ...step })))
  }

  const updateRequestStep = (key, status, message) => {
    setRequestSteps((currentSteps) => currentSteps.map((step) => (
      step.key === key ? { ...step, status, message } : step
    )))
  }

  const totalItems = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
  const totalValue = items.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.unitCost) || 0)), 0)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')
    resetRequestSteps()

    if (!branchId) {
      setError('No active branch selected.')
      return
    }

    if (!organizationId) {
      setError('No active organization found for this session.')
      return
    }

    if (!selectedSupplierId) {
      setError('Select a supplier before receiving items.')
      return
    }

    if (items.length === 0) {
      setError('Add at least one product to receive.')
      return
    }

    const invalidItem = items.find((item) => (Number(item.quantity) || 0) <= 0 || (Number(item.unitCost) || 0) <= 0)
    if (invalidItem) {
      setError('Each line item needs a quantity above 0 and a unit cost above 0.')
      return
    }

    setSubmitting(true)

    try {
      const receiptItems = buildReceiptItems(items)
      let stockReceiptId = null

      updateRequestStep('create', 'loading', 'Creating stock receipt...')

      const receiptResponse = await createReceipt({
        supplier_id: selectedSupplierId,
        payment_type: paymentType,
        branchId,
        organizationId,
      })

      const receipt = receiptResponse?.data || receiptResponse
      stockReceiptId = normalizeReceiptId(receipt)

      if (!stockReceiptId) {
        throw new Error('Receipt was created, but no receipt identifier was returned.')
      }

      if (!looksLikeUuid(stockReceiptId)) {
        throw new Error('Stock receipt UUID was not returned by `/stock-receipts`. The backend examples require a UUID `stock_receipt_id` for the next steps.')
      }

      updateRequestStep('create', 'success', `Receipt created with ID ${stockReceiptId}.`)
      updateRequestStep('bulk', 'loading', 'Saving selected items to the receipt...')

      const bulkReceiptPayload = {
        stock_receipt_id: stockReceiptId,
        branchId,
        organizationId,
        items: receiptItems,
      }

      try {
        await createReceiptBulk(bulkReceiptPayload)
        updateRequestStep('bulk', 'success', `${receiptItems.length} item line${receiptItems.length === 1 ? '' : 's'} saved successfully.`)
      } catch (bulkError) {
        updateRequestStep('bulk', 'error', bulkError.message || 'Saving selected items failed.')
        try {
          await deleteReceipt(stockReceiptId)
          updateRequestStep('create', 'error', 'Receipt creation was rolled back because item saving failed.')
        } catch {}
        throw new Error(bulkError.message || 'Receipt was created, but saving the selected items failed.')
      }

      updateRequestStep('accept', 'loading', 'Accepting the stock receipt...')

      const acceptReceiptPayload = {
        stock_receipt_id: stockReceiptId,
        branchId,
        organizationId,
      }

      try {
        await receiveReceipt(acceptReceiptPayload)
        updateRequestStep('accept', 'success', 'Stock receipt accepted successfully.')
      } catch (acceptError) {
        updateRequestStep('accept', 'error', acceptError.message || 'Accepting the stock receipt failed.')
        throw new Error(acceptError.message || 'Receipt items were saved, but accepting the stock receipt failed.')
      }

      setItems([])
      setSelectedSupplierId('')
      setPaymentType('credit')
      setSuccessMessage(`Items received successfully${receipt?.id ? ` under receipt #${receipt.id}` : '.'}`)
    } catch (err) {
      setError(err.message || 'Failed to receive items.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500 text-white">
              <HIcon icon={CheckListIcon} size={20}  />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">Receive Items</h1>
              <p className="text-xs text-gray-500">Record incoming stock and update inventory immediately.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Products selected</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{items.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Units to receive</p>
            <p className="mt-2 text-2xl font-bold text-primary-600">{totalItems}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Estimated stock value</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">₵{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <HIcon icon={Alert02Icon} size={18} className="mt-0.5 shrink-0"  />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <HIcon icon={CheckmarkCircle01Icon} size={18} className="mt-0.5 shrink-0"  />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white px-4 py-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Request Progress</h2>
              <p className="text-xs text-gray-500">Tracks create, item-save, and accept steps for this stock receipt.</p>
            </div>
            {submitting && (
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-medium text-primary-700">
                <HIcon icon={Loading03Icon} size={12} className="animate-spin"  />
                Processing
              </span>
            )}
          </div>
          <div className="space-y-2">
            {requestSteps.map((step) => {
              const statusClasses = step.status === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : step.status === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : step.status === 'loading'
                    ? 'border-primary-200 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600'

              return (
                <div key={step.key} className={`rounded-lg border px-3 py-2.5 ${statusClasses}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{step.label}</p>
                      <p className="text-xs mt-1">{step.message}</p>
                    </div>
                    <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide">
                      {step.status === 'idle' ? 'Idle' : step.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-5">
          <div className="space-y-5">
            <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier</label>
                  <div className="relative">
                    <HIcon icon={DeliveryTruck01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}  />
                    <select
                      value={selectedSupplierId}
                      onChange={(event) => setSelectedSupplierId(event.target.value)}
                      disabled={loading || submitting}
                      className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="">Select supplier</option>
                      {suppliers.map((supplier) => {
                        const supplierId = supplier.uuid || supplier.id
                        return (
                          <option key={supplierId} value={supplierId}>
                            {supplier.name || supplier.business_name || 'Unnamed supplier'}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payment type</label>
                  <select
                    value={paymentType}
                    onChange={(event) => setPaymentType(event.target.value)}
                    disabled={submitting}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="credit">Credit</option>
                    <option value="full_payment">Full Payment</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Add products</h2>
                  <p className="text-sm text-gray-500">Search for products and add them to this stock receipt.</p>
                </div>
              </div>

              <div className="relative">
                <HIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}  />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by product name, SKU, or barcode..."
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {filteredProducts.map((product) => {
                  const productId = product.uuid || product.id || product.productId
                  const isSelected = items.some((item) => item.productId === productId)
                  return (
                    <button
                      key={productId}
                      type="button"
                      disabled={isSelected}
                      onClick={() => addItem(product)}
                      className={`rounded-lg border p-4 text-left transition-colors ${
                        isSelected
                          ? 'border-primary-200 bg-primary-50 text-primary-700'
                          : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{product.name || 'Unnamed product'}</p>
                          <p className="text-xs text-gray-500 mt-1">SKU: {product.sku || '—'}</p>
                          <p className="text-xs text-gray-500">Cost: ₵{Number(product.cost ?? product.cost_price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isSelected ? 'bg-primary-100' : 'bg-gray-100'}`}>
                          <HIcon icon={Add01Icon} size={16}  />
                        </div>
                      </div>
                    </button>
                  )
                })}

                {!loading && filteredProducts.length === 0 && (
                  <div className="md:col-span-2 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                    No products match your search.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4 h-fit">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Receipt items</h2>
              <p className="text-sm text-gray-500">Review quantities and costs before posting this receipt.</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-200 py-10 text-sm text-gray-500">
                <HIcon icon={Loading03Icon} size={18} className="mr-2 animate-spin"  />
                Loading suppliers and products...
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
                Select products to start receiving stock.
              </div>
            ) : (
              <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.productId} className="rounded-lg border border-gray-200 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-1">SKU: {item.sku || '—'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        title="Remove item"
                      >
                        <HIcon icon={Delete01Icon} size={16}  />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(event) => updateItem(item.productId, 'quantity', event.target.value)}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">Unit cost</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitCost}
                          onChange={(event) => updateItem(item.productId, 'unitCost', event.target.value)}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Line total</span>
                      <span className="font-semibold text-gray-900">
                        ₵{((Number(item.quantity) || 0) * (Number(item.unitCost) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <HIcon icon={Loading03Icon} size={18} className="animate-spin"  /> : <HIcon icon={Package01Icon} size={18}  />}
              {submitting ? 'Receiving items...' : 'Post receipt and receive stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReceiveItems