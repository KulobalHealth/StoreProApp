import React, { useEffect, useMemo, useState } from 'react'
import { HIcon } from '../components/HIcon'
import {
  Alert02Icon,
  ArrowDataTransferHorizontalIcon,
  ArrowUpRightIcon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  Time01Icon,
  Package01Icon,
  RefreshIcon,
  Search01Icon,
  Store01Icon,
  WarehouseIcon,
} from '@hugeicons/core-free-icons'
import { listBranches, listProductsByBranch, updateProduct } from '../api/awoselDb'
import { getActiveBranch, getSessionBranchId } from '../utils/branch'
import { useAuth } from '../contexts/AuthContext'

const TRANSFER_HISTORY_KEY = 'warehouse_transfer_history'
const BRANCH_CACHE_KEY = 'awosel_branches_cache'
const BRANCHES_UPDATED_EVENT = 'awosel:branches-updated'
const TARGET_STORE_TYPES = new Set(['retail', 'wholesale'])

const normalizeProduct = (product) => ({
  ...product,
  normalizedId: product.uuid || product.id,
  name: product.name || product.product_name || 'Unnamed Product',
  sku: product.sku || product.item_number || product.itemNumber || '—',
  barcode: product.barcode || '',
  category: product.category || product.department || 'General',
  stock: Number(product.quantity ?? product.stock ?? 0) || 0,
  price: Number(product.selling_price ?? product.price ?? 0) || 0,
  minStock: Number(product.min_stock_quantity ?? product.minStock ?? 0) || 0,
})

const normalizeBranch = (branch) => ({
  ...branch,
  normalizedId: branch.uuid || branch.id || branch.branch_id || branch.branchId,
  name: branch.name || branch.branchName || branch.branch_name || 'Unnamed Store',
  location: branch.location || branch.address || branch.branch_location || '',
  storeType: (branch.store_type || branch.storeType || branch.type || '').toLowerCase(),
})

const extractBranchList = (response) => {
  const candidates = [
    response,
    response?.data,
    response?.branches,
    response?.data?.branches,
    response?.results,
    response?.data?.results,
  ]

  const list = candidates.find((candidate) => Array.isArray(candidate)) || []
  return list
    .map(normalizeBranch)
    .filter((branch) => branch.normalizedId)
}

