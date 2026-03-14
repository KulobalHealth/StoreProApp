import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Package,
  CreditCard,
  ChevronRight,
  Banknote,
  X,
  History,
  Plus,
  Loader2,
  Pencil,
} from 'lucide-react'
import { getSupplier, updateSupplier, listReceipts, listDebtPayments, postDebtPayment, createReceipt } from '../api/awoselDb.js'
import { getSessionBranchId, getSessionOrgId } from '../utils/branch.js'

const SupplierDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [supplier, setSupplier] = useState(null)
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [debtPayments, setDebtPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [payAmount, setPayAmount] = useState('')
  const [payNotes, setPayNotes] = useState('')
  const [paySubmitting, setPaySubmitting] = useState(false)
  const [payError, setPayError] = useState('')
  const [createPOOpen, setCreatePOOpen] = useState(false)
  const [poPaymentType, setPoPaymentType] = useState('credit')
  const [poSubmitting, setPoSubmitting] = useState(false)
  const [poError, setPoError] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', phone1: '', phone2: '', email: '', location: '', description: '' })
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState('')

  const openEditModal = () => {
    setEditForm({
      name: supplier?.name || '',
      phone1: supplier?.phone1 || '',
      phone2: supplier?.phone2 || '',
      email: supplier?.email || '',
      location: supplier?.location || '',
      description: supplier?.description || '',
    })
    setEditError('')
    setEditOpen(true)
  }

  const handleEditSupplier = async (e) => {
    e.preventDefault()
    if (!editForm.name.trim()) {
      setEditError('Supplier name is required')
      return
    }
    setEditSubmitting(true)
    setEditError('')
    try {
      const supplierId = supplier?.uuid || supplier?.id || id
      await updateSupplier(supplierId, {
        ...editForm,
        branchId: getSessionBranchId(),
        organizationId: getSessionOrgId(),
      })
      setEditOpen(false)
      await fetchSupplierData()
    } catch (err) {
      setEditError(err.message || 'Failed to update supplier')
    } finally {
      setEditSubmitting(false)
    }
  }

  const fetchSupplierData = async () => {
    if (!id) return

    // Fetch supplier details
    let supplierData = null
    try {
      const supplierRes = await getSupplier(id, { branchId: getSessionBranchId(), organizationId: getSessionOrgId() })
      supplierData = supplierRes?.data || supplierRes
    } catch (err) {
      console.error('[SupplierDetail] getSupplier failed:', err.message)
      throw err
    }
    setSupplier(supplierData)

    // Fetch receipts (don't let this fail the whole page)
    try {
      const poList = await listReceipts(getSessionBranchId())
      const raw = Array.isArray(poList) ? poList
        : Array.isArray(poList?.data) ? poList.data
        : Array.isArray(poList?.stockReceipts) ? poList.stockReceipts
        : Array.isArray(poList?.stock_receipts) ? poList.stock_receipts
        : Array.isArray(poList?.receipts) ? poList.receipts
        : []
      const matchIds = new Set([String(id)])
      if (supplierData?.uuid) matchIds.add(String(supplierData.uuid))
      if (supplierData?.id) matchIds.add(String(supplierData.id))
      const mine = raw.filter((r) => {
        return matchIds.has(String(r.supplier_id ?? ''))
          || matchIds.has(String(r.supplierId ?? ''))
          || matchIds.has(String(r.supplier ?? ''))
      })
      setPurchaseOrders(mine)
    } catch (err) {
      console.error('[SupplierDetail] listReceipts failed:', err.message)
      setPurchaseOrders([])
    }

    // Fetch debt payments (table may not exist yet on backend)
    try {
      const payments = await listDebtPayments(id)
      const pays = payments?.data || payments
      setDebtPayments(Array.isArray(pays) ? pays : [])
    } catch {
      setDebtPayments([])
    }
  }

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError('')
    fetchSupplierData()
      .catch((err) => {
        setError(err.message || 'Could not load supplier')
        setSupplier(null)
        setPurchaseOrders([])
        setDebtPayments([])
      })
      .finally(() => setLoading(false))
  }, [id])

  const formatMoney = (n) =>
    (Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handlePayDebt = (e) => {
    e.preventDefault()
    const amount = parseFloat(payAmount)
    if (!amount || amount <= 0) {
      setPayError('Enter a valid amount')
      return
    }
    const debtOwingNow = Number(supplier?.debt_owing) || 0
    if (amount > debtOwingNow) {
      setPayError(`Amount cannot exceed debt (₵${formatMoney(debtOwingNow)})`)
      return
    }
    setPaySubmitting(true)
    setPayError('')
    postDebtPayment(id, { amount, notes: payNotes })
      .then(() => {
        setPayModalOpen(false)
        setPayAmount('')
        setPayNotes('')
        fetchSupplierData()
      })
      .catch((err) => setPayError(err.message || 'Payment failed'))
      .finally(() => setPaySubmitting(false))
  }

  const handleCreatePO = async () => {
    setPoSubmitting(true)
    setPoError('')
    try {
      const res = await createReceipt({
        supplier_id: supplier?.uuid || supplier?.id || id,
        payment_type: poPaymentType,
        branchId: getSessionBranchId(),
        organizationId: getSessionOrgId(),
      })
      const receipt = res?.data || res
      setCreatePOOpen(false)
      setPoPaymentType('credit')
      await fetchSupplierData()
      if (receipt?.id) {
        // Cache uuid for this PO
        if (receipt.uuid) {
          try {
            const cache = JSON.parse(localStorage.getItem('po_uuid_cache') || '{}')
            cache[String(receipt.id)] = receipt.uuid
            localStorage.setItem('po_uuid_cache', JSON.stringify(cache))
          } catch {}
        }
        navigate(`/purchase-orders/${receipt.id}`, { state: { uuid: receipt.uuid, supplierName: supplier?.name || supplier?.business_name || '' } })
      }
    } catch (err) {
      setPoError(err.message || 'Failed to create purchase order')
    } finally {
      setPoSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading supplier…</p>
        </div>
      </div>
    )
  }

  if (error && !supplier) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border border-red-100 shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Building2 className="text-red-500" size={28} />
          </div>
          <p className="text-red-700 font-medium mb-6">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/suppliers')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Suppliers
          </button>
        </div>
      </div>
    )
  }

  const totalSupplied = Number(supplier?.value_supplied) || 0
  const debtOwing = Number(supplier?.debt_owing) || 0
  const rawPoCount = Number(supplier?.purchase_order_count)
  const poCount = Number.isInteger(rawPoCount) && !isNaN(rawPoCount) ? rawPoCount : purchaseOrders.length

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
      <div className="px-4 sm:px-6 py-8">
        <button
          type="button"
          onClick={() => navigate('/suppliers')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Suppliers
        </button>

        {/* Hero */}
        <div className="relative bg-white rounded-lg shadow-lg shadow-slate-200/60 border border-slate-100 overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-primary-600/5 pointer-events-none" />
          <div className="relative px-6 sm:px-8 py-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Building2 size={28} strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight truncate">
                    {supplier?.name}
                  </h1>
                  <button
                    type="button"
                    onClick={openEditModal}
                    className="shrink-0 p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    title="Edit supplier"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
                {(supplier?.phone1 || supplier?.email || supplier?.location) && (
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
                    {supplier?.phone1 && (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone size={14} />
                        {supplier.phone1}
                      </span>
                    )}
                    {supplier?.phone2 && (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone size={14} />
                        {supplier.phone2}
                      </span>
                    )}
                    {supplier?.email && (
                      <span className="inline-flex items-center gap-1.5 truncate">
                        <Mail size={14} />
                        {supplier.email}
                      </span>
                    )}
                    {supplier?.location && (
                      <span className="inline-flex items-center gap-1.5 truncate">
                        <MapPin size={14} />
                        {supplier.location}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Supplier modal */}
        {editOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => !editSubmitting && setEditOpen(false)}>
            <div className="bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-y-auto" style={{ maxWidth: '50vw', minWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
              <div className="px-8 py-5 border-b flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <Pencil size={22} className="text-primary-500" />
                  Edit Supplier
                </h3>
                <button type="button" onClick={() => !editSubmitting && setEditOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleEditSupplier}>
                <div className="px-8 py-8 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Supplier Name *</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Supplier name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone 1</label>
                      <input
                        type="text"
                        value={editForm.phone1}
                        onChange={(e) => setEditForm((f) => ({ ...f, phone1: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone 2</label>
                      <input
                        type="text"
                        value={editForm.phone2}
                        onChange={(e) => setEditForm((f) => ({ ...f, phone2: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Phone number (optional)"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Address / location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g. Sells shoes, drinks and schnapps"
                    />
                  </div>
                  {editError && <p className="text-sm text-red-600">{editError}</p>}
                </div>
                <div className="px-8 py-5 border-t bg-slate-50 rounded-b-xl flex gap-3 justify-end">
                  <button type="button" onClick={() => !editSubmitting && setEditOpen(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-white">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="px-5 py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {editSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <FileText className="text-primary-600" size={20} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Purchase orders
              </span>
            </div>
            <p className="text-slate-900 font-bold text-2xl tabular-nums">{poCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Package className="text-emerald-600" size={20} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total supplied
              </span>
            </div>
            <p className="text-emerald-700 font-bold text-xl tabular-nums">₵{formatMoney(totalSupplied)}</p>
          </div>
          <div className="bg-white rounded-xl border border-amber-100 p-6 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-amber-50/50 to-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <CreditCard className="text-amber-700" size={20} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700/80">
                Pending debt
              </span>
            </div>
            <p className="text-amber-800 font-bold text-xl tabular-nums">₵{formatMoney(debtOwing)}</p>
            <p className="text-xs text-slate-500 mt-1">To be paid to supplier</p>
            {debtOwing > 0 && (
              <button
                type="button"
                onClick={() => {
                  setPayModalOpen(true)
                  setPayAmount('')
                  setPayNotes('')
                  setPayError('')
                }}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                <Banknote size={16} />
                Pay debt
              </button>
            )}
          </div>
        </div>

        {/* Receive history / Purchase orders */}
        <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Package size={20} className="text-primary-500" />
              Receive History
            </h2>
            <button
              type="button"
              onClick={() => { setCreatePOOpen(true); setPoError(''); setPoPaymentType('credit') }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              <Plus size={16} />
              New Order
            </button>
          </div>
          {purchaseOrders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Package className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500 font-medium">No stock receipts yet.</p>
              <p className="text-sm text-slate-400 mt-1">Create a purchase order to start receiving stock from this supplier.</p>
              <button
                type="button"
                onClick={() => { setCreatePOOpen(true); setPoError(''); setPoPaymentType('credit') }}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
              >
                <Plus size={16} />
                Create Purchase Order
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {purchaseOrders.map((po) => {
                const poItems = po.items || []
                const total = Number(po.totalAmount) || Number(po.total_amount) || poItems.reduce((s, i) => s + (Number(i.quantity || 0) * Number(i.unitCost || i.unit_cost || 0)), 0)
                const itemCount = poItems.length
                const isPending = po.status === 'pending'
                const displayId = po.poNumber || po.po_number || `PO-${po.id}`
                const displayDate = po.date || po.created_at
                return (
                  <button
                    key={po.id}
                    type="button"
                    onClick={() => navigate(`/purchase-orders/${po.id}`, { state: { uuid: po.uuid, supplierName: supplier?.name || supplier?.business_name || '' } })}
                    className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-slate-900">{displayId}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {isPending ? 'Pending' : 'Received'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">
                        {displayDate ? new Date(displayDate).toLocaleDateString() : '—'}
                        {' · '}
                        {itemCount} item{itemCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="font-semibold text-primary-600">₵{formatMoney(total)}</span>
                      <ChevronRight className="text-slate-400" size={20} />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Debt payment history */}
        {debtPayments.length > 0 && (
          <div className="mt-8 bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <History size={20} className="text-slate-500" />
                Debt payment history
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {debtPayments.map((p) => (
                <div key={p.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-slate-900">₵{formatMoney(p.amount)}</span>
                    {p.notes && <p className="text-sm text-slate-500 mt-0.5">{p.notes}</p>}
                  </div>
                  <span className="text-sm text-slate-500">
                    {p.paid_at ? new Date(p.paid_at).toLocaleString() : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Purchase Order modal */}
        {createPOOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => !poSubmitting && setCreatePOOpen(false)}>
            <div className="bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-y-auto" style={{ maxWidth: '50vw', minWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
              <div className="px-8 py-5 border-b flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <Package size={22} className="text-primary-500" />
                  New Purchase Order
                </h3>
                <button type="button" onClick={() => !poSubmitting && setCreatePOOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                  <X size={20} />
                </button>
              </div>
              <div className="px-8 py-8 space-y-6">
                <div>
                  <p className="text-slate-600">Supplier: <span className="font-semibold text-slate-900 text-lg">{supplier?.name}</span></p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Payment Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPoPaymentType('credit')}
                      className={`px-5 py-5 rounded-xl border-2 font-medium transition-all ${
                        poPaymentType === 'credit'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <CreditCard size={24} className="mx-auto mb-2" />
                      Credit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPoPaymentType('full_payment')}
                      className={`px-5 py-5 rounded-xl border-2 font-medium transition-all ${
                        poPaymentType === 'full_payment'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Banknote size={24} className="mx-auto mb-2" />
                      Full Payment
                    </button>
                  </div>
                </div>
                {poError && <p className="text-sm text-red-600">{poError}</p>}
              </div>
              <div className="px-8 py-5 border-t bg-slate-50 rounded-b-xl flex gap-3 justify-end">
                <button type="button" onClick={() => !poSubmitting && setCreatePOOpen(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-white">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreatePO}
                  disabled={poSubmitting}
                  className="px-4 py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {poSubmitting ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : <><Plus size={16} /> Create Order</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pay debt modal */}
        {payModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => !paySubmitting && setPayModalOpen(false)}>
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Banknote size={22} className="text-amber-600" />
                  Pay debt
                </h3>
                <button type="button" onClick={() => !paySubmitting && setPayModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Current debt: <span className="font-semibold text-amber-700">₵{formatMoney(debtOwing)}</span>. Pay in full or enter an installment amount.
              </p>
              <form onSubmit={handlePayDebt}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₵)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={debtOwing}
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        placeholder="0.00"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setPayAmount(String(debtOwing))}
                        className="px-4 py-2 rounded-lg bg-amber-100 text-amber-800 font-medium text-sm hover:bg-amber-200"
                      >
                        Pay full
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
                    <textarea
                      value={payNotes}
                      onChange={(e) => setPayNotes(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="e.g. Bank transfer ref..."
                    />
                  </div>
                  {payError && <p className="text-sm text-red-600">{payError}</p>}
                </div>
                <div className="mt-6 flex gap-3 justify-end">
                  <button type="button" onClick={() => !paySubmitting && setPayModalOpen(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={paySubmitting} className="px-4 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 disabled:opacity-50">
                    {paySubmitting ? 'Recording…' : 'Record payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SupplierDetail
