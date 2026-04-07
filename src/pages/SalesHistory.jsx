import React, { useState, useEffect, useMemo, useCallback, useDeferredValue, useRef } from 'react'
import Tooltip from '../components/Tooltip'
import { HIcon } from '../components/HIcon'
import {
  Analytics02Icon,
  ArrowLeft01Icon,
  ArrowMoveUpRightIcon,
  ArrowRight01Icon,
  ArrowUpDownIcon,
  Calendar01Icon,
  Cancel01Icon,
  Clock01Icon,
  CreditCardIcon,
  DollarCircleIcon,
  Download01Icon,
  FileValidationIcon,
  FilterIcon,
  Package01Icon,
  ReceiptTextIcon,
  RefreshIcon,
  Search01Icon,
  ShoppingCart01Icon,
  UserIcon,
  ViewIcon,
} from '@hugeicons/core-free-icons'
import { listSales } from '../api/awoselDb.js'
import { getSessionBranchId } from '../utils/branch'

const getSaleDateValue = (sale) => sale?.created_at || sale?.createdAt || sale?.date || sale?.timestamp || null

const toIsoDate = (value) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString().slice(0, 10)
}

const normalizeSale = (sale) => {
  const saleDate = getSaleDateValue(sale)
  const saleTimestamp = saleDate ? new Date(saleDate).getTime() : 0
  const receiptNumber = sale.receipt_number || sale.receiptNumber || ''
  const customerName = sale.customer_name || sale.customerName || sale.customer || 'Walk-in'
  const paymentMethod = sale.payment_method || sale.paymentMethod || 'Other'
  const paymentMethodLower = paymentMethod.toLowerCase()
  const items = Array.isArray(sale.items) ? sale.items : []

  return {
    ...sale,
    _saleDate: saleDate,
    _saleTimestamp: saleTimestamp,
    _receiptNumber: receiptNumber,
    _customerName: customerName,
    _paymentMethod: paymentMethod,
    _paymentMethodLower: paymentMethodLower,
    _itemCount: items.length,
    _searchText: `${receiptNumber} ${customerName} ${paymentMethod}`.toLowerCase(),
  }
}

const buildSummary = (salesList) => {
  let totalAmount = 0
  let totalProfit = 0
  const paymentMethods = {}
  const paymentMethodCounts = {}

  for (const sale of salesList) {
    const total = Number(sale.total) || 0
    const totalProfitValue = Number(sale.total_profit) || 0
    const paymentMethod = sale._paymentMethod || sale.payment_method || 'Other'

    totalAmount += total
    totalProfit += totalProfitValue
    paymentMethods[paymentMethod] = (paymentMethods[paymentMethod] || 0) + total
    paymentMethodCounts[paymentMethod] = (paymentMethodCounts[paymentMethod] || 0) + 1
  }

  return {
    total_amount: totalAmount,
    total_profit: totalProfit,
    sale_count: salesList.length,
    payment_methods: paymentMethods,
    payment_method_counts: paymentMethodCounts,
  }
}