const readBranchCache = () => {
  try {
    const raw = localStorage.getItem(BRANCH_CACHE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.map(normalizeBranch) : []
  } catch {
    return []
  }
}

const writeBranchCache = (branchList) => {
  localStorage.setItem(BRANCH_CACHE_KEY, JSON.stringify(branchList))
}

const syncBranchState = (incomingBranches, setBranches) => {
  const nextBranches = (Array.isArray(incomingBranches) ? incomingBranches : [])
    .map(normalizeBranch)
    .filter((branch) => branch.normalizedId)

  setBranches(nextBranches)
}

const readTransferHistory = () => {
  try {
    const raw = localStorage.getItem(TRANSFER_HISTORY_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeTransferHistory = (history) => {
  localStorage.setItem(TRANSFER_HISTORY_KEY, JSON.stringify(history))
}

const DEFAULT_TRANSFER_ITEM = {
  quantity: '',
}

const Warehouse = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [branches, setBranches] = useState([])
  const [transferHistory, setTransferHistory] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState({})
  const [destinationBranchId, setDestinationBranchId] = useState('')
  const [transferNote, setTransferNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const activeBranch = getActiveBranch()
  const activeBranchId = activeBranch?.uuid || activeBranch?.id || getSessionBranchId()
  const activeBranchType = (activeBranch?.store_type || activeBranch?.storeType || '').toLowerCase()

  const loadWarehouseData = async ({ showSpinner = true } = {}) => {
    if (!activeBranchId) {
      setError('No active branch selected. Please select a branch first.')
      setLoading(false)
      return
    }

    try {
      setError('')
      setSuccess('')
      if (showSpinner) setLoading(true)
      else setRefreshing(true)

      const [branchResponse, productResponse] = await Promise.all([
        listBranches(),
        listProductsByBranch(activeBranchId),
      ])

      const branchList = extractBranchList(branchResponse)
      const productList = Array.isArray(productResponse) ? productResponse : (productResponse?.data || [])

      setBranches(branchList)
      writeBranchCache(branchList)
      setProducts(productList.map(normalizeProduct))

      const history = readTransferHistory().filter((entry) => entry.sourceBranchId === activeBranchId)
      setTransferHistory(history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
    } catch (err) {
      const cachedBranches = readBranchCache()
      if (cachedBranches.length > 0) {
        setBranches(cachedBranches)
      }
      setError(err.message || 'Failed to load warehouse data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadWarehouseData()
  }, [activeBranchId])

  useEffect(() => {
    const handleBranchesUpdated = (event) => {
      syncBranchState(event.detail?.branches || readBranchCache(), setBranches)
    }

    const handleStorage = (event) => {
      if (event.key !== BRANCH_CACHE_KEY) return
      try {
        const nextBranches = event.newValue ? JSON.parse(event.newValue) : []
        syncBranchState(nextBranches, setBranches)
      } catch {
        syncBranchState([], setBranches)
      }
    }

    window.addEventListener(BRANCHES_UPDATED_EVENT, handleBranchesUpdated)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener(BRANCHES_UPDATED_EVENT, handleBranchesUpdated)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const destinationBranches = useMemo(() => {
    return branches.filter((branch) => {
      const branchId = branch.normalizedId || branch.uuid || branch.id
      const branchType = branch.storeType || (branch.store_type || branch.storeType || '').toLowerCase()
      return branchId !== activeBranchId && TARGET_STORE_TYPES.has(branchType)
    }).sort((left, right) => left.name.localeCompare(right.name))
  }, [branches, activeBranchId])

  useEffect(() => {
    if (!destinationBranchId) return
    const hasSelectedBranch = destinationBranches.some((branch) => String(branch.normalizedId || branch.uuid || branch.id) === String(destinationBranchId))
    if (!hasSelectedBranch) {
      setDestinationBranchId('')
    }
  }, [destinationBranches, destinationBranchId])

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return products

    return products.filter((product) => (
      [product.name, product.sku, product.barcode, product.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    ))
  }, [products, searchTerm])

  const selectedTransferItems = useMemo(() => {
    return Object.entries(selectedItems)
      .map(([productId, config]) => {
        const product = products.find((item) => String(item.normalizedId) === String(productId))
        if (!product) return null
        return {
          ...product,
          transferQuantity: config?.quantity ?? '',
        }
      })
      .filter(Boolean)
  }, [products, selectedItems])

  const selectedTransferCount = selectedTransferItems.length

  const summary = useMemo(() => {
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0)
    const lowStock = products.filter((product) => product.stock <= Math.max(product.minStock, 1)).length
    const totalValue = products.reduce((sum, product) => sum + (product.stock * product.price), 0)

    return {
      totalItems: products.length,
      totalStock,
      lowStock,
      totalValue,
    }
  }, [products])

  const handleToggleProduct = (product) => {
    const productId = String(product.normalizedId)
    setSelectedItems((previousItems) => {
      if (previousItems[productId]) {
        const nextItems = { ...previousItems }
        delete nextItems[productId]
        return nextItems
      }

      return {
        ...previousItems,
        [productId]: { ...DEFAULT_TRANSFER_ITEM },
      }
    })
    setSuccess('')
    setError('')
  }

  const handleTransferQuantityChange = (productId, value) => {
    setSelectedItems((previousItems) => {
      if (!previousItems[productId]) return previousItems

      return {
        ...previousItems,
        [productId]: {
          ...previousItems[productId],
          quantity: value,
        },
      }
    })
  }

  const handleRemoveSelectedItem = (productId) => {
    setSelectedItems((previousItems) => {
      if (!previousItems[productId]) return previousItems
      const nextItems = { ...previousItems }
      delete nextItems[productId]
      return nextItems
    })
  }

  const handleClearSelectedItems = () => {
    setSelectedItems({})
    setSuccess('')
    setError('')
  }

  const handleTransfer = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (selectedTransferItems.length === 0) {
      setError('Select at least one product to transfer.')
      return
    }

    if (!destinationBranchId) {
      setError('Select a destination store.')
      return
    }

    const destinationBranch = destinationBranches.find((branch) => String(branch.normalizedId || branch.uuid || branch.id) === String(destinationBranchId))
    if (!destinationBranch) {
      setError('Destination branch is invalid.')
      return
    }

    const transferLines = []
    for (const item of selectedTransferItems) {
      const quantity = Number(item.transferQuantity)
      if (!Number.isFinite(quantity) || quantity <= 0) {
        setError(`Enter a valid transfer quantity for ${item.name}.`)
        return
      }

      if (quantity > item.stock) {
        setError(`Transfer quantity for ${item.name} cannot exceed current warehouse stock.`)
        return
      }

      transferLines.push({
        productId: item.normalizedId,
        productName: item.name,
        sku: item.sku,
        quantity,
        updatedStock: item.stock - quantity,
      })
    }

    try {
      setSubmitting(true)
      for (const line of transferLines) {
        await updateProduct(line.productId, { quantity: line.updatedStock })
      }

      const performedBy = user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email || 'User'
      const transferTimestamp = new Date().toISOString()
      const historyEntries = transferLines.map((line, index) => ({
        id: `transfer-${Date.now()}-${index}`,
        timestamp: transferTimestamp,
        sourceBranchId: activeBranchId,
        sourceBranchName: activeBranch?.name || 'Warehouse',
        sourceBranchType: activeBranchType || 'warehouse',
        destinationBranchId: destinationBranch.normalizedId || destinationBranch.uuid || destinationBranch.id,
        destinationBranchName: destinationBranch.name || 'Target store',
        destinationBranchType: destinationBranch.storeType || destinationBranch.store_type || destinationBranch.storeType || 'store',
        productId: line.productId,
        productName: line.productName,
        sku: line.sku,
        quantity: line.quantity,
        remainingStock: line.updatedStock,
        note: transferNote.trim(),
        performedBy,
      }))

      const nextHistory = [...historyEntries, ...readTransferHistory()]
      writeTransferHistory(nextHistory)
      setTransferHistory(nextHistory.filter((entry) => entry.sourceBranchId === activeBranchId))
      setProducts((previousProducts) => previousProducts.map((product) => (
        transferLines.some((line) => String(line.productId) === String(product.normalizedId))
          ? {
              ...product,
              stock: transferLines.find((line) => String(line.productId) === String(product.normalizedId))?.updatedStock ?? product.stock,
            }
          : product
      )))

      setSelectedItems({})
      setTransferNote('')
      setDestinationBranchId('')
      setSuccess(`${transferLines.length} product${transferLines.length === 1 ? '' : 's'} transferred to ${destinationBranch.name}.`)
    } catch (err) {
      setError(err.message || 'Failed to complete warehouse transfer.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatMoney = (value) => `₵${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <HIcon icon={RefreshIcon} size={28} className="animate-spin text-primary-500 mx-auto mb-3"  />
          <p className="text-sm text-gray-500">Loading warehouse workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-500 text-white">
                <HIcon icon={WarehouseIcon} size={18} strokeWidth={2}  />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">Warehouse Transfers</h1>
                <p className="text-gray-500 text-xs">
                  Search warehouse stock, transfer items to retail or wholesale branches, and review transfer history.
                </p>
              </div>
            </div>
            <button
              onClick={() => loadWarehouseData({ showSpinner: false })}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <HIcon icon={RefreshIcon} size={15} className={refreshing ? 'animate-spin' : ''}  />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {activeBranchType && activeBranchType !== 'warehouse' && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-start gap-2">
            <HIcon icon={Alert02Icon} size={16} className="shrink-0 mt-0.5"  />
            <span>
              The active branch is marked as <strong className="capitalize">{activeBranchType}</strong>. Warehouse transfers work best when the selected branch type is <strong>warehouse</strong>.
            </span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm flex items-center gap-2">
            <HIcon icon={CheckmarkCircle01Icon} size={16} className="shrink-0"  />
            {success}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Products</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.totalItems}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Units in Stock</p>
            <p className="text-2xl font-bold text-primary-600 mt-1">{summary.totalStock}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Low Stock</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{summary.lowStock}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Value</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatMoney(summary.totalValue)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
          <div className="xl:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col h-[36rem]">
            <div className="px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <HIcon icon={Package01Icon} size={16} className="text-primary-500"  />
                  Warehouse Stock
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Search products and inspect current stock before transferring.</p>
              </div>
              <div className="relative w-full sm:w-72">
                <HIcon icon={Search01Icon} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"  />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by name, SKU, barcode..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-14 text-center text-gray-500">
                <HIcon icon={Package01Icon} size={32} className="mx-auto mb-3 text-gray-300"  />
                <p className="font-medium">No products found</p>
                <p className="text-sm mt-1">Try a different search term or add inventory to this warehouse.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gray-900 text-white">
                      <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider">Select</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Product</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Category</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Stock</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Price</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((product) => {
                      const isSelected = Boolean(selectedItems[String(product.normalizedId)])
                      const isLow = product.stock <= Math.max(product.minStock, 1)
                      return (
                        <tr key={product.normalizedId} className={isSelected ? 'bg-primary-50/60' : 'hover:bg-gray-50'}>
                          <td className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleProduct(product)}
                              className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">SKU: {product.sku}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{product.category}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${isLow ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-sm font-semibold text-gray-900">{formatMoney(product.price)}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                              isSelected
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              <HIcon icon={ArrowDataTransferHorizontalIcon} size={13}  />
                              {isSelected ? 'Selected' : 'Available'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-fit">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <HIcon icon={ArrowDataTransferHorizontalIcon} size={16} className="text-primary-500"  />
                Transfer Items
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Move stock from this warehouse to a retail or wholesale branch.</p>
            </div>

            <form onSubmit={handleTransfer} className="p-4 space-y-4">
              <div>
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Selected Items</label>
                  {selectedTransferCount > 0 && (
                    <button
                      type="button"
                      onClick={handleClearSelectedItems}
                      className="text-xs font-medium text-primary-600 hover:text-primary-700"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                {selectedTransferCount === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-sm text-gray-500 text-center">
                    Select products from the warehouse stock table.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {selectedTransferItems.map((item) => (
                      <div key={item.normalizedId} className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">SKU: {item.sku} · Stock {item.stock}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSelectedItem(String(item.normalizedId))}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            aria-label={`Remove ${item.name}`}
                          >
                            <HIcon icon={Cancel01Icon} size={14}  />
                          </button>
                        </div>
                        <div className="mt-3">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={item.transferQuantity}
                            onChange={(event) => handleTransferQuantityChange(String(item.normalizedId), event.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                            placeholder="Enter quantity"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Destination Store</label>
                <select
                  value={destinationBranchId}
                  onChange={(event) => setDestinationBranchId(event.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                >
                  <option value="">Choose destination</option>
                  {destinationBranches.map((branch) => {
                    const branchId = branch.normalizedId || branch.uuid || branch.id
                    const storeType = branch.storeType || branch.store_type || branch.storeType || 'store'
                    return (
                      <option key={branchId} value={branchId}>
                        {branch.name} · {storeType}
                      </option>
                    )
                  })}
                </select>
                {destinationBranches.length === 0 && (
                  <p className="text-xs text-amber-600 mt-2">No retail or wholesale branches are available yet.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Transfer Note</label>
                <textarea
                  rows="3"
                  value={transferNote}
                  onChange={(event) => setTransferNote(event.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 resize-none"
                  placeholder="Optional note for this transfer"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || destinationBranches.length === 0 || selectedTransferCount === 0}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${
                  submitting || destinationBranches.length === 0 || selectedTransferCount === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-500 hover:bg-primary-600'
                }`}
              >
                {submitting ? <HIcon icon={RefreshIcon} size={16} className="animate-spin"  /> : <HIcon icon={ArrowDataTransferHorizontalIcon} size={16}  />}
                {submitting ? 'Transferring...' : `Transfer ${selectedTransferCount} Item${selectedTransferCount === 1 ? '' : 's'}`}
              </button>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <HIcon icon={Time01Icon} size={16} className="text-primary-500"  />
                Transfer History
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Review stock moved out from this warehouse.</p>
            </div>
            <div className="text-xs text-gray-500">{transferHistory.length} transfer{transferHistory.length === 1 ? '' : 's'}</div>
          </div>

          {transferHistory.length === 0 ? (
            <div className="py-14 text-center text-gray-500">
              <HIcon icon={Time01Icon} size={32} className="mx-auto mb-3 text-gray-300"  />
              <p className="font-medium">No warehouse transfers yet</p>
              <p className="text-sm mt-1">Completed transfers will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">When</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Product</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Destination</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Qty</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Remaining</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transferHistory.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(entry.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{entry.productName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">SKU: {entry.sku}</p>
                          {entry.note && <p className="text-xs text-gray-400 mt-1">{entry.note}</p>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        <div className="inline-flex items-center gap-2">
                          <HIcon icon={Store01Icon} size={13} className="text-gray-400"  />
                          <span>{entry.destinationBranchName}</span>
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-[10px] font-semibold uppercase tracking-wide">
                            {entry.destinationBranchType}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-semibold text-gray-900">{entry.quantity}</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-600">{entry.remainingStock}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{entry.performedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 flex items-start gap-2">
          <HIcon icon={ArrowUpRightIcon} size={16} className="shrink-0 mt-0.5"  />
          <span>
            Transfers currently deduct stock from the warehouse branch and save a transfer history for this warehouse. A dedicated backend transfer endpoint would be the next step to automatically increase stock in the destination branch as well.
          </span>
        </div>
      </div>
    </div>
  )
}

export default Warehouse
