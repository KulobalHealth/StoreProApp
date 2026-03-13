import React, { useState, useEffect, useMemo } from 'react'
import {
  Calendar,
  TrendingUp,
  DollarSign,
  CreditCard,
  FileText,
  X,
  Package,
  Eye,
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  ShoppingCart,
  ArrowUpDown,
  BarChart3,
  Receipt,
  User,
} from 'lucide-react'
import { listSales } from '../api/awoselDb.js'
import { getSessionBranchId } from '../utils/branch'

const SalesHistory = () => {
  const [sales, setSales] = useState([])
  const [summary, setSummary] = useState({ total_amount: 0, total_profit: 0, sale_count: 0, payment_methods: {} })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('today')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [month, setMonth] = useState(() => String(new Date().getMonth() + 1))
  const [year, setYear] = useState(() => String(new Date().getFullYear()))
  const [selectedSale, setSelectedSale] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 10

  /**
   * Build the date string to send to the API based on the active filter.
   * The backend endpoint is: /sales?branch_id=<uuid>&date=<YYYY-MM-DD>
   * For filters that cover a range (month, year, all) we fetch each day the
   * user picks; for "all" we omit the date param entirely.
   */
  const getQueryDate = () => {
    if (filter === 'today') return new Date().toISOString().slice(0, 10)
    if (filter === 'date') return date
    // For month / year / all we omit date so the backend returns everything,
    // and we do a lightweight client-side filter on the result.
    return undefined
  }

  const fetchSales = () => {
    const branchId = getSessionBranchId()
    if (!branchId) {
      setError('No branch selected. Please select a branch first.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    const queryDate = getQueryDate()
    const query = { branch_id: branchId }
    if (queryDate) query.date = queryDate
    listSales(query)
      .then(res => {
        const payload = res?.data || res
        let salesList = payload?.sales || (Array.isArray(payload) ? payload : [])

        // Client-side filter for month / year ranges (API returned all branch sales)
        if (filter === 'month') {
          salesList = salesList.filter(s => {
            if (!s.created_at) return false
            const d = new Date(s.created_at)
            return d.getFullYear() === Number(year) && (d.getMonth() + 1) === Number(month)
          })
        } else if (filter === 'year') {
          salesList = salesList.filter(s => {
            if (!s.created_at) return false
            return new Date(s.created_at).getFullYear() === Number(year)
          })
        }

        setSales(salesList)

        // Build summary
        const totalAmount = salesList.reduce((sum, s) => sum + (Number(s.total) || 0), 0)
        const totalProfit = salesList.reduce((sum, s) => sum + (Number(s.total_profit) || 0), 0)
        const methods = {}
        salesList.forEach(s => {
          const m = s.payment_method || 'Other'
          methods[m] = (methods[m] || 0) + (Number(s.total) || 0)
        })
        setSummary({ total_amount: totalAmount, total_profit: totalProfit, sale_count: salesList.length, payment_methods: methods })
        setCurrentPage(1)
      })
      .catch(err => {
        setError(err.message || 'Could not load sales')
        setSales([])
      })
      .finally(() => setLoading(false))
  }

  // Re-fetch whenever the filter criteria change
  useEffect(() => {
    fetchSales()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, date, month, year])

  const paymentEntries = Object.entries(summary.payment_methods || {}).filter(([, v]) => v > 0)

  // Unique payment methods for filter chips
  const paymentMethods = useMemo(() => {
    const methods = new Set()
    sales.forEach(s => { if (s.payment_method) methods.add(s.payment_method) })
    return Array.from(methods)
  }, [sales])

  // Filtered + sorted + searched sales
  const processedSales = useMemo(() => {
    let result = [...sales]
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      result = result.filter(s =>
        (s.receipt_number || '').toLowerCase().includes(q) ||
        (s.customer_name || '').toLowerCase().includes(q) ||
        (s.payment_method || '').toLowerCase().includes(q)
      )
    }
    if (paymentFilter !== 'all') {
      result = result.filter(s => (s.payment_method || '').toLowerCase() === paymentFilter.toLowerCase())
    }
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    else if (sortBy === 'oldest') result.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
    else if (sortBy === 'highest') result.sort((a, b) => (Number(b.total) || 0) - (Number(a.total) || 0))
    else if (sortBy === 'lowest') result.sort((a, b) => (Number(a.total) || 0) - (Number(b.total) || 0))
    return result
  }, [sales, searchTerm, paymentFilter, sortBy])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(processedSales.length / PAGE_SIZE))
  const paginatedSales = processedSales.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const startIndex = processedSales.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const endIndex = Math.min(currentPage * PAGE_SIZE, processedSales.length)

  const avgSale = summary.sale_count > 0 ? (Number(summary.total_amount) || 0) / summary.sale_count : 0
  const profitMargin = (Number(summary.total_amount) || 0) > 0
    ? ((Number(summary.total_profit) || 0) / (Number(summary.total_amount) || 0) * 100)
    : 0

  // Export CSV
  const handleExportCSV = () => {
    if (processedSales.length === 0) return
    const headers = ['Time', 'Receipt #', 'Customer', 'Items', 'Discount', 'Tax', 'Total', 'Profit', 'Payment']
    const csvRows = [
      headers.join(','),
      ...processedSales.map(sale => [
        sale.created_at ? new Date(sale.created_at).toLocaleString() : '',
        `"${sale.receipt_number || ''}"`,
        `"${(sale.customer_name || 'Walk-in').replace(/"/g, '""')}"`,
        (sale.items || []).length,
        (Number(sale.discount) || 0).toFixed(2),
        (Number(sale.tax) || 0).toFixed(2),
        (Number(sale.total) || 0).toFixed(2),
        (Number(sale.total_profit) || 0).toFixed(2),
        `"${sale.payment_method || ''}"`,
      ].join(','))
    ]
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `sales_history_${filter}_${new Date().toISOString().split('T')[0]}.csv`
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const periodLabel = (() => {
    if (filter === 'all') return 'All Time'
    if (filter === 'today') return 'Today'
    if (filter === 'date') return new Date(date + 'T00:00:00').toLocaleDateString(undefined, { dateStyle: 'medium' })
    if (filter === 'month') return new Date(Number(year), Number(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
    if (filter === 'year') return year
    return ''
  })()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-500 text-white">
                <BarChart3 size={18} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">Sales History</h1>
                <p className="text-gray-500 text-xs">Track sales, revenue, and profit analytics</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={fetchSales}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={16} className={`text-primary-500 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExportCSV}
                disabled={processedSales.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download size={16} className="text-primary-500" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <X size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Period Filter Chips */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-1.5 text-gray-500 mr-1">
              <Calendar size={14} />
              <span className="text-xs font-medium uppercase tracking-wider">Period:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'today', label: 'Today' },
                { key: 'date', label: 'By Date' },
                { key: 'month', label: 'By Month' },
                { key: 'year', label: 'By Year' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-all ${
                    filter === f.key
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
              {filter === 'date' && (
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              )}
              {filter === 'month' && (
                <div className="flex items-center gap-2">
                  <select
                    value={month}
                    onChange={e => setMonth(e.target.value)}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 bg-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="2020"
                    max="2035"
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  />
                </div>
              )}
              {filter === 'year' && (
                <input
                  type="number"
                  min="2020"
                  max="2035"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              )}
            </div>
          </div>
        </div>

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{summary.sale_count ?? 0}</p>
              </div>
              <ShoppingCart className="text-primary-500" size={20} />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</p>
                <p className="text-2xl font-bold text-primary-500 mt-1">₵{(Number(summary.total_amount) || 0).toFixed(2)}</p>
              </div>
              <DollarSign className="text-primary-500" size={20} />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">₵{(Number(summary.total_profit) || 0).toFixed(2)}</p>
              </div>
              <TrendingUp className="text-emerald-500" size={20} />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Sale</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₵{avgSale.toFixed(2)}</p>
              </div>
              <BarChart3 className="text-primary-500" size={20} />
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 bg-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white/80 uppercase tracking-wider">Margin</p>
                <p className="text-2xl font-bold text-white mt-1">{profitMargin.toFixed(1)}%</p>
              </div>
              <TrendingUp className="text-white/80" size={20} />
            </div>
          </div>
        </div>

        {/* Payment Breakdown */}
        {paymentEntries.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-2.5">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <CreditCard size={14} className="text-primary-500" />
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Breakdown — {periodLabel}</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {paymentEntries.map(([method, amount]) => (
                  <div
                    key={method}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-md border border-gray-100"
                  >
                    <span className="text-xs font-medium text-gray-600 capitalize">{method}</span>
                    <span className="text-xs font-bold text-gray-900">₵{Number(amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search, Filter, and Sort */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by receipt #, customer, or payment method..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-gray-900 bg-white appearance-none text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Total</option>
                <option value="lowest">Lowest Total</option>
              </select>
            </div>
          </div>
          {paymentMethods.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-gray-500 mr-1">
                <Filter size={14} />
                <span className="text-xs font-medium">Payment:</span>
              </div>
              <button
                onClick={() => { setPaymentFilter('all'); setCurrentPage(1) }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-all ${
                  paymentFilter === 'all'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-sm text-[10px] font-bold ${
                  paymentFilter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
                }`}>{sales.length}</span>
              </button>
              {paymentMethods.map(method => {
                const count = sales.filter(s => (s.payment_method || '').toLowerCase() === method.toLowerCase()).length
                return (
                  <button
                    key={method}
                    onClick={() => { setPaymentFilter(method); setCurrentPage(1) }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-all capitalize ${
                      paymentFilter.toLowerCase() === method.toLowerCase()
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                    }`}
                  >
                    {method}
                    <span className={`ml-0.5 px-1.5 py-0.5 rounded-sm text-[10px] font-bold ${
                      paymentFilter.toLowerCase() === method.toLowerCase()
                        ? 'bg-white/20 text-white'
                        : 'bg-primary-100 text-primary-600'
                    }`}>{count}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Loading sales...</p>
            </div>
          ) : processedSales.length === 0 ? (
            <div className="py-20 text-center">
              <Receipt size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 font-medium">No sales found</p>
              <p className="text-gray-500 text-sm mt-1">
                {searchTerm || paymentFilter !== 'all'
                  ? 'Try adjusting your filters or search query'
                  : 'No transactions recorded for the selected period'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-900 text-white">
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Time</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Receipt #</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Customer</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Items</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Discount</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Tax</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Total</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Profit</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Payment</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedSales.map((sale) => (
                      <tr
                        key={sale.id}
                        className="hover:bg-primary-50/40 transition-colors group"
                      >
                        <td className="py-3 px-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Clock size={13} className="text-gray-400 shrink-0" />
                            {sale.created_at
                              ? new Date(sale.created_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
                              : '—'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-semibold text-gray-900">{sale.receipt_number || '—'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <User size={13} className="text-gray-400 shrink-0" />
                            <span className="text-sm text-gray-700">{sale.customer_name || 'Walk-in'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold">
                            {(sale.items || []).length}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-orange-600 font-medium">
                          {(Number(sale.discount) || 0) > 0 ? `-₵${(Number(sale.discount) || 0).toFixed(2)}` : '—'}
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-gray-500">
                          {(Number(sale.tax) || 0) > 0 ? `₵${(Number(sale.tax) || 0).toFixed(2)}` : '—'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-bold text-gray-900">₵{(Number(sale.total) || 0).toFixed(2)}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-semibold text-emerald-600">₵{(Number(sale.total_profit) || 0).toFixed(2)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2.5 py-1 rounded-sm text-xs font-semibold capitalize ${
                            (sale.payment_method || '').toLowerCase() === 'cash'
                              ? 'bg-emerald-50 text-emerald-700'
                              : (sale.payment_method || '').toLowerCase() === 'mobile money' || (sale.payment_method || '').toLowerCase() === 'momo'
                                ? 'bg-amber-50 text-amber-700'
                                : (sale.payment_method || '').toLowerCase() === 'card'
                                  ? 'bg-primary-50 text-primary-700'
                                  : 'bg-gray-100 text-gray-700'
                          }`}>
                            {sale.payment_method || '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedSale(sale)}
                            title="View details"
                            className="inline-flex items-center justify-center p-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors opacity-70 group-hover:opacity-100"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                <p className="text-xs text-gray-500">
                  Showing <span className="font-semibold text-gray-700">{startIndex}</span>–<span className="font-semibold text-gray-700">{endIndex}</span> of{' '}
                  <span className="font-semibold text-gray-700">{processedSales.length}</span> sales
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce((acc, p, i, arr) => {
                      if (i > 0 && p - arr[i - 1] > 1) acc.push('...')
                      acc.push(p)
                      return acc
                    }, [])
                    .map((p, i) =>
                      p === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-xs">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p)}
                          className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                            currentPage === p
                              ? 'bg-primary-500 text-white shadow-sm'
                              : 'border border-gray-200 hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sale Detail Modal */}
        {selectedSale && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedSale(null)}
          >
            <div
              className="bg-white rounded-xl w-full max-w-5xl max-h-[92vh] min-h-[400px] flex flex-col shadow-2xl border border-gray-200 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center">
                    <Receipt size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Sale Details</h2>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {selectedSale.receipt_number || '—'} · {selectedSale.created_at ? new Date(selectedSale.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Summary Strip */}
              <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-x-8 gap-y-2 text-sm shrink-0">
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Customer</p>
                  <p className="text-gray-900 font-medium">{selectedSale.customer_name || 'Walk-in'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Payment</p>
                  <p className="text-gray-900 font-medium capitalize">{selectedSale.payment_method || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Subtotal</p>
                  <p className="text-gray-900 font-medium">₵{(Number(selectedSale.subtotal) || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Discount</p>
                  <p className="text-orange-600 font-medium">-₵{(Number(selectedSale.discount) || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Tax</p>
                  <p className="text-gray-700 font-medium">₵{(Number(selectedSale.tax) || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Total</p>
                  <p className="text-primary-500 font-bold text-base">₵{(Number(selectedSale.total) || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Profit</p>
                  <p className="text-emerald-600 font-bold">₵{(Number(selectedSale.total_profit) || 0).toFixed(2)}</p>
                </div>
              </div>

              {/* Modal Line Items */}
              <div className="flex-1 min-h-0 overflow-auto p-6">
                <h3 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <Package size={16} className="text-primary-500" /> Line Items ({(selectedSale.items || []).length})
                </h3>
                {(selectedSale.items || []).length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">No items recorded.</p>
                ) : (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[640px]">
                        <thead>
                          <tr className="bg-gray-900 text-white text-xs font-semibold uppercase tracking-wider">
                            <th className="py-3 px-4 text-left">Product</th>
                            <th className="py-3 px-4 text-right w-16">Qty</th>
                            <th className="py-3 px-4 w-20 text-left">Unit</th>
                            <th className="py-3 px-4 text-right w-16">Pieces</th>
                            <th className="py-3 px-4 text-right">Price</th>
                            <th className="py-3 px-4 text-right">Cost</th>
                            <th className="py-3 px-4 text-right">Discount</th>
                            <th className="py-3 px-4 text-right">Line Total</th>
                            <th className="py-3 px-4 text-right">Profit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {(selectedSale.items || []).map((item, i) => (
                            <tr key={item.id || i} className="hover:bg-primary-50/30 transition-colors">
                              <td className="py-3 px-4 font-medium text-gray-900">
                                <div className="flex items-center gap-2">
                                  <Package size={14} className="text-primary-500 shrink-0" />
                                  {item.product_name || '—'}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right text-gray-700">{Number(item.quantity_sold)}</td>
                              <td className="py-3 px-4 text-gray-600">{item.unit_name || '—'}</td>
                              <td className="py-3 px-4 text-right text-gray-600">{item.quantity_in_pieces != null ? Number(item.quantity_in_pieces) : '—'}</td>
                              <td className="py-3 px-4 text-right text-gray-700 font-medium">₵{(Number(item.unit_price) || 0).toFixed(2)}</td>
                              <td className="py-3 px-4 text-right text-gray-500">₵{(Number(item.unit_cost) || 0).toFixed(2)}</td>
                              <td className="py-3 px-4 text-right text-orange-600">
                                {(Number(item.line_discount) || 0) > 0 ? `-₵${(Number(item.line_discount) || 0).toFixed(2)}` : '—'}
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-gray-900">₵{(Number(item.line_total) || 0).toFixed(2)}</td>
                              <td className="py-3 px-4 text-right font-semibold text-emerald-600">₵{(Number(item.line_profit) || 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SalesHistory
