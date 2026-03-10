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
} from 'lucide-react'
import { getSupplier, listReceipts, listDebtPayments, postDebtPayment } from '../api/awoselDb.js'
import { getSessionBranchId } from '../utils/branch.js'

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

  const fetchSupplierData = () => {
    if (!id) return
    return Promise.all([
      getSupplier(id),
      listReceipts(getSessionBranchId(), { supplier_id: id }),
      listDebtPayments(id),
    ]).then(([supplierData, poList, payments]) => {
      setSupplier(supplierData)
      setPurchaseOrders(Array.isArray(poList) ? poList : [])
      setDebtPayments(Array.isArray(payments) ? payments : [])
    })
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
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <button
          type="button"
          onClick={() => navigate('/suppliers')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Suppliers
        </button>

        {/* Hero */}
        <div className="relative bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-primary-600/5 pointer-events-none" />
          <div className="relative px-6 sm:px-8 py-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Building2 size={28} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight truncate">
                  {supplier?.name}
                </h1>
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

        {/* Purchase orders list */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <FileText size={20} className="text-primary-500" />
              Purchase orders
            </h2>
          </div>
          {purchaseOrders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500 font-medium">No purchase orders yet.</p>
              <button
                type="button"
                onClick={() => navigate('/inventory')}
                className="mt-4 text-primary-600 font-medium hover:underline"
              >
                Create one from Inventory →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {purchaseOrders.map((po) => {
                const total = Number(po.totalAmount) || 0
                const isPending = po.status === 'pending'
                return (
                  <button
                    key={po.id}
                    type="button"
                    onClick={() => navigate(`/purchase-orders/${po.id}`)}
                    className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-900">{po.poNumber || `PO-${po.id}`}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {isPending ? 'Pending' : 'Received'}
                      </span>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {po.date ? new Date(po.date).toLocaleDateString() : (po.created_at ? new Date(po.created_at).toLocaleDateString() : '—')}
                        {' · '}
                        {(po.items || []).length} item(s)
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
          <div className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
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

        {/* Pay debt modal */}
        {payModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => !paySubmitting && setPayModalOpen(false)}>
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
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
