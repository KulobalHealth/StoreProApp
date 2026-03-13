import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, FileText, Package, CheckCircle2, Clock, Truck, Calendar, Hash, Layers, Plus, Search, X, Trash2, Loader2 } from 'lucide-react'
import { getReceipt, receiveReceipt, createReceiptBulk, listProductsByBranch, deleteReceipt, listReceipts, listSuppliers } from '../api/awoselDb.js'
import { getSessionBranchId, getSessionOrgId } from '../utils/branch.js'

// LocalStorage cache for PO id→uuid mapping (since GET doesn't return uuid)
const PO_UUID_CACHE_KEY = 'po_uuid_cache'
function getPoUuidCache() {
  try { return JSON.parse(localStorage.getItem(PO_UUID_CACHE_KEY) || '{}') } catch { return {} }
}
function setPoUuidCache(numericId, uuid) {
  if (!numericId || !uuid) return
  try {
    const cache = getPoUuidCache()
    cache[String(numericId)] = uuid
    // Keep only last 200 entries
    const keys = Object.keys(cache)
    if (keys.length > 200) { keys.slice(0, keys.length - 200).forEach(k => delete cache[k]) }
    localStorage.setItem(PO_UUID_CACHE_KEY, JSON.stringify(cache))
  } catch {}
}
function lookupPoUuid(numericId) {
  return getPoUuidCache()[String(numericId)] || null
}

const isUuid = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)

const PurchaseOrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [receipt, setReceipt] = useState(null)
  const [receiptUuid, setReceiptUuid] = useState(
    location.state?.uuid || lookupPoUuid(id) || (isUuid(id) ? id : null)
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [supplierName, setSupplierName] = useState(location.state?.supplierName || '')
  const [receiving, setReceiving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Add items state
  const [showAddItems, setShowAddItems] = useState(false)
  const [allProducts, setAllProducts] = useState([])
  const [productSearch, setProductSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [newItems, setNewItems] = useState([]) // { product_id, name, quantity, unit_cost }
  const [bulkSubmitting, setBulkSubmitting] = useState(false)
  const [bulkError, setBulkError] = useState('')
  const searchRef = useRef(null)

  // Resolve supplier name from receipt data or API
  useEffect(() => {
    if (!receipt) return
    // Already have it from router state or previous lookup
    const fromReceipt = receipt.supplier_name || receipt.supplierName || receipt.supplier
    if (fromReceipt) { setSupplierName(fromReceipt); return }
    if (supplierName) return
    // Look up by supplier_id from the suppliers list
    const suppId = receipt.supplier_id || receipt.supplierId
    if (!suppId) return
    const branchId = getSessionBranchId()
    if (!branchId) return
    listSuppliers(branchId)
      .then(res => {
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
        const match = list.find(s => String(s.id) === String(suppId) || String(s.uuid) === String(suppId))
        if (match) setSupplierName(match.name || match.business_name || '')
      })
      .catch(() => {})
  }, [receipt])

  // Cache UUID from router state
  useEffect(() => {
    if (location.state?.uuid && id) {
      setPoUuidCache(id, location.state.uuid)
    }
  }, [id, location.state?.uuid])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError('')
    const fetchPo = async () => {
      // Try fetching by numeric ID first
      try {
        const res = await getReceipt(id)
        const data = res?.data || res
        setReceipt(data)
        if (data?.uuid) {
          setReceiptUuid(data.uuid)
          setPoUuidCache(data.id || id, data.uuid)
        }
        return
      } catch (err) {
        // If numeric ID fails and we have a UUID, try with UUID
        const uuid = receiptUuid || lookupPoUuid(id)
        if (uuid && uuid !== id) {
          try {
            const res = await getReceipt(uuid)
            const data = res?.data || res
            setReceipt(data)
            return
          } catch {}
        }
        // Final fallback: fetch from list and find matching receipt
        try {
          const branchId = getSessionBranchId()
          if (branchId) {
            const listRes = await listReceipts(branchId)
            const all = Array.isArray(listRes) ? listRes
              : Array.isArray(listRes?.data) ? listRes.data
              : Array.isArray(listRes?.stockReceipts) ? listRes.stockReceipts
              : Array.isArray(listRes?.stock_receipts) ? listRes.stock_receipts
              : []
            const match = all.find(r =>
              String(r.id) === String(id) || String(r.uuid) === String(id) ||
              String(r.uuid) === String(uuid)
            )
            if (match) {
              setReceipt(match)
              if (match.uuid) {
                setReceiptUuid(match.uuid)
                setPoUuidCache(match.id || id, match.uuid)
              }
              return
            }
          }
        } catch {}
        setError(err.message || 'Could not load purchase order')
        setReceipt(null)
      }
    }
    fetchPo().finally(() => setLoading(false))
  }, [id])

  // Fetch branch products when add-items panel is opened
  useEffect(() => {
    if (!showAddItems || allProducts.length > 0) return
    const branchId = getSessionBranchId()
    if (!branchId) return
    listProductsByBranch(branchId)
      .then((res) => {
        const products = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
        setAllProducts(products)
      })
      .catch(() => setAllProducts([]))
  }, [showAddItems])

  // Close product dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filteredProducts = productSearch.trim()
    ? allProducts.filter((p) => (p.name || '').toLowerCase().includes(productSearch.toLowerCase()))
    : allProducts

  const addProductToList = (product) => {
    const pid = product.uuid || product.id
    if (newItems.some((i) => i.product_id === pid)) return
    setNewItems((prev) => [...prev, { product_id: pid, name: product.name, quantity: 1, unit_cost: Number(product.cost) || 0 }])
    setProductSearch('')
    setDropdownOpen(false)
  }

  const updateNewItem = (idx, field, value) => {
    setNewItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  const removeNewItem = (idx) => {
    setNewItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleBulkSubmit = async () => {
    if (newItems.length === 0) return
    setBulkSubmitting(true)
    setBulkError('')
    try {
      const body = {
        stock_receipt_id: receiptUuid,
        branchId: getSessionBranchId(),
        organizationId: getSessionOrgId(),
        items: newItems.map((item) => ({
          product_id: item.product_id,
          quantity: String(item.quantity),
          unit_cost: String(item.unit_cost),
          total_cost: String(Number(item.quantity) * Number(item.unit_cost)),
        })),
      }
      const bulkRes = await createReceiptBulk(body)

      // Try to re-fetch full receipt (with items) from server
      let fetched = false
      try {
        const updated = await getReceipt(id)
        const data = updated?.data || updated
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          setReceipt(data)
          fetched = true
        }
      } catch {}

      if (!fetched && receiptUuid) {
        try {
          const updated = await getReceipt(receiptUuid)
          const data = updated?.data || updated
          if (data && Array.isArray(data.items) && data.items.length > 0) {
            setReceipt(data)
            fetched = true
          }
        } catch {}
      }

      if (!fetched) {
        // Use the bulk response items to update local state
        const addedItems = bulkRes?.data?.items || bulkRes?.items || []
        // Map added items to the format the UI expects, merging product names
        const nameMap = Object.fromEntries(newItems.map(i => [i.product_id, i.name]))
        const mappedItems = addedItems.map(item => ({
          ...item,
          product_name: item.product_name || nameMap[item.product_id] || '—',
        }))
        setReceipt(prev => prev ? {
          ...prev,
          items: [...(prev.items || []), ...mappedItems],
        } : prev)
      }

      setNewItems([])
      setShowAddItems(false)
    } catch (err) {
      setBulkError(err.message || 'Failed to add items')
    } finally {
      setBulkSubmitting(false)
    }
  }

  const handleReceive = async () => {
    if (!receipt?.id || receipt.received_at) return
    setReceiving(true)
    setError('')
    try {
      const receiveRes = await receiveReceipt({ stock_receipt_id: receiptUuid, branchId: getSessionBranchId(), organizationId: getSessionOrgId() })
      // The receive response itself may contain the updated receipt
      const receiveData = receiveRes?.data || receiveRes
      if (receiveData && typeof receiveData === 'object' && (receiveData.id || receiveData.uuid)) {
        setReceipt(receiveData)
      } else {
        // Re-fetch from server to get the actual received state
        let fetched = false
        try {
          const updated = await getReceipt(id)
          const data = updated?.data || updated
          setReceipt(data)
          fetched = true
        } catch {
          // Try with UUID
          if (receiptUuid) {
            try {
              const updated = await getReceipt(receiptUuid)
              const data = updated?.data || updated
              setReceipt(data)
              fetched = true
            } catch {}
          }
        }
        if (!fetched) {
          // Optimistic update as last resort
          setReceipt((prev) => (prev ? { ...prev, received_at: new Date().toISOString(), status: 'received' } : null))
        }
      }
    } catch (err) {
      setError(err.message || 'Could not receive order')
    } finally {
      setReceiving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError('')
    try {
      await deleteReceipt(receiptUuid || id)
      // Remove from UUID cache
      try {
        const cache = getPoUuidCache()
        delete cache[String(id)]
        localStorage.setItem(PO_UUID_CACHE_KEY, JSON.stringify(cache))
      } catch {}
      navigate(-1)
    } catch (err) {
      setError(err.message || 'Could not delete purchase order')
      setShowDeleteConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  const formatMoney = (n) =>
    (Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const formatDate = (iso) => {
    if (!iso) return '—'
    const d = new Date(iso)
    return `${d.toLocaleDateString()} · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading purchase order…</p>
        </div>
      </div>
    )
  }

  if (error && !receipt) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border border-red-100 shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <FileText className="text-red-500" size={28} />
          </div>
          <p className="text-red-700 font-medium mb-6">{error}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>
      </div>
    )
  }

  const items = receipt?.items || []
  const totalAmount = items.reduce((sum, i) => sum + (Number(i.quantity) * Number(i.unit_cost)), 0)
  const totalQty = items.reduce((sum, i) => sum + Number(i.quantity), 0)
  const isPending = receipt?.status === 'pending'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
      <div className="px-4 sm:px-6 py-8">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Hero card */}
        <div className="relative bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-primary-600/5 pointer-events-none" />
          <div className="relative px-5 sm:px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-sm">
                  <FileText size={18} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                    Purchase Order #{receipt?.id}
                  </h1>
                  <p className="text-slate-400 text-xs flex items-center gap-1">
                    <Calendar size={11} />
                    {formatDate(receipt?.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2">
                {isPending ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200/80">
                    <Clock size={14} />
                    Pending
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200/80">
                    <CheckCircle2 size={14} />
                    Received
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete purchase order"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <div className="bg-white rounded-lg border border-slate-100 px-3 py-2 shadow-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Supplier</span>
            <p className="text-slate-900 font-semibold text-sm truncate" title={supplierName || receipt?.supplier_name}>
              {supplierName || receipt?.supplier_name || '—'}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-slate-100 px-3 py-2 shadow-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Line items</span>
            <p className="text-slate-900 font-bold text-sm">{items.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-100 px-3 py-2 shadow-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total units</span>
            <p className="text-slate-900 font-bold text-sm">{totalQty}</p>
          </div>
          <div className="bg-white rounded-lg border border-primary-100 px-3 py-2 shadow-sm bg-gradient-to-br from-primary-50/50 to-white">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-600/80">Total amount</span>
            <p className="text-primary-700 font-bold text-sm">₵{formatMoney(totalAmount)}</p>
          </div>
        </div>

        {/* Line items */}
        <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Package size={20} className="text-primary-500" />
              Line items
            </h2>
            {isPending && (
              <button
                type="button"
                onClick={() => setShowAddItems(!showAddItems)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
              >
                <Plus size={16} />
                Add Items
              </button>
            )}
          </div>

          {/* Add items panel */}
          {showAddItems && isPending && (
            <div className="px-6 py-5 border-b border-slate-100 bg-primary-50/30 space-y-4">
              {/* Product search */}
              <div className="relative" ref={searchRef}>
                <label className="block text-sm font-medium text-slate-700 mb-1">Search & add products</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => { setProductSearch(e.target.value); setDropdownOpen(true) }}
                    onFocus={() => setDropdownOpen(true)}
                    placeholder="Search products by name..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  />
                </div>
                {dropdownOpen && (
                  <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                    {filteredProducts.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-slate-400 text-center">No products found</div>
                    ) : (
                      filteredProducts.slice(0, 10).map((p) => {
                        const pid = p.uuid || p.id
                        const alreadyAdded = newItems.some((i) => i.product_id === pid)
                        return (
                          <button
                            key={pid}
                            type="button"
                            disabled={alreadyAdded}
                            onClick={() => addProductToList(p)}
                            className={`w-full text-left px-4 py-2.5 text-sm border-b border-slate-50 last:border-0 transition-colors ${alreadyAdded ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'hover:bg-primary-50'}`}
                          >
                            <span className="font-medium text-slate-900">{p.name}</span>
                            <span className="ml-2 text-slate-500">₵{(Number(p.cost) || 0).toFixed(2)} cost</span>
                            {alreadyAdded && <span className="ml-2 text-xs text-primary-500 font-semibold">Added</span>}
                          </button>
                        )
                      })
                    )}
                  </div>
                )}
              </div>

              {/* New items table */}
              {newItems.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left py-2.5 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Product</th>
                        <th className="text-right py-2.5 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 w-28">Qty</th>
                        <th className="text-right py-2.5 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 w-32">Unit Cost (₵)</th>
                        <th className="text-right py-2.5 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 w-32">Total</th>
                        <th className="w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {newItems.map((item, idx) => {
                        const total = Number(item.quantity) * Number(item.unit_cost)
                        return (
                          <tr key={item.product_id} className="border-b border-slate-50 last:border-0">
                            <td className="py-2.5 px-4 text-sm font-medium text-slate-900">{item.name}</td>
                            <td className="py-2.5 px-4">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateNewItem(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full text-right px-2 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                              />
                            </td>
                            <td className="py-2.5 px-4">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unit_cost}
                                onChange={(e) => updateNewItem(idx, 'unit_cost', parseFloat(e.target.value) || 0)}
                                className="w-full text-right px-2 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                              />
                            </td>
                            <td className="py-2.5 px-4 text-right text-sm font-semibold text-slate-900 tabular-nums">
                              ₵{total.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-2">
                              <button
                                type="button"
                                onClick={() => removeNewItem(idx)}
                                className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 border-t border-slate-200">
                        <td colSpan={3} className="py-2.5 px-4 text-right text-sm font-semibold text-slate-700">
                          New items total ({newItems.length})
                        </td>
                        <td className="py-2.5 px-4 text-right text-sm font-bold text-primary-600 tabular-nums">
                          ₵{newItems.reduce((s, i) => s + Number(i.quantity) * Number(i.unit_cost), 0).toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {bulkError && <p className="text-sm text-red-600">{bulkError}</p>}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowAddItems(false); setNewItems([]); setBulkError('') }}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkSubmit}
                  disabled={newItems.length === 0 || bulkSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
                >
                  {bulkSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Plus size={16} /> Save Items ({newItems.length})</>}
                </button>
              </div>
            </div>
          )}
          {items.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Package className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500 font-medium">No items in this order.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Product
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 w-24">
                      Qty
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 w-32">
                      Unit cost
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 w-36">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row, idx) => {
                    const subtotal = Number(row.quantity) * Number(row.unit_cost)
                    return (
                      <tr
                        key={row.id}
                        className={`border-b border-slate-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} hover:bg-primary-50/20 transition-colors`}
                      >
                        <td className="py-4 px-6 font-medium text-slate-900">{row.product_name}</td>
                        <td className="py-4 px-6 text-right text-slate-700 tabular-nums">{Number(row.quantity)}</td>
                        <td className="py-4 px-6 text-right text-slate-700 tabular-nums">₵{formatMoney(row.unit_cost)}</td>
                        <td className="py-4 px-6 text-right font-semibold text-slate-900 tabular-nums">
                          ₵{formatMoney(subtotal)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100/80 border-t-2 border-slate-200">
                    <td colSpan={3} className="py-4 px-6 text-right font-semibold text-slate-700">
                      Total
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-primary-600 text-lg tabular-nums">
                      ₵{formatMoney(totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {isPending && items.length > 0 && (
            <div className="px-6 py-6 border-t border-slate-100 bg-slate-50/30">
              <button
                type="button"
                onClick={handleReceive}
                disabled={receiving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:bg-emerald-700 hover:shadow-emerald-500/30 disabled:opacity-60 transition-all"
              >
                <CheckCircle2 size={20} />
                {receiving ? 'Receiving…' : 'Receive order'}
              </button>
              <p className="text-slate-500 text-sm mt-2">Updates stock levels and supplier balance.</p>
            </div>
          )}
        </div>

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="text-red-600" size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Delete Purchase Order</h3>
              </div>
              <p className="text-slate-600 text-sm mb-6">Are you sure you want to delete PO #{receipt?.id}? This action cannot be undone.</p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deleting ? <><Loader2 size={14} className="animate-spin" /> Deleting…</> : <><Trash2 size={14} /> Delete</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PurchaseOrderDetail
