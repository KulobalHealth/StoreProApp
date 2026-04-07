import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { HIcon } from '../components/HIcon'
import {
  Store01Icon,
  ShoppingCart01Icon,
  Package01Icon,
  UserGroupIcon,
  UserCircleIcon,
  DeliveryTruck01Icon,
  ReceiptTextIcon,
  Settings02Icon,
  Analytics02Icon,
  ArrowMoveUpRightIcon,
  DollarCircleIcon,
  FlashIcon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons'
import { listSales, listProductsByBranch, listEmployees, listSuppliers, listCustomers } from '../api/awoselDb'
import { getSessionBranchId, getSessionOrgId, getActiveBranch } from '../utils/branch'
import Tooltip from '../components/Tooltip'

const BranchDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [branch, setBranch] = useState(null)
  const [todaySales, setTodaySales] = useState([])
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
    if (!branchId) return

    // Today's date for the sales query
    const todayStr = new Date().toISOString().split('T')[0]

    // Fetch all data in parallel — sales scoped to branch + today
    const promises = [
      listSales({ branch_id: branchId, date: todayStr }).catch(() => null),
      listProductsByBranch(branchId).catch(() => null),
      listEmployees(branchId).catch(() => null),
      listSuppliers(branchId).catch(() => null),
      listCustomers(branchId).catch(() => null),
    ]

    try {
      const [salesRes, productsRes, staffRes, suppliersRes, customersRes] = await Promise.all(promises)

      // Sales — already filtered by branch + date from the API
      const salesPayload = salesRes?.data || salesRes
      const salesList = salesPayload?.sales || (Array.isArray(salesPayload) ? salesPayload : [])
      setTodaySales(salesList)

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
    }
  }

  useEffect(() => {
    if (branch) fetchDashboardData()
  }, [branch])

  if (!branch) return null

  // Calculate stats from today's sales
  const totalTransactions = todaySales.length
  const totalSalesAmount = todaySales.reduce((sum, s) => sum + (Number(s.total) || Number(s.total_amount) || 0), 0)

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const firstName = user?.first_name || user?.name?.split(' ')[0] || 'User'

  // Quick action cards
  const quickActions = [
    {
      label: 'POS',
      description: 'Start checkout and process sales quickly.',
      icon: ShoppingCart01Icon,
      path: '/pos',
      iconClass: 'bg-primary-500 text-white',
      accentClass: 'from-primary-500/10 to-primary-500/0 border-primary-100 hover:border-primary-300',
    },
    {
      label: 'Inventory',
      description: 'Manage products, stock levels, and availability.',
      icon: Package01Icon,
      path: '/inventory',
      iconClass: 'bg-gray-900 text-white',
      accentClass: 'from-gray-900/10 to-gray-900/0 border-gray-200 hover:border-gray-300',
    },
    {
      label: 'Warehouse',
      description: 'Review warehouse movement and stock operations.',
      icon: Store01Icon,
      path: '/warehouse',
      iconClass: 'bg-primary-500 text-white',
      accentClass: 'from-primary-500/10 to-primary-500/0 border-primary-100 hover:border-primary-300',
    },
    {
      label: 'Customers',
      description: 'View customer balances and purchase activity.',
      icon: UserCircleIcon,
      path: '/customers',
      iconClass: 'bg-primary-500 text-white',
      accentClass: 'from-primary-500/10 to-primary-500/0 border-primary-100 hover:border-primary-300',
    },
    {
      label: 'Suppliers',
      description: 'Track supplier records, debts, and purchases.',
      icon: DeliveryTruck01Icon,
      path: '/suppliers',
      iconClass: 'bg-gray-900 text-white',
      accentClass: 'from-gray-900/10 to-gray-900/0 border-gray-200 hover:border-gray-300',
    },
    {
      label: 'Users',
      description: 'Manage staff accounts, roles, and access.',
      icon: UserGroupIcon,
      path: '/users',
      iconClass: 'bg-primary-500 text-white',
      accentClass: 'from-primary-500/10 to-primary-500/0 border-primary-100 hover:border-primary-300',
    },
    {
      label: 'Reports',
      description: 'Review sales performance and business insights.',
      icon: Analytics02Icon,
      path: '/sales',
      iconClass: 'bg-gray-900 text-white',
      accentClass: 'from-gray-900/10 to-gray-900/0 border-gray-200 hover:border-gray-300',
      adminOnly: true,
    },
    {
      label: 'Settings',
      description: 'Update business profile and security preferences.',
      icon: Settings02Icon,
      path: '/settings',
      iconClass: 'bg-primary-500 text-white',
      accentClass: 'from-primary-500/10 to-primary-500/0 border-primary-100 hover:border-primary-300',
    },
  ].filter(a => !isManager || !a.adminOnly)

  return (
    <div className="min-h-full bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Greeting Banner */}
        <div className="bg-gray-900 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-white text-lg font-bold">{getGreeting()}, {firstName}! 👋</h2>
            <p className="text-gray-500 text-sm mt-0.5">Here's what's happening at <span className="text-primary-400 font-medium">{branch.name}</span> today.</p>
          </div>
          <button
            onClick={() => navigate('/pos')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors shadow-sm whitespace-nowrap"
          >
            <HIcon icon={ShoppingCart01Icon} size={16} />
            Open POS
          </button>
        </div>

        {/* Activity Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Tooltip text="Go to Inventory — view products & stock levels" position="bottom">
            <button
              onClick={() => navigate('/inventory')}
              className="bg-white rounded-lg border border-gray-200 p-4 text-left hover:border-primary-300 hover:shadow-sm transition-all group w-full"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Inventory</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{productCount}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {lowStockCount > 0
                      ? <span className="text-red-500 font-medium">{lowStockCount} low stock</span>
                      : 'All stocked'
                    }
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  <HIcon icon={Package01Icon} size={20} className="text-primary-500" />
                </div>
              </div>
            </button>
          </Tooltip>
          <Tooltip text="Go to Sales History — view today's total sales" position="bottom">
            <button
              onClick={() => navigate('/sales')}
              className="bg-white rounded-lg border border-gray-200 p-4 text-left hover:border-primary-300 hover:shadow-sm transition-all group w-full"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Total Sales</p>
                  <p className="text-2xl font-bold text-primary-500 mt-1">₵{totalSalesAmount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Today's revenue</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  <HIcon icon={DollarCircleIcon} size={20} className="text-primary-500" />
                </div>
              </div>
            </button>
          </Tooltip>
          <Tooltip text="Go to Suppliers — manage debts and supplier records" position="bottom">
            <button
              onClick={() => navigate('/suppliers')}
              className="bg-white rounded-lg border border-gray-200 p-4 text-left hover:border-primary-300 hover:shadow-sm transition-all group w-full"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Suppliers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{supplierCount}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Active suppliers</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  <HIcon icon={DeliveryTruck01Icon} size={20} className="text-primary-500" />
                </div>
              </div>
            </button>
          </Tooltip>
          <Tooltip text="Go to Customers — view balances & purchase history" position="bottom">
            <button
              onClick={() => navigate('/customers')}
              className="bg-white rounded-lg border border-gray-200 p-4 text-left hover:border-primary-300 hover:shadow-sm transition-all group w-full"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Customers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{customerCount}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {customersOwing > 0
                      ? <span className="text-primary-500 font-medium">{customersOwing} owing</span>
                      : 'No balances'
                    }
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  <HIcon icon={UserCircleIcon} size={20} className="text-primary-500" />
                </div>
              </div>
            </button>
          </Tooltip>
          <Tooltip text="Go to Sales History — view all today's transactions" position="bottom">
            <button
              onClick={() => navigate('/sales')}
              className="rounded-lg border border-gray-200 p-4 text-left bg-primary-500 hover:bg-primary-600 transition-all group w-full"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-xs font-medium uppercase tracking-wide">Transactions</p>
                  <p className="text-2xl font-bold text-white mt-1">{totalTransactions}</p>
                  <p className="text-xs text-white/60 mt-0.5">Sales today</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <HIcon icon={ReceiptTextIcon} size={20} className="text-white" />
                </div>
              </div>
            </button>
          </Tooltip>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <HIcon icon={FlashIcon} size={16} className="text-primary-500" />
            <div>
              <h2 className="text-base font-bold text-gray-900">Quick Actions</h2>
              <p className="text-sm text-gray-500">Jump into the most-used areas of your branch in one tap.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((a) => (
              <button
                key={a.path + a.label}
                onClick={() => navigate(a.path)}
                className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${a.accentClass} p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg`}
                title={a.label}
              >
                <div className="flex min-h-[180px] flex-col justify-between gap-6">
                  <div className="space-y-4">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-105 ${a.iconClass}`}>
                      <HIcon icon={a.icon} size={30} strokeWidth={1.8} />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{a.label}</h3>
                      <p className="mt-2 text-sm leading-6 text-gray-600">{a.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-200/80 pt-4">
                    <span className="text-sm font-semibold text-primary-600">Open {a.label}</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm transition-transform group-hover:translate-x-1">
                      <HIcon icon={ArrowRight01Icon} size={18} />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BranchDashboard