const SalesHistory = () => {
  const [sales, setSales] = useState([])
  const [summary, setSummary] = useState({ total_amount: 0, total_profit: 0, sale_count: 0, payment_methods: {}, payment_method_counts: {} })
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
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const salesCacheRef = useRef(new Map())
  const fetchRequestIdRef = useRef(0)

  const getQueryParams = () => {
    const today = new Date()

    if (filter === 'today') {
      return { date: toIsoDate(today) }
    }

    if (filter === 'date') {
      return { date }
    }

    if (filter === 'month') {
      return {
        year,
        month,
      }
    }

    if (filter === 'year') {
      return {
        year,
      }
    }

    if (filter === 'all') {
      return {
        start_date: '2000-01-01',
        end_date: toIsoDate(today),
      }
    }

    return {}
  }

  const fetchSales = useCallback((options = {}) => {
    const { forceRefresh = false } = options
    // Always use the branch UUID — backend expects UUID in branch_id param
    const branchId = getSessionBranchId()
    if (!branchId) {
      setError('No branch selected. Please select a branch first.')
      setLoading(false)
      return
    }
    const query = { branch_id: branchId }
    Object.assign(query, getQueryParams())
    const queryKey = JSON.stringify(query)

    if (!forceRefresh && salesCacheRef.current.has(queryKey)) {
      const cached = salesCacheRef.current.get(queryKey)
      setSales(cached.sales)
      setSummary(cached.summary)
      setError('')
      setLoading(false)
      setCurrentPage(1)
      return
    }

    const requestId = ++fetchRequestIdRef.current
    setLoading(true)
    setError('')

    listSales(query)
      .then(res => {
        if (requestId !== fetchRequestIdRef.current) return
        const payload = res?.data || res
        let salesList = payload?.sales || (Array.isArray(payload) ? payload : [])

        // Client-side filter as a fallback in case backend range filtering is incomplete.
        if (filter === 'month') {
          salesList = salesList.filter(s => {
            const saleDate = getSaleDateValue(s)
            if (!saleDate) return false
            const d = new Date(saleDate)
            return d.getFullYear() === Number(year) && (d.getMonth() + 1) === Number(month)
          })
        } else if (filter === 'year') {
          salesList = salesList.filter(s => {
            const saleDate = getSaleDateValue(s)
            if (!saleDate) return false
            return new Date(saleDate).getFullYear() === Number(year)
          })
        } else if (filter === 'date') {
          salesList = salesList.filter(s => {
            const saleDate = getSaleDateValue(s)
            return saleDate ? toIsoDate(saleDate) === date : false
          })
        } else if (filter === 'today') {
          const todayDate = toIsoDate(new Date())
          salesList = salesList.filter(s => {
            const saleDate = getSaleDateValue(s)
            return saleDate ? toIsoDate(saleDate) === todayDate : false
          })
        }

        const normalizedSales = salesList.map(normalizeSale)
        const nextSummary = buildSummary(normalizedSales)

        salesCacheRef.current.set(queryKey, {
          sales: normalizedSales,
          summary: nextSummary,
        })

        setSales(normalizedSales)
        setSummary(nextSummary)
        setCurrentPage(1)
      })
      .catch(err => {
        if (requestId !== fetchRequestIdRef.current) return
        setError(err.message || 'Could not load sales')
        setSales([])
      })
      .finally(() => {
        if (requestId === fetchRequestIdRef.current) {
          setLoading(false)
        }
      })
  }, [filter, date, month, year])

  // Re-fetch whenever the filter criteria change
  useEffect(() => {
    fetchSales()
  }, [filter, date, month, year])

  const paymentEntries = useMemo(
    () => Object.entries(summary.payment_methods || {}).filter(([, value]) => value > 0),
    [summary.payment_methods],
  )

  // Unique payment methods for filter chips
  const paymentMethods = useMemo(() => {
    return Object.keys(summary.payment_method_counts || {})
  }, [summary.payment_method_counts])

  // Filtered + sorted + searched sales
  const processedSales = useMemo(() => {
    let result = [...sales]
    if (deferredSearchTerm.trim()) {
      const query = deferredSearchTerm.toLowerCase().trim()
      result = result.filter(sale => sale._searchText.includes(query))
    }
    if (paymentFilter !== 'all') {
      const normalizedPaymentFilter = paymentFilter.toLowerCase()
      result = result.filter(sale => sale._paymentMethodLower === normalizedPaymentFilter)
    }
    if (sortBy === 'newest') result.sort((a, b) => b._saleTimestamp - a._saleTimestamp)
    else if (sortBy === 'oldest') result.sort((a, b) => a._saleTimestamp - b._saleTimestamp)
    else if (sortBy === 'highest') result.sort((a, b) => (Number(b.total) || 0) - (Number(a.total) || 0))
    else if (sortBy === 'lowest') result.sort((a, b) => (Number(a.total) || 0) - (Number(b.total) || 0))
    return result
  }, [sales, deferredSearchTerm, paymentFilter, sortBy])

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
        sale._saleDate ? new Date(sale._saleDate).toLocaleString() : '',
        `"${sale._receiptNumber || ''}"`,
        `"${(sale._customerName || 'Walk-in').replace(/"/g, '""')}"`,
        sale._itemCount,
        (Number(sale.discount) || 0).toFixed(2),
        (Number(sale.tax) || 0).toFixed(2),
        (Number(sale.total) || 0).toFixed(2),
        (Number(sale.total_profit) || 0).toFixed(2),
        `"${sale._paymentMethod || ''}"`,
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
    <div className="min-h-full bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-500 text-white">
                <HIcon icon={Analytics02Icon} size={18} strokeWidth={2}  />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">Sales History</h1>
                <p className="text-gray-500 text-xs">Track sales, revenue, and profit analytics</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Tooltip text="Reload sales data from the server">
                <button
                  onClick={() => fetchSales({ forceRefresh: true })}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <HIcon icon={RefreshIcon} size={16} className={`text-primary-500 ${loading ? 'animate-spin' : ''}`}  />
                  Refresh
                </button>
              </Tooltip>
              <Tooltip text="Download all visible sales as a CSV file">
                <button
                  onClick={handleExportCSV}
                  disabled={processedSales.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <HIcon icon={Download01Icon} size={16} className="text-primary-500"  />
                  Export CSV
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <HIcon icon={Cancel01Icon} size={16} className="shrink-0"  />
            {error}
          </div>
        )}

        {/* Period Filter Chips */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-1.5 text-gray-500 mr-1">
              <HIcon icon={Calendar01Icon} size={14}  />
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
              <HIcon icon={ShoppingCart01Icon} className="text-primary-500" size={20}  />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</p>
                <p className="text-2xl font-bold text-primary-500 mt-1">₵{(Number(summary.total_amount) || 0).toFixed(2)}</p>
              </div>
              <HIcon icon={DollarCircleIcon} className="text-primary-500" size={20}  />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">₵{(Number(summary.total_profit) || 0).toFixed(2)}</p>
              </div>
              <HIcon icon={ArrowMoveUpRightIcon} className="text-emerald-500" size={20}  />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Sale</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₵{avgSale.toFixed(2)}</p>
              </div>
              <HIcon icon={Analytics02Icon} className="text-primary-500" size={20}  />
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 bg-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white/80 uppercase tracking-wider">Margin</p>
                <p className="text-2xl font-bold text-white mt-1">{profitMargin.toFixed(1)}%</p>
              </div>
              <HIcon icon={ArrowMoveUpRightIcon} className="text-white/80" size={20}  />
            </div>
          </div>
        </div>

        {/* Payment Breakdown */}
        {paymentEntries.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-2.5">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <HIcon icon={CreditCardIcon} size={14} className="text-primary-500"  />
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
              <HIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}  />
              <input
                type="text"
                placeholder="Search by receipt #, customer, or payment method..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>
            <div className="relative">
              <HIcon icon={ArrowUpDownIcon} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}  />
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
                <HIcon icon={FilterIcon} size={14}  />
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
                const count = summary.payment_method_counts?.[method] || 0
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
              <HIcon icon={ReceiptTextIcon} size={48} className="mx-auto mb-3 text-gray-300"  />
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
                            <HIcon icon={Clock01Icon} size={13} className="text-gray-400 shrink-0"  />
                            {sale._saleDate
                              ? new Date(sale._saleDate).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
                              : '—'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-semibold text-gray-900">{sale._receiptNumber || '—'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <HIcon icon={UserIcon} size={13} className="text-gray-400 shrink-0"  />
                            <span className="text-sm text-gray-700">{sale._customerName || 'Walk-in'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold">
                            {sale._itemCount}
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
                            sale._paymentMethodLower === 'cash'
                              ? 'bg-emerald-50 text-emerald-700'
                              : sale._paymentMethodLower === 'mobile money' || sale._paymentMethodLower === 'momo'
                                ? 'bg-amber-50 text-amber-700'
                                : sale._paymentMethodLower === 'card'
                                  ? 'bg-primary-50 text-primary-700'
                                  : 'bg-gray-100 text-gray-700'
                          }`}>
                            {sale._paymentMethod || '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Tooltip text="View sale details & line items">
                            <button
                              type="button"
                              onClick={() => setSelectedSale(sale)}
                              className="inline-flex items-center justify-center p-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors opacity-70 group-hover:opacity-100"
                            >
                              <HIcon icon={ViewIcon} size={16}  />
                            </button>
                          </Tooltip>
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
                    <HIcon icon={ArrowLeft01Icon} size={16}  />
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
                    <HIcon icon={ArrowRight01Icon} size={16}  />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sale Detail Modal */}
        {selectedSale && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3"
            onClick={() => setSelectedSale(null)}
          >
            <div
              className="bg-white rounded-2xl w-full max-w-[96vw] h-[94vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                    <HIcon icon={ReceiptTextIcon} size={22} className="text-white"  />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-gray-900">Sale Details</h2>
                    <p className="text-gray-400 text-sm mt-0.5">
                      Receipt <span className="text-primary-500 font-semibold">{selectedSale.receipt_number || '—'}</span>
                      &nbsp;·&nbsp;
                      {getSaleDateValue(selectedSale) ? new Date(getSaleDateValue(selectedSale)).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' }) : '—'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700"
                >
                  <HIcon icon={Cancel01Icon} size={22}  />
                </button>
              </div>

              {/* Body — two columns: left sidebar + right items table */}
              <div className="flex-1 min-h-0 flex overflow-hidden">

                {/* Left — Sale Summary Panel */}
                <div className="w-72 shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col overflow-y-auto">
                  <div className="p-6 space-y-5">

                    {/* Customer */}
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                          <HIcon icon={UserIcon} size={15} className="text-primary-600"  />
                        </div>
                        <p className="text-gray-900 font-semibold text-sm">{selectedSale.customer_name || 'Walk-in'}</p>
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Payment Method */}
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Method</p>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold capitalize ${
                        (selectedSale.payment_method || '').toLowerCase() === 'cash'
                          ? 'bg-emerald-100 text-emerald-700'
                          : (selectedSale.payment_method || '').toLowerCase().includes('mobile') || (selectedSale.payment_method || '').toLowerCase() === 'momo'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-primary-100 text-primary-700'
                      }`}>
                        {selectedSale.payment_method || '—'}
                      </span>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Financials */}
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Financials</p>
                      <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Subtotal</span>
                          <span className="font-medium text-gray-900">₵{(Number(selectedSale.subtotal) || 0).toFixed(2)}</span>
                        </div>
                        {(Number(selectedSale.discount) || 0) > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Discount</span>
                            <span className="font-medium text-orange-600">-₵{(Number(selectedSale.discount) || 0).toFixed(2)}</span>
                          </div>
                        )}
                        {(Number(selectedSale.tax) || 0) > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Tax</span>
                            <span className="font-medium text-gray-700">₵{(Number(selectedSale.tax) || 0).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                          <span className="font-bold text-gray-900">Total</span>
                          <span className="font-extrabold text-primary-600 text-lg">₵{(Number(selectedSale.total) || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Profit</span>
                          <span className="font-bold text-emerald-600">₵{(Number(selectedSale.total_profit) || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Stats */}
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Summary</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                          <p className="text-2xl font-extrabold text-gray-900">{(selectedSale.items || []).length}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Products</p>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                          <p className="text-2xl font-extrabold text-gray-900">
                            {(selectedSale.items || []).reduce((s, it) => s + (Number(it.quantity_sold) || 0), 0)}
                          </p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Units Sold</p>
                        </div>
                      </div>
                    </div>

                    {/* Profit Margin */}
                    {(Number(selectedSale.total) || 0) > 0 && (
                      <>
                        <hr className="border-gray-200" />
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Margin</p>
                            <span className="text-sm font-bold text-emerald-600">
                              {(((Number(selectedSale.total_profit) || 0) / (Number(selectedSale.total) || 1)) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${Math.min(100, ((Number(selectedSale.total_profit) || 0) / (Number(selectedSale.total) || 1)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right — Line Items Table */}
                <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                  <div className="px-8 py-4 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 uppercase tracking-wider">
                      <HIcon icon={Package01Icon} size={16} className="text-primary-500"  />
                      Line Items
                      <span className="ml-1 px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                        {(selectedSale.items || []).length}
                      </span>
                    </h3>
                  </div>
                  <div className="flex-1 overflow-auto">
                    {(selectedSale.items || []).length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <HIcon icon={Package01Icon} size={48} className="mb-3 opacity-30"  />
                        <p className="text-sm font-medium">No items recorded</p>
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10">
                          <tr className="bg-white text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                            <th className="py-3.5 px-6 text-left">#</th>
                            <th className="py-3.5 px-6 text-left">Product</th>
                            <th className="py-3.5 px-6 text-right">Qty</th>
                            <th className="py-3.5 px-4 text-left">Unit</th>
                            <th className="py-3.5 px-6 text-right">Pieces</th>
                            <th className="py-3.5 px-6 text-right">Unit Price</th>
                            <th className="py-3.5 px-6 text-right">Unit Cost</th>
                            <th className="py-3.5 px-6 text-right">Discount</th>
                            <th className="py-3.5 px-6 text-right">Line Total</th>
                            <th className="py-3.5 px-6 text-right">Profit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {(selectedSale.items || []).map((item, i) => {
                            const lineProfit = Number(item.line_profit) || 0
                            return (
                              <tr key={item.id || i} className={`hover:bg-primary-50/40 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                <td className="py-4 px-6 text-gray-400 text-xs font-medium">{i + 1}</td>
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                                      <HIcon icon={Package01Icon} size={14} className="text-primary-500"  />
                                    </div>
                                    <span className="font-semibold text-gray-900">{item.product_name || '—'}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-800 font-bold text-sm">
                                    {Number(item.quantity_sold)}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-gray-500 text-sm">{item.unit_name || '—'}</td>
                                <td className="py-4 px-6 text-right text-gray-500">{item.quantity_in_pieces != null ? Number(item.quantity_in_pieces) : '—'}</td>
                                <td className="py-4 px-6 text-right font-medium text-gray-900">₵{(Number(item.unit_price) || 0).toFixed(2)}</td>
                                <td className="py-4 px-6 text-right text-gray-500">₵{(Number(item.unit_cost) || 0).toFixed(2)}</td>
                                <td className="py-4 px-6 text-right text-orange-600 font-medium">
                                  {(Number(item.line_discount) || 0) > 0 ? `-₵${(Number(item.line_discount) || 0).toFixed(2)}` : <span className="text-gray-300">—</span>}
                                </td>
                                <td className="py-4 px-6 text-right font-bold text-gray-900 text-base">₵{(Number(item.line_total) || 0).toFixed(2)}</td>
                                <td className="py-4 px-6 text-right">
                                  <span className={`font-bold ${lineProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    ₵{lineProfit.toFixed(2)}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                        {/* Totals footer */}
                        <tfoot>
                          <tr className="bg-gray-900 text-white text-sm font-bold">
                            <td colSpan={8} className="py-4 px-6 text-right uppercase tracking-wider text-gray-400 text-xs">Grand Total</td>
                            <td className="py-4 px-6 text-right text-base text-primary-400">₵{(Number(selectedSale.total) || 0).toFixed(2)}</td>
                            <td className="py-4 px-6 text-right text-emerald-400">₵{(Number(selectedSale.total_profit) || 0).toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SalesHistory
