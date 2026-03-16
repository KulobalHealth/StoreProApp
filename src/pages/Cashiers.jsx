import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getActiveBranch, getSessionBranchId } from '../utils/branch'
import { getCashierSales, listEmployees, listSales } from '../api/awoselDb.js'
import {
  Users, Search, Calendar, Wallet,
  ShoppingCart, Clock, Loader2, AlertTriangle,
  Receipt, BarChart3, CalendarDays, CalendarRange, Filter, LogOut,
  RefreshCw, X, ChevronDown, ChevronUp, CreditCard, Banknote,
  Smartphone, Package, ArrowUpRight, User, Hash, DollarSign
} from 'lucide-react'

const AVATAR_COLORS = [
  'from-primary-500 to-primary-700',
  'from-primary-400 to-primary-600',
  'from-orange-500 to-red-500',
  'from-primary-600 to-primary-800',
  'from-amber-500 to-orange-600',
  'from-primary-500 to-orange-600',
  'from-amber-400 to-primary-500',
  'from-orange-400 to-primary-600',
]

const PERIODS = [
  { key: 'today',  label: 'Today',      icon: Clock },
  { key: 'range',  label: 'Range',      icon: CalendarDays },
  { key: 'month',  label: 'This Month', icon: CalendarRange },
  { key: 'year',   label: 'This Year',  icon: Calendar },
  { key: 'custom', label: 'Date',       icon: Filter },
]

