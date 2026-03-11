import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getActiveBranch, getSessionBranchId } from '../utils/branch'
import { listEmployees, listSales } from '../api/awoselDb.js'
import {
  Users, Search, Calendar, TrendingUp,
  ShoppingCart, Clock, ChevronDown, Loader2, AlertTriangle,
  Receipt, BarChart3, CalendarDays, CalendarRange, Filter, LogOut
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

const Cashiers = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('today') // today, week, month, year, custom
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0])
  const [salesLoading, setSalesLoading] = useState(false)

  const activeBranch = getActiveBranch()
  const branchId = activeBranch?.uuid || activeBranch?.id || getSessionBranchId()

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      if (!branchId) { setError('No branch selected'); return }
      const res = await listEmployees(branchId)
      const data = Array.isArray(res) ? res : (res?.data || [])
      // Filter to sales role employees only
      const salesUsers = data.filter(e => (e.role || '').toLowerCase() === 'sales')
      setEmployees(salesUsers)
    } catch (err) {
      setError(err.message || 'Could not load employees')
    }
  }

  // Fetch all sales for the branch
  const fetchSales = async () => {
    try {
      setSalesLoading(true)
      if (!branchId) return
      const res = await listSales({ branch_id: branchId })
      const payload = res?.data || res
      const salesList = payload?.sales || (Array.isArray(payload) ? payload : [])
      setSales(salesList)
    } catch (err) {
      console.error('Could not load sales:', err)
    } finally {
      setSalesLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchEmployees()
      await fetchSales()
      setLoading(false)
    }
    init()
  }, [branchId])

  // Date helpers
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const startOfWeek = (() => {
    const d = new Date(today)
    d.setDate(d.getDate() - d.getDay()) // Sunday
    d.setHours(0, 0, 0, 0)
    return d
  })()

  const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
  }

  // Compute cashier stats from sales
  const cashierStats = useMemo(() => {
    const statsMap = {}

    employees.forEach(emp => {
      const empId = emp.uuid || emp.id || emp.employee_id
      statsMap[empId] = {
        employee: emp,
        todaySales: 0,
        todayCount: 0,
        todayProfit: 0,
        weekSales: 0,
        weekCount: 0,
        weekProfit: 0,
        monthSales: 0,
        monthCount: 0,
        monthProfit: 0,
        yearSales: 0,
        yearCount: 0,
        yearProfit: 0,
        customSales: 0,
        customCount: 0,
        customProfit: 0,
        totalSales: 0,
        totalCount: 0,
        totalProfit: 0,
      }
    })

    sales.forEach(sale => {
      // Match sale to employee — try employee_id, user_id, sold_by, created_by
      const saleEmpId = sale.employee_id || sale.user_id || sale.sold_by || sale.created_by
      if (!saleEmpId || !statsMap[saleEmpId]) return

      const saleDate = sale.created_at ? new Date(sale.created_at) : null
      const amount = Number(sale.total) || 0
      const profit = Number(sale.total_profit) || 0
      const stats = statsMap[saleEmpId]

      stats.totalSales += amount
      stats.totalCount += 1
      stats.totalProfit += profit

      if (!saleDate) return

      // Today
      if (isSameDay(saleDate, today)) {
        stats.todaySales += amount
        stats.todayCount += 1
        stats.todayProfit += profit
      }

      // This week
      if (saleDate >= startOfWeek) {
        stats.weekSales += amount
        stats.weekCount += 1
        stats.weekProfit += profit
      }

      // This month
      if (saleDate.getFullYear() === today.getFullYear() && saleDate.getMonth() === today.getMonth()) {
        stats.monthSales += amount
        stats.monthCount += 1
        stats.monthProfit += profit
      }

      // This year
      if (saleDate.getFullYear() === today.getFullYear()) {
        stats.yearSales += amount
        stats.yearCount += 1
        stats.yearProfit += profit
      }

      // Custom date
      if (customDate && isSameDay(saleDate, new Date(customDate + 'T00:00:00'))) {
        stats.customSales += amount
        stats.customCount += 1
        stats.customProfit += profit
      }
    })

    return Object.values(statsMap)
  }, [employees, sales, customDate])

  // Filtered cashiers
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
    // Sort by the selected period's sales (descending)
    const key = dateFilter === 'today' ? 'todaySales'
      : dateFilter === 'week' ? 'weekSales'
      : dateFilter === 'month' ? 'monthSales'
      : dateFilter === 'year' ? 'yearSales'
      : dateFilter === 'custom' ? 'customSales'
      : 'totalSales'
    result.sort((a, b) => b[key] - a[key])
    return result
  }, [cashierStats, searchTerm, dateFilter])

  // Get stats for selected period
  const getStats = (cashier) => {
    switch (dateFilter) {
      case 'today': return { sales: cashier.todaySales, count: cashier.todayCount, profit: cashier.todayProfit }
      case 'week': return { sales: cashier.weekSales, count: cashier.weekCount, profit: cashier.weekProfit }
      case 'month': return { sales: cashier.monthSales, count: cashier.monthCount, profit: cashier.monthProfit }
      case 'year': return { sales: cashier.yearSales, count: cashier.yearCount, profit: cashier.yearProfit }
      case 'custom': return { sales: cashier.customSales, count: cashier.customCount, profit: cashier.customProfit }
      default: return { sales: cashier.totalSales, count: cashier.totalCount, profit: cashier.totalProfit }
    }
  }

  const getInitials = (emp) => {
    const f = (emp.first_name || '')[0] || ''
    const l = (emp.last_name || '')[0] || ''
    return (f + l).toUpperCase() || 'U'
  }

  const periodLabel = dateFilter === 'today' ? "Today's"
    : dateFilter === 'week' ? "This Week's"
    : dateFilter === 'month' ? "This Month's"
    : dateFilter === 'year' ? "This Year's"
    : dateFilter === 'custom' ? `${new Date(customDate + 'T00:00:00').toLocaleDateString(undefined, { dateStyle: 'medium' })}`
    : 'All Time'

  // Summary totals for selected period
  const summaryTotals = useMemo(() => {
    return filteredCashiers.reduce((acc, c) => {
      const s = getStats(c)
      acc.sales += s.sales
      acc.count += s.count
      acc.profit += s.profit
      return acc
    }, { sales: 0, count: 0, profit: 0 })
  }, [filteredCashiers, dateFilter, customDate])

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Cashiers</h1>
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₵{summaryTotals.sales.toFixed(2)}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center">
                <span className="text-xl font-bold text-primary-600">₵</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{periodLabel} across all cashiers</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{summaryTotals.count}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
                <Receipt size={22} className="text-primary-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{periodLabel} sales count</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Profit</p>
                <p className="text-2xl font-bold text-primary-600 mt-1">₵{summaryTotals.profit.toFixed(2)}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center">
                <TrendingUp size={22} className="text-primary-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{periodLabel} profit earned</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Sales Loading Indicator */}
        {salesLoading && (
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" />
            Refreshing sales data...
          </div>
        )}

        {/* Cashier Cards */}
        {filteredCashiers.length === 0 ? (
          <div className="text-center py-16">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">No cashiers found</h3>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm ? 'Try a different search term.' : 'No sales users found in this branch.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredCashiers.map((cashier, idx) => {
              const emp = cashier.employee
              const stats = getStats(cashier)
              const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length]
              const avgSale = stats.count > 0 ? stats.sales / stats.count : 0

              return (
                <div key={emp.uuid || emp.id || idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-200">
                  {/* Card Header */}
                  <div className="px-5 py-4 flex items-center gap-4 border-b border-gray-100">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                      {getInitials(emp)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 truncate">
                        {emp.first_name || ''} {emp.last_name || ''}
                      </h3>
                      {emp.email && (
                        <p className="text-xs text-gray-500 truncate">{emp.email}</p>
                      )}
                      {emp.phone && (
                        <p className="text-xs text-gray-400 truncate">{emp.phone}</p>
                      )}
                    </div>
                    <span className="inline-flex px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-[10px] font-bold uppercase tracking-wider border border-primary-200">
                      Sales
                    </span>
                  </div>

                  {/* Selected Period Stats */}
                  <div className="px-5 py-4">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">{periodLabel} Performance</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <span className="block text-base font-bold text-primary-500 mb-1 mx-auto">₵</span>
                        <p className="text-lg font-bold text-gray-900">₵{stats.sales.toFixed(0)}</p>
                        <p className="text-[10px] text-gray-500 font-medium">Revenue</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <ShoppingCart size={16} className="mx-auto text-primary-500 mb-1" />
                        <p className="text-lg font-bold text-gray-900">{stats.count}</p>
                        <p className="text-[10px] text-gray-500 font-medium">Sales</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <TrendingUp size={16} className="mx-auto text-primary-600 mb-1" />
                        <p className="text-lg font-bold text-primary-600">₵{stats.profit.toFixed(0)}</p>
                        <p className="text-[10px] text-gray-500 font-medium">Profit</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Comparison Row */}
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <BarChart3 size={12} className="text-gray-400" />
                        <span className="text-gray-500">Avg Sale:</span>
                        <span className="font-semibold text-gray-800">₵{avgSale.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* All-period mini summary */}
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {[
                        { label: 'Today', value: cashier.todaySales },
                        { label: 'Week', value: cashier.weekSales },
                        { label: 'Month', value: cashier.monthSales },
                        { label: 'Year', value: cashier.yearSales },
                      ].map(({ label, value }) => (
                        <div key={label} className="text-center">
                          <p className="text-[10px] text-gray-400 font-medium">{label}</p>
                          <p className="text-xs font-bold text-gray-700">₵{value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value.toFixed(0)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
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
