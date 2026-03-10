import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Store, ShoppingCart, Package, Users, UserCircle, Truck, Receipt,
  Settings, BarChart3, TrendingUp, DollarSign, Clock, AlertCircle,
  ArrowLeft, MapPin, Activity, ArrowUpRight, RefreshCw, Zap
} from 'lucide-react'
import { listSales, listProductsByBranch, listEmployees, listSuppliers, listCustomers } from '../api/awoselDb'
import { getSessionBranchId } from '../utils/branch'

const BranchDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [branch, setBranch] = useState(null)
  const [todaySales, setTodaySales] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [productCount, setProductCount] = useState(0)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [staffCount, setStaffCount] = useState(0)
  const [supplierCount, setSupplierCount] = useState(0)
  const [customerCount, setCustomerCount] = useState(0)
  const [customersOwing, setCustomersOwing] = useState(0)

  const userRole = (user?.role || '').toLowerCase()
  const isManager = userRole === 'manager'

  useEffect(() => {
    try {
      const saved = localStorage.getItem('awosel_active_branch')
      if (saved) {
        setBranch(JSON.parse(saved))
      } else {
        navigate('/dashboard')
      }
    } catch {
      navigate('/dashboard')
    }
  }, [navigate])

  const fetchDashboardData = async () => {
    const branchId = getSessionBranchId()

    // Fetch all data in parallel
    const promises = [
      listSales().catch(() => null),
      branchId ? listProductsByBranch(branchId).catch(() => null) : Promise.resolve(null),
      branchId ? listEmployees(branchId).catch(() => null) : Promise.resolve(null),
      branchId ? listSuppliers(branchId).catch(() => null) : Promise.resolve(null),
      branchId ? listCustomers(branchId).catch(() => null) : Promise.resolve(null),
    ]

    try {
      const [salesRes, productsRes, staffRes, suppliersRes, customersRes] = await Promise.all(promises)

      // Sales
      const salesPayload = salesRes?.data || salesRes
      const salesList = salesPayload?.sales || []
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      const filtered = salesList.filter(s => {
        const saleDate = new Date(s.created_at || s.date).toISOString().split('T')[0]
        return saleDate === todayStr
      })
      setTodaySales(filtered)

      // Products
      const products = Array.isArray(productsRes) ? productsRes : (productsRes?.data || [])
      setProductCount(products.length)
      setLowStockCount(products.filter(p => Number(p.quantity) <= Number(p.min_stock_quantity || 5)).length)

      // Staff
      const staff = Array.isArray(staffRes) ? staffRes : (staffRes?.data || [])
      setStaffCount(staff.length)

      // Suppliers
      const suppliers = Array.isArray(suppliersRes) ? suppliersRes : (suppliersRes?.data || [])
      setSupplierCount(suppliers.length)

      // Customers
      const customers = Array.isArray(customersRes) ? customersRes : (customersRes?.data || [])
      setCustomerCount(customers.length)
      setCustomersOwing(customers.filter(c => Number(c.owing_amount) > 0).length)
    } catch {
      setTodaySales([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (branch) fetchDashboardData()
  }, [branch])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchDashboardData()
  }

  if (!branch) return null

  // Calculate stats from today's sales
  const totalRevenue = todaySales.reduce((sum, s) => sum + (Number(s.total_amount || s.total) || 0), 0)
  const totalTransactions = todaySales.length
  const totalProfit = todaySales.reduce((sum, s) => sum + (Number(s.profit) || 0), 0)
  const avgSale = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

  const formatMoney = (n) => (Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const firstName = user?.first_name || user?.name?.split(' ')[0] || 'User'

  // Quick action icons — icon-only style
  const quickActions = [
    { label: 'POS', icon: ShoppingCart, path: '/pos', color: 'bg-primary-500', textColor: 'text-white' },
    { label: 'Inventory', icon: Package, path: '/inventory', color: 'bg-gray-900', textColor: 'text-white' },
    { label: 'Customers', icon: UserCircle, path: '/customers', color: 'bg-primary-500', textColor: 'text-white' },
    { label: 'Suppliers', icon: Truck, path: '/suppliers', color: 'bg-gray-900', textColor: 'text-white' },
    { label: 'Users', icon: Users, path: '/users', color: 'bg-primary-500', textColor: 'text-white' },
    { label: 'Reports', icon: BarChart3, path: '/sales', color: 'bg-gray-900', textColor: 'text-white', adminOnly: true },
    { label: 'Settings', icon: Settings, path: '/settings', color: 'bg-primary-500', textColor: 'text-white' },
  ].filter(a => !isManager || !a.adminOnly)

  // Recent transactions (last 5)
  const recentSales = todaySales.slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-500 text-white">
                <Store size={18} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">{branch.name}</h1>
                <p className="text-gray-500 text-xs flex items-center gap-1">
                  {branch.location && <><MapPin size={10} /> {branch.location} · </>}
                  <span className="capitalize">{user?.role || 'user'}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              {!isManager && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft size={14} />
                  Switch Branch
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Greeting Banner */}
        <div className="bg-gray-900 rounded-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-white text-lg font-bold">{getGreeting()}, {firstName}! 👋</h2>
            <p className="text-gray-400 text-sm mt-0.5">Here's what's happening at <span className="text-primary-400 font-medium">{branch.name}</span> today.</p>
          </div>
          <button
            onClick={() => navigate('/pos')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors shadow-sm whitespace-nowrap"
          >
            <ShoppingCart size={16} />
            Open POS
          </button>
        </div>

        {/* Activity Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/inventory')}
            className="bg-white rounded-sm border border-gray-200 p-4 text-left hover:border-primary-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Inventory</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{productCount}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {lowStockCount > 0
                    ? <span className="text-red-500 font-medium">{lowStockCount} low stock</span>
                    : 'All stocked'
                  }
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                <Package className="text-primary-500" size={20} />
              </div>
            </div>
          </button>
          <button
            onClick={() => navigate('/users')}
            className="bg-white rounded-sm border border-gray-200 p-4 text-left hover:border-primary-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Staff</p>
                <p className="text-2xl font-bold text-primary-500 mt-1">{staffCount}</p>
                <p className="text-xs text-gray-400 mt-0.5">Team members</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                <Users className="text-primary-500" size={20} />
              </div>
            </div>
          </button>
          <button
            onClick={() => navigate('/suppliers')}
            className="bg-white rounded-sm border border-gray-200 p-4 text-left hover:border-primary-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Suppliers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{supplierCount}</p>
                <p className="text-xs text-gray-400 mt-0.5">Active suppliers</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                <Truck className="text-primary-500" size={20} />
              </div>
            </div>
          </button>
          <button
            onClick={() => navigate('/customers')}
            className="rounded-sm border border-gray-200 p-4 text-left bg-primary-500 hover:bg-primary-600 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs font-medium uppercase tracking-wide">Customers</p>
                <p className="text-2xl font-bold text-white mt-1">{customerCount}</p>
                <p className="text-xs text-white/60 mt-0.5">
                  {customersOwing > 0
                    ? <span className="text-white font-medium">{customersOwing} owing</span>
                    : 'No balances'
                  }
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <UserCircle className="text-white" size={20} />
              </div>
            </div>
          </button>
        </div>

        {/* Quick Actions — Icon Only Grid */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Zap size={14} className="text-primary-500" />
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((a) => (
              <button
                key={a.path + a.label}
                onClick={() => navigate(a.path)}
                className="group flex flex-col items-center gap-2 w-[72px] transition-all"
                title={a.label}
              >
                <div className={`w-14 h-14 rounded-xl ${a.color} flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all`}>
                  <a.icon size={22} className={a.textColor} strokeWidth={1.8} />
                </div>
                <span className="text-[11px] font-medium text-gray-600 group-hover:text-gray-900 transition-colors leading-tight">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid — hidden for managers */}
        {!isManager && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Recent Transactions — spans 2 cols */}
          <div className="lg:col-span-2 bg-white rounded-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Receipt size={16} className="text-primary-500" />
                Today's Transactions
              </h3>
              {!isManager && (
                <button
                  onClick={() => navigate('/sales')}
                  className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
                >
                  View all <ArrowUpRight size={12} />
                </button>
              )}
            </div>
            {loading ? (
              <div className="py-12 text-center">
                <div className="w-7 h-7 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-400">Loading...</p>
              </div>
            ) : recentSales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-900 text-white">
                      <th className="text-left py-2.5 px-4 text-xs font-semibold uppercase tracking-wider">Time</th>
                      <th className="text-left py-2.5 px-4 text-xs font-semibold uppercase tracking-wider">Receipt #</th>
                      <th className="text-left py-2.5 px-4 text-xs font-semibold uppercase tracking-wider">Payment</th>
                      <th className="text-right py-2.5 px-4 text-xs font-semibold uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentSales.map((sale, i) => (
                      <tr key={sale.id || sale.uuid || i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-primary-50/40 transition-colors`}>
                        <td className="py-2.5 px-4 text-sm text-gray-600">
                          {new Date(sale.created_at || sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2.5 px-4 text-sm font-medium text-gray-900">
                          {sale.receipt_number || sale.receiptNumber || '—'}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase ${
                            (sale.payment_method || '').toLowerCase() === 'cash'
                              ? 'bg-green-100 text-green-700'
                              : (sale.payment_method || '').toLowerCase() === 'momo'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {sale.payment_method || 'N/A'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right text-sm font-semibold text-primary-500">
                          ₵{formatMoney(sale.total_amount || sale.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Clock size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-400">No transactions today</p>
                <button
                  onClick={() => navigate('/pos')}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-600 font-medium"
                >
                  Open POS to start selling <ArrowUpRight size={12} />
                </button>
              </div>
            )}
            {recentSales.length > 0 && (
              <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                Showing {recentSales.length} of {todaySales.length} transaction{todaySales.length !== 1 ? 's' : ''} today
              </div>
            )}
          </div>

          {/* Sidebar — Summary + Alerts */}
          <div className="space-y-5">
            {/* Revenue Breakdown */}
            <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Activity size={16} className="text-primary-500" />
                  Revenue Breakdown
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {(() => {
                  const cashSales = todaySales.filter(s => (s.payment_method || '').toLowerCase() === 'cash')
                  const momoSales = todaySales.filter(s => (s.payment_method || '').toLowerCase() === 'momo')
                  const otherSales = todaySales.filter(s => !['cash', 'momo'].includes((s.payment_method || '').toLowerCase()))

                  const cashTotal = cashSales.reduce((sum, s) => sum + (Number(s.total_amount || s.total) || 0), 0)
                  const momoTotal = momoSales.reduce((sum, s) => sum + (Number(s.total_amount || s.total) || 0), 0)
                  const otherTotal = otherSales.reduce((sum, s) => sum + (Number(s.total_amount || s.total) || 0), 0)

                  const items = [
                    { label: 'Cash', amount: cashTotal, count: cashSales.length, color: 'bg-green-500' },
                    { label: 'MoMo', amount: momoTotal, count: momoSales.length, color: 'bg-yellow-500' },
                    { label: 'Other', amount: otherTotal, count: otherSales.length, color: 'bg-blue-500' },
                  ]

                  return items.map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                        <span className="text-sm text-gray-600">{item.label}</span>
                        <span className="text-xs text-gray-400">({item.count})</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">₵{formatMoney(item.amount)}</span>
                    </div>
                  ))
                })()}

                {totalRevenue === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">No sales data yet</p>
                )}

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">Total</span>
                  <span className="text-sm font-bold text-primary-500">₵{formatMoney(totalRevenue)}</span>
                </div>
              </div>
            </div>

            {/* Inventory Alert */}
            <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <AlertCircle size={16} className="text-primary-500" />
                  Inventory Alerts
                </h3>
                <button
                  onClick={() => navigate('/inventory')}
                  className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
                >
                  View <ArrowUpRight size={12} />
                </button>
              </div>
              <div className="p-6 text-center">
                <Package size={28} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-400">No alerts</p>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-gray-900 rounded-sm p-4">
              <h3 className="text-white text-sm font-bold mb-3">Today at a Glance</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Revenue</span>
                  <span className="text-white text-sm font-semibold">₵{formatMoney(totalRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Profit</span>
                  <span className="text-green-400 text-sm font-semibold">₵{formatMoney(totalProfit)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Margin</span>
                  <span className="text-primary-400 text-sm font-semibold">
                    {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0.0'}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Transactions</span>
                  <span className="text-white text-sm font-semibold">{totalTransactions}</span>
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

export default BranchDashboard
