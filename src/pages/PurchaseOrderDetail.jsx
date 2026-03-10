import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Package, CheckCircle2, Clock, Truck, Calendar, Hash, Layers } from 'lucide-react'
import { getReceipt, receiveReceipt } from '../api/awoselDb.js'
import { getSessionBranchId, getSessionOrgId } from '../utils/branch.js'

const PurchaseOrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [receiving, setReceiving] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError('')
    getReceipt(id)
      .then((data) => setReceipt(data))
      .catch((err) => {
        setError(err.message || 'Could not load purchase order')
        setReceipt(null)
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleReceive = async () => {
    if (!receipt?.id || receipt.received_at) return
    setReceiving(true)
    setError('')
    try {
      await receiveReceipt({ id: receipt.id, branchId: getSessionBranchId(), organizationId: getSessionOrgId() })
      setReceipt((prev) => (prev ? { ...prev, received_at: new Date().toISOString(), status: 'received' } : null))
    } catch (err) {
      setError(err.message || 'Could not receive order')
    } finally {
      setReceiving(false)
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
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
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
        <div className="relative bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-primary-600/5 pointer-events-none" />
          <div className="relative px-6 sm:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <FileText size={28} strokeWidth={2} />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    Purchase Order #{receipt?.id}
                  </h1>
                  <p className="text-slate-500 mt-1 flex items-center gap-1.5">
                    <Calendar size={14} />
                    {formatDate(receipt?.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                {isPending ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-100 text-amber-800 border border-amber-200/80 shadow-sm">
                    <Clock size={18} />
                    Pending
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200/80 shadow-sm">
                    <CheckCircle2 size={18} />
                    Received
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Truck className="text-slate-600" size={20} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Supplier</span>
            </div>
            <p className="text-slate-900 font-semibold truncate" title={receipt?.supplier_name}>
              {receipt?.supplier_name || '—'}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <Layers className="text-primary-600" size={20} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Line items</span>
            </div>
            <p className="text-slate-900 font-bold text-lg">{items.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <Hash className="text-primary-600" size={20} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total units</span>
            </div>
            <p className="text-slate-900 font-bold text-lg">{totalQty}</p>
          </div>
          <div className="bg-white rounded-xl border border-primary-100 p-5 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-primary-50/50 to-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <Package className="text-primary-600" size={20} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-600/80">Total amount</span>
            </div>
            <p className="text-primary-700 font-bold text-xl">₵{formatMoney(totalAmount)}</p>
          </div>
        </div>

        {/* Line items */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Package size={20} className="text-primary-500" />
              Line items
            </h2>
          </div>
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
      </div>
    </div>
  )
}

export default PurchaseOrderDetail