// ─── Cashier Detail Modal ─────────────────────────────────────────────────────
const CashierDetailModal = ({ cashier, branchId, period, customDate, rangeStart, rangeEnd, periodLabel, onClose }) => {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedSale, setExpandedSale] = useState(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const emp = cashier.employee
  const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Cashier'

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true)
      setError('')
      try {
        const query = { branch_id: branchId, user_id: cashier.userId }
        if (period === 'custom') query.date = customDate
        else if (period === 'range') { query.start_date = rangeStart; query.end_date = rangeEnd }
        else query.period = period

        const res = await listSales(query)
        const payload = res?.data || res
        let list = Array.isArray(payload) ? payload : (payload?.sales || [])

        // Client-side filter by cashier if backend doesn't support user_id param
        const cid = cashier.userId
        if (cid && list.length > 0) {
          const filtered = list.filter(s =>
            String(s.user_id || s.cashier_id || s.employee_id || '') === cid ||
            (s.cashier_name || s.cashier || '').toLowerCase() === fullName.toLowerCase()
          )
          if (filtered.length > 0) list = filtered
        }

        setSales(list)
      } catch (err) {
        setError(err.message || 'Could not load sales history')
      } finally {
        setLoading(false)
      }
    }
    fetchSales()
  }, [cashier.userId, branchId, period, customDate, rangeStart, rangeEnd])

  const stats = useMemo(() => {
    const totalRevenue  = sales.reduce((s, r) => s + Number(r.total || 0), 0)
    const totalProfit   = sales.reduce((s, r) => s + Number(r.total_profit || r.profit || 0), 0)
    const totalDiscount = sales.reduce((s, r) => s + Number(r.discount || 0), 0)
    const methods = {}
    sales.forEach(s => {
      const m = s.payment_method || 'Other'
      methods[m] = (methods[m] || 0) + Number(s.total || 0)
    })
    return { totalRevenue, totalProfit, totalDiscount, count: sales.length, methods }
  }, [sales])

  const processedSales = useMemo(() => {
    let list = [...sales]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        (s.receipt_number || '').toLowerCase().includes(q) ||
        (s.customer_name || s.customer || '').toLowerCase().includes(q) ||
        (s.payment_method || '').toLowerCase().includes(q)
      )
    }
    if (sortBy === 'newest')  list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    else if (sortBy === 'oldest')  list.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
    else if (sortBy === 'highest') list.sort((a, b) => Number(b.total || 0) - Number(a.total || 0))
    else if (sortBy === 'lowest')  list.sort((a, b) => Number(a.total || 0) - Number(b.total || 0))
    return list
  }, [sales, search, sortBy])

  const fmtCurrency = (v) => `GH₵${Number(v || 0).toFixed(2)}`
  const fmtDateTime = (d) => {
    if (!d) return '—'
    try { return new Date(d).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
    catch { return d }
  }

  const paymentIcon = (method) => {
    const m = (method || '').toLowerCase()
    if (m.includes('cash'))                        return <Banknote size={12} className="text-green-600" />
    if (m.includes('mobile') || m.includes('momo')) return <Smartphone size={12} className="text-blue-500" />
    if (m.includes('card') || m.includes('cheque') || m.includes('credit')) return <CreditCard size={12} className="text-purple-500" />
    return <DollarSign size={12} className="text-gray-500" />
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-3">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[98vw] h-[96vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg shadow-inner border-2 border-white/30 uppercase">
              {((emp.first_name || '')[0] || '') + ((emp.last_name || '')[0] || '') || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{fullName}</h2>
              <div className="flex items-center gap-3 mt-0.5">
                {emp.email && <span className="text-primary-100 text-xs">{emp.email}</span>}
                {emp.role  && <span className="bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">{emp.role}</span>}
              </div>
              <p className="text-primary-200 text-xs mt-1">Sales history · {periodLabel}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-2 border-b border-gray-200 bg-gray-50 shrink-0">
          {[
            { label: 'Total Revenue', value: fmtCurrency(stats.totalRevenue), color: 'text-primary-600', bg: 'bg-primary-50' },
            { label: 'Transactions',  value: stats.count,                     color: 'text-orange-600',  bg: 'bg-orange-50'  },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} px-5 py-4 border-r border-gray-200 last:border-r-0`}>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Payment breakdown */}
        {Object.keys(stats.methods).length > 0 && (
          <div className="px-6 py-3 flex items-center gap-3 border-b border-gray-100 bg-white shrink-0 flex-wrap">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">By payment:</span>
            {Object.entries(stats.methods).map(([method, amount]) => (
              <span key={method} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200">
                {paymentIcon(method)}{method}: {fmtCurrency(amount)}
              </span>
            ))}
            {stats.totalDiscount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold border border-red-100 ml-auto">
                Discounts: −{fmtCurrency(stats.totalDiscount)}
              </span>
            )}
          </div>
        )}

        {/* Search + Sort */}
        <div className="px-6 py-3 border-b border-gray-100 bg-white shrink-0 flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search receipt, customer, payment…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-gray-50" />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-gray-50 text-gray-700">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest amount</option>
            <option value="lowest">Lowest amount</option>
          </select>
          <span className="text-xs text-gray-500 shrink-0">{processedSales.length} transactions</span>
        </div>

        {/* Sales list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 size={32} className="animate-spin text-primary-500" />
              <p className="text-sm text-gray-500">Loading sales history…</p>
            </div>
          ) : error ? (
            <div className="mx-6 my-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertTriangle size={18} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          ) : processedSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <Receipt size={40} className="text-gray-300" />
              <p className="text-gray-500 font-medium">No sales found</p>
              <p className="text-xs text-gray-400">{search ? 'Try a different search.' : `No transactions for ${periodLabel}.`}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {processedSales.map((sale, idx) => {
                const saleId     = sale.id || sale.uuid || idx
                const isExpanded = expandedSale === saleId
                const items      = sale.items || sale.sale_items || []
                const customer   = sale.customer_name || sale.customer || null
                const receiptNo  = sale.receipt_number || sale.receipt_no || `#${idx + 1}`
                const total      = Number(sale.total || 0)
                const discount   = Number(sale.discount || 0)
                const tax        = Number(sale.tax || 0)

                return (
                  <div key={saleId} className="hover:bg-gray-50 transition-colors">
                    <button className="w-full px-6 py-4 flex items-center gap-4 text-left"
                      onClick={() => setExpandedSale(isExpanded ? null : saleId)}>

                      <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                        <Receipt size={16} className="text-primary-500" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{receiptNo}</span>
                          {customer && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                              <User size={11} />{customer}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{fmtDateTime(sale.created_at)}</p>
                      </div>

                      <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500 shrink-0">
                        <Package size={13} />{items.length} item{items.length !== 1 ? 's' : ''}
                      </div>

                      <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600 shrink-0">
                        {paymentIcon(sale.payment_method)}{sale.payment_method || 'N/A'}
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-900">{fmtCurrency(total)}</p>
                      </div>

                      <div className="text-gray-400 shrink-0 ml-1">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-6 pb-5 bg-gray-50 border-t border-gray-100">
                        <div className="pt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">

                          {/* Items table */}
                          <div className="lg:col-span-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <Package size={12} /> Items Sold
                            </p>
                            {items.length === 0 ? (
                              <p className="text-xs text-gray-400 italic">No item details available</p>
                            ) : (
                              <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">Product</th>
                                      <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500">Qty</th>
                                      <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500">Unit Price</th>
                                      <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {items.map((item, i) => {
                                      const itemName = item.product_name || item.name || item.itemName || 'Unknown'
                                      const qty      = Number(item.quantity || item.qty || 0)
                                      const unitPrice = Number(item.unit_price || item.unitPrice || item.price || 0)
                                      const extPrice  = Number(item.total_price || item.ext_price || item.extPrice || (unitPrice * qty) || 0)
                                      return (
                                        <tr key={i} className="hover:bg-gray-50">
                                          <td className="px-3 py-2.5 text-gray-800 font-medium text-xs">{itemName}</td>
                                          <td className="px-3 py-2.5 text-center text-gray-600 text-xs">{qty}</td>
                                          <td className="px-3 py-2.5 text-right text-gray-600 text-xs">{fmtCurrency(unitPrice)}</td>
                                          <td className="px-3 py-2.5 text-right font-semibold text-gray-900 text-xs">{fmtCurrency(extPrice)}</td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>

                          {/* Summary panel */}
                          <div className="space-y-3">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <Hash size={12} /> Transaction Summary
                            </p>
                            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                              {[
                                { label: 'Subtotal',    value: fmtCurrency(total + discount - tax), muted: true },
                                discount > 0 && { label: 'Discount',  value: `−${fmtCurrency(discount)}`, red: true },
                                tax > 0      && { label: 'Tax',        value: fmtCurrency(tax), muted: true },
                                { label: 'Total',       value: fmtCurrency(total), bold: true },
                                { label: 'Amount Paid', value: fmtCurrency(sale.amount_paid || total), muted: true },
                                sale.change_amount > 0 && { label: 'Change', value: fmtCurrency(sale.change_amount), muted: true },
                              ].filter(Boolean).map((row, i) => (
                                <div key={i} className={`flex justify-between px-3 py-2 ${row.bold ? 'bg-primary-50' : ''}`}>
                                  <span className={`text-xs ${row.bold ? 'font-bold text-gray-900' : 'text-gray-500'}`}>{row.label}</span>
                                  <span className={`text-xs font-semibold ${
                                    row.bold ? 'text-primary-700' : row.red ? 'text-red-600' : row.green ? 'text-green-600' : 'text-gray-700'
                                  }`}>{row.value}</span>
                                </div>
                              ))}
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 px-3 py-3 space-y-2">
                              <div className="flex items-center gap-2 text-xs">
                                {paymentIcon(sale.payment_method)}
                                <span className="text-gray-500">Payment:</span>
                                <span className="font-semibold text-gray-800">{sale.payment_method || 'N/A'}</span>
                              </div>
                              {customer && (
                                <div className="flex items-center gap-2 text-xs">
                                  <User size={12} className="text-gray-400" />
                                  <span className="text-gray-500">Customer:</span>
                                  <span className="font-semibold text-gray-800">{customer}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-xs">
                                <Clock size={12} className="text-gray-400" />
                                <span className="text-gray-500">Time:</span>
                                <span className="font-semibold text-gray-800">{fmtDateTime(sale.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
          <p className="text-xs text-gray-500">
            {stats.count} transaction{stats.count !== 1 ? 's' : ''} · {periodLabel}
          </p>
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Cashiers Page ───────────────────────────────────────────────────────
const Cashiers = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [cashierData, setCashierData]   = useState([])
  const [employees, setEmployees]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [searchTerm, setSearchTerm]     = useState('')
  const [period, setPeriod]             = useState('today')
  const [customDate, setCustomDate]     = useState(new Date().toISOString().split('T')[0])
  const [rangeStart, setRangeStart]     = useState(new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0])
  const [rangeEnd, setRangeEnd]         = useState(new Date().toISOString().split('T')[0])
  const [refreshing, setRefreshing]     = useState(false)
  const [selectedCashier, setSelectedCashier] = useState(null)
  const hasFetchedEmployees = useRef(false)

  const activeBranch = getActiveBranch()
  const branchId = activeBranch?.uuid || activeBranch?.id || getSessionBranchId()

  // Fetch employees once for name enrichment
  useEffect(() => {
    if (!branchId || hasFetchedEmployees.current) return
    hasFetchedEmployees.current = true
    listEmployees(branchId)
      .then(res => setEmployees(Array.isArray(res) ? res : (res?.data || [])))
      .catch(() => {})
  }, [branchId])

  const fetchCashierSales = useCallback(async (showRefresh = false) => {
    try {
      if (!branchId) { setError('No branch selected'); setLoading(false); return }
      if (showRefresh) setRefreshing(true)
      else setLoading(true)
      setError('')
      const today = new Date().toISOString().split('T')[0]
      const params = period === 'custom'
        ? { date: customDate }
        : period === 'range'
          ? { start_date: rangeStart, end_date: rangeEnd }
          : period === 'year'
            ? { start_date: `${new Date().getFullYear()}-01-01`, end_date: today }
            : { period }
      const res = await getCashierSales(branchId, params)
      const payload = res?.data || res
      const list = Array.isArray(payload) ? payload : (payload?.cashiers || payload?.sales || payload?.dashboard || [])
      setCashierData(list)
    } catch (err) {
      setError(err.message || 'Could not load cashier sales')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [branchId, period, customDate, rangeStart, rangeEnd])

  useEffect(() => { fetchCashierSales() }, [fetchCashierSales])

  const handleRefresh = () => fetchCashierSales(true)

  const employeeMap = useMemo(() => {
    const map = {}
    employees.forEach(e => {
      const key = String(e.uuid || e.id || '')
      if (key) map[key] = e
    })
    return map
  }, [employees])

  const cashierStats = useMemo(() => {
    return cashierData.map(row => {
      const userId    = String(row.id || row.user_id || row.employee_id || '')
      const emp       = employeeMap[userId] || {}
      const firstName = row.first_name || emp.first_name || row.name?.split(' ')[0] || emp.name?.split(' ')[0] || ''
      const lastName  = row.last_name  || emp.last_name  || row.name?.split(' ').slice(1).join(' ') || emp.name?.split(' ').slice(1).join(' ') || ''
      const email     = row.email || emp.email || ''
      const phone     = row.phone || emp.phone || ''
      const role      = row.role  || emp.role  || 'sales'
      const employee  = { uuid: userId, id: userId, first_name: firstName, last_name: lastName, email, phone, role }
      return {
        userId,
        employee,
        totalSales:  Number(row.total_sold || row.total_sales || row.total || 0),
        totalCount:  Number(row.sales_count || row.total_transactions || row.count || 0),
        totalProfit: Number(row.total_profit || row.profit || 0),
      }
    })
  }, [cashierData, employeeMap])

  const filteredCashiers = useMemo(() => {
    let result = cashierStats
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      result = result.filter(c => {
        const name = `${c.employee.first_name || ''} ${c.employee.last_name || ''}`.toLowerCase()
        return name.includes(q) || (c.employee.email || '').toLowerCase().includes(q)
      })
    }
    return [...result].sort((a, b) => b.totalSales - a.totalSales)
  }, [cashierStats, searchTerm])

  const summaryTotals = useMemo(() =>
    filteredCashiers.reduce((acc, c) => {
      acc.sales += c.totalSales; acc.count += c.totalCount; acc.profit += c.totalProfit; return acc
    }, { sales: 0, count: 0, profit: 0 }),
  [filteredCashiers])

  const getInitials = (emp) => {
    const f = (emp.first_name || '')[0] || ''
    const l = (emp.last_name  || '')[0] || ''
    return (f + l).toUpperCase() || 'U'
  }

  const formatCurrency = (val) => val >= 1000 ? 'GH₵' + (val / 1000).toFixed(1) + 'k' : 'GH₵' + val.toFixed(2)
  const fmtDate        = (d)   => new Date(d + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

  const periodLabel = period === 'custom'
    ? fmtDate(customDate)
    : period === 'range'
      ? `${fmtDate(rangeStart)} – ${fmtDate(rangeEnd)}`
      : (PERIODS.find(p => p.key === period)?.label || 'This Month')

  const SkeletonCard = () => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="px-5 py-4 flex items-center gap-4 border-b border-gray-100">
        <div className="w-12 h-12 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-2/3" />
          <div className="h-2.5 bg-gray-100 rounded w-1/2" />
        </div>
        <div className="h-5 w-16 bg-gray-100 rounded-full" />
      </div>
      <div className="px-5 py-4 grid grid-cols-3 gap-3">
        {[0,1,2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-500 text-white">
              <Wallet size={18} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">Cashiers</h1>
              <p className="text-gray-500 text-xs">
                {activeBranch?.name ? `${activeBranch.name} — ` : ''}{periodLabel} · click a card to view details
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} disabled={refreshing}
              className="p-2 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors disabled:opacity-50" title="Refresh">
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => { logout(); navigate('/login') }}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 space-y-5">
        {/* Period tabs */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 p-1" style={{ borderRadius: '5px' }}>
          {PERIODS.map(p => {
            const Icon = p.icon
            const isActive = period === p.key
            return (
              <button key={p.key} onClick={() => setPeriod(p.key)}
                style={{ borderRadius: '3px' }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all ${
                  isActive ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                }`}>
                <Icon size={14} />
                <span className="hidden sm:inline">{p.label}</span>
              </button>
            )
          })}
        </div>

        {period === 'range' && (
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-fit">
            <CalendarDays size={13} className="text-primary-500 shrink-0" />
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">From</span>
            <input type="date" value={rangeStart} onChange={e => setRangeStart(e.target.value)} max={rangeEnd}
              className="text-xs text-gray-700 border-0 outline-none bg-transparent cursor-pointer" />
            <span className="text-gray-300 text-xs">—</span>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">To</span>
            <input type="date" value={rangeEnd} onChange={e => setRangeEnd(e.target.value)} min={rangeStart} max={new Date().toISOString().split('T')[0]}
              className="text-xs text-gray-700 border-0 outline-none bg-transparent cursor-pointer" />
          </div>
        )}

        {period === 'custom' && (
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-fit">
            <Calendar size={13} className="text-primary-500 shrink-0" />
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Date</span>
            <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)} max={new Date().toISOString().split('T')[0]}
              className="text-xs text-gray-700 border-0 outline-none bg-transparent cursor-pointer" />
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: <span className="text-lg font-bold text-primary-600">₵</span>, bg: 'bg-primary-100', label: 'Total revenue', value: `GH₵${summaryTotals.sales.toFixed(2)}`, badge: periodLabel, badgeColor: 'text-primary-600 bg-primary-50' },
            { icon: <Receipt size={20} className="text-orange-600" />, bg: 'bg-orange-100', label: `${periodLabel} sales count`, value: summaryTotals.count, badge: 'Transactions', badgeColor: 'text-orange-600 bg-orange-50' },
            { icon: <Users size={20} className="text-amber-600" />, bg: 'bg-amber-100', label: 'Cashiers with sales', value: <>{filteredCashiers.filter(c => c.totalCount > 0).length}<span className="text-base font-medium text-gray-400">/{filteredCashiers.length}</span></>, badge: 'Active', badgeColor: 'text-amber-600 bg-amber-50' },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>{card.icon}</div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${card.badgeColor}`}>{card.badge}</span>
              </div>
              <p className={`text-2xl font-bold ${card.valueColor || 'text-gray-900'}`}>{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search cashiers by name or email…" value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {refreshing && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" /> Refreshing…
          </div>
        )}

        {/* Cards grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[0,1,2,3,4,5].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filteredCashiers.length === 0 ? (
          <div className="text-center py-16">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">No cashiers found</h3>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm ? 'Try a different search term.' : `No cashier sales for ${periodLabel.toLowerCase()}.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredCashiers.map((cashier, idx) => {
              const emp       = cashier.employee
              const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length]
              const rank       = idx + 1

              return (
                <div
                  key={cashier.userId || emp.uuid || idx}
                  onClick={() => setSelectedCashier(cashier)}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary-300 transition-all duration-200 cursor-pointer group"
                >
                  {/* Card header */}
                  <div className="px-5 py-4 flex items-center gap-4 border-b border-gray-100">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                        {getInitials(emp)}
                      </div>
                      {rank <= 3 && cashier.totalCount > 0 && (
                        <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow ${
                          rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-gray-400' : 'bg-amber-700'
                        }`}>{rank}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                        {emp.first_name || ''} {emp.last_name || ''}
                      </h3>
                      {emp.email && <p className="text-xs text-gray-500 truncate">{emp.email}</p>}
                    </div>
                    {cashier.totalCount > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        {cashier.totalCount} sale{cashier.totalCount !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 rounded-full bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-wider border border-gray-200">No Sales</span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="px-5 py-4">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">{periodLabel} Performance</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-primary-50 rounded-lg px-4 py-3">
                        <p className="text-[10px] text-gray-500 font-medium mb-1">Revenue</p>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(cashier.totalSales)}</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg px-4 py-3">
                        <p className="text-[10px] text-gray-500 font-medium mb-1">Sales</p>
                        <p className="text-lg font-bold text-gray-900">{cashier.totalCount}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer row */}
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
                    <span className="text-[10px] text-primary-500 font-semibold group-hover:underline flex items-center gap-1">
                      <ArrowUpRight size={11} /> View details
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedCashier && (
        <CashierDetailModal
          cashier={selectedCashier}
          branchId={branchId}
          period={period}
          customDate={customDate}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          periodLabel={periodLabel}
          onClose={() => setSelectedCashier(null)}
        />
      )}
    </div>
  )
}

export default Cashiers
