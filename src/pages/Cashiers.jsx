import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getActiveBranch, getSessionBranchId } from '../utils/branch'
import { getCashierSales } from '../api/awoselDb.js'
import {
  Users, Search, Calendar, TrendingUp, Wallet,
  ShoppingCart, Clock, ChevronDown, Loader2, AlertTriangle,
  Receipt, BarChart3, CalendarDays, CalendarRange, Filter, LogOut,
  RefreshCw, DollarSign, ArrowUpRight, ArrowDownRight
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
  { key: 'today', label: 'Today', icon: Clock },
  { key: 'range', label: 'Range', icon: CalendarDays },
  { key: 'month', label: 'This Month', icon: CalendarRange },
  { key: 'year', label: 'This Year', icon: Calendar },
  { key: 'custom', label: 'Date', icon: Filter },
]

const Cashiers = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [cashierData, setCashierData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [period, setPeriod] = useState('month')
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0])
  const [rangeStart, setRangeStart] = useState(new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0])
  const [rangeEnd, setRangeEnd] = useState(new Date().toISOString().split('T')[0])
  const [refreshing, setRefreshing] = useState(false)

  const activeBranch = getActiveBranch()
  const branchId = activeBranch?.uuid || activeBranch?.id || getSessionBranchId()

  // Fetch cashier sales from /sales/cashiers?branch_id=...&period=... or &date=...
  const fetchCashierSales = useCallback(async (showRefresh = false) => {
    try {
      if (!branchId) { setError('No branch selected'); return }
      if (showRefresh) setRefreshing(true)
      else setLoading(true)
      setError('')

      const params = period === 'custom'
        ? { date: customDate }
        : period === 'range'
          ? { start_date: rangeStart, end_date: rangeEnd }
          : { period }
      const res = await getCashierSales(branchId, params)
      const payload = res?.data || res
      const list = Array.isArray(payload) ? payload : (payload?.cashiers || payload?.sales || payload?.dashboard || [])
      setCashierData(list)
    } catch (err) {
      console.error('Could not load cashier sales:', err)
      setError(err.message || 'Could not load cashier sales')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [branchId, period, customDate, rangeStart, rangeEnd])

  useEffect(() => {
    fetchCashierSales()
  }, [fetchCashierSales])

  const handleRefresh = () => fetchCashierSales(true)

  // Map API response rows into display-ready cashier objects
  // API shape: { id, email, phone, first_name, last_name, name, role, sales_count, total_sold, total_profit }
  const cashierStats = useMemo(() => {
    return cashierData.map(row => {
      const userId = row.id || row.user_id || row.employee_id || ''

      const employee = {
        uuid: row.id || '',
        id: row.id || '',
        first_name: row.first_name || row.name?.split(' ')[0] || 'Unknown',
        last_name: row.last_name || row.name?.split(' ').slice(1).join(' ') || '',
        email: row.email || '',
        phone: row.phone || '',
        role: row.role || 'sales',
      }

      const totalSales = Number(row.total_sold || row.total_sales || row.total || 0)
      const totalCount = Number(row.sales_count || row.total_transactions || row.count || 0)
      const totalProfit = Number(row.total_profit || row.profit || 0)

      return {
        userId: String(userId),
        employee,
        totalSales,
        totalCount,
        totalProfit,
      }
    })
  }, [cashierData])

  // Filtered & sorted
  const filteredCashiers = useMemo(() => {
    let result = cashierStats
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      result = result.filter(c => {
        const name = `${c.employee.first_name || ''} ${c.employee.last_name || ''}`.toLowerCase()
        const email = (c.employee.email || '').toLowerCase()
        return name.includes(q) || email.includes(q)
      })
    }
    result.sort((a, b) => b.totalSales - a.totalSales)
    return result
  }, [cashierStats, searchTerm])

  // Summary totals
  const summaryTotals = useMemo(() => {
    return filteredCashiers.reduce((acc, c) => {
      acc.sales += c.totalSales
      acc.count += c.totalCount
      acc.profit += c.totalProfit
      return acc
    }, { sales: 0, count: 0, profit: 0 })
  }, [filteredCashiers])

  const getInitials = (emp) => {
    const f = (emp.first_name || '')[0] || ''
    const l = (emp.last_name || '')[0] || ''
    return (f + l).toUpperCase() || 'U'
  }

  const formatCurrency = (val) => {
    if (val >= 1000) return '₵' + (val / 1000).toFixed(1) + 'k'
    return '₵' + val.toFixed(2)
  }

  const fmtDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

  const periodLabel = period === 'custom'
    ? fmtDate(customDate)
    : period === 'range'
      ? `${fmtDate(rangeStart)} – ${fmtDate(rangeEnd)}`
      : (PERIODS.find(p => p.key === period)?.label || 'This Month')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-primary-600" />
          <p className="text-gray-600 font-medium">Loading cashiers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-500 text-white">
              <Wallet size={18} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">Cashiers</h1>
              <p className="text-gray-500 text-xs">
                {activeBranch?.name ? `${activeBranch.name} — ` : ''}{periodLabel} sales per cashier
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => { logout(); navigate('/login') }}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 space-y-5">
        {/* Period Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1">
          {PERIODS.map(p => {
            const Icon = p.icon
            const isActive = period === p.key
            return (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{p.label}</span>
              </button>
            )
          })}
        </div>

        {/* Date Range Picker — shown when 'Range' tab is active */}
        {period === 'range' && (
          <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3">
            <CalendarDays size={16} className="text-primary-500 shrink-0" />
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <label className="text-sm font-medium text-gray-700 shrink-0">From:</label>
              <input
                type="date"
                value={rangeStart}
                onChange={e => setRangeStart(e.target.value)}
                max={rangeEnd}
                className="flex-1 min-w-[130px] px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <label className="text-sm font-medium text-gray-700 shrink-0">To:</label>
              <input
                type="date"
                value={rangeEnd}
                onChange={e => setRangeEnd(e.target.value)}
                min={rangeStart}
                max={new Date().toISOString().split('T')[0]}
                className="flex-1 min-w-[130px] px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        )}

        {/* Custom Date Picker — shown when 'Date' tab is active */}
        {period === 'custom' && (
          <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3">
            <Calendar size={16} className="text-primary-500 shrink-0" />
            <label className="text-sm font-medium text-gray-700 shrink-0">Select date:</label>
            <input
              type="date"
              value={customDate}
              onChange={e => setCustomDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <span className="text-lg font-bold text-primary-600">₵</span>
              </div>
              <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full uppercase">{periodLabel}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">₵{summaryTotals.sales.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Total revenue</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Receipt size={20} className="text-orange-600" />
              </div>
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase">Transactions</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{summaryTotals.count}</p>
            <p className="text-xs text-gray-500 mt-1">{periodLabel} sales count</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp size={20} className="text-green-600" />
              </div>
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase">Profit</span>
            </div>
            <p className="text-2xl font-bold text-green-600">₵{summaryTotals.profit.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{periodLabel} profit</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Users size={20} className="text-amber-600" />
              </div>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase">Active</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{filteredCashiers.filter(c => c.totalCount > 0).length}<span className="text-base font-medium text-gray-400">/{filteredCashiers.length}</span></p>
            <p className="text-xs text-gray-500 mt-1">Cashiers with sales</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search cashiers by name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Refreshing Indicator */}
        {refreshing && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" />
            Refreshing...
          </div>
        )}

        {/* Cashier Cards */}
        {filteredCashiers.length === 0 ? (
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
              const emp = cashier.employee
              const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length]
              const avgSale = cashier.totalCount > 0 ? cashier.totalSales / cashier.totalCount : 0
              // Rank badge for top 3
              const rank = idx + 1

              return (
                <div key={cashier.userId || emp.uuid || emp.id || idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-primary-200 transition-all duration-200">
                  {/* Card Header */}
                  <div className="px-5 py-4 flex items-center gap-4 border-b border-gray-100">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                        {getInitials(emp)}
                      </div>
                      {rank <= 3 && cashier.totalCount > 0 && (
                        <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow ${
                          rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-gray-400' : 'bg-amber-700'
                        }`}>
                          {rank}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 truncate">
                        {emp.first_name || ''} {emp.last_name || ''}
                      </h3>
                      {emp.email && (
                        <p className="text-xs text-gray-500 truncate">{emp.email}</p>
                      )}
                    </div>
                    {cashier.totalCount > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        {cashier.totalCount} sale{cashier.totalCount !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 rounded-full bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-wider border border-gray-200">
                        No Sales
                      </span>
                    )}
                  </div>

                  {/* Period Stats */}
                  <div className="px-5 py-4">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">{periodLabel} Performance</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-primary-50 rounded-lg p-3 text-center">
                        <span className="block text-base font-bold text-primary-500 mb-1">₵</span>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(cashier.totalSales)}</p>
                        <p className="text-[10px] text-gray-500 font-medium">Revenue</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3 text-center">
                        <ShoppingCart size={16} className="mx-auto text-orange-500 mb-1" />
                        <p className="text-lg font-bold text-gray-900">{cashier.totalCount}</p>
                        <p className="text-[10px] text-gray-500 font-medium">Sales</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <BarChart3 size={16} className="mx-auto text-green-600 mb-1" />
                        <p className="text-lg font-bold text-gray-900">₵{avgSale.toFixed(0)}</p>
                        <p className="text-[10px] text-gray-500 font-medium">Avg Sale</p>
                      </div>
                    </div>
                  </div>

                  {/* Profit row */}
                  {cashier.totalProfit > 0 && (
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs">
                          <TrendingUp size={12} className="text-green-600" />
                          <span className="text-gray-500">Profit:</span>
                          <span className="font-bold text-green-600">₵{cashier.totalProfit.toFixed(2)}</span>
                        </div>
                        {cashier.totalSales > 0 && (
                          <span className="text-[10px] font-semibold text-gray-500">
                            {((cashier.totalProfit / cashier.totalSales) * 100).toFixed(1)}% margin
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Cashiers
