import React, { useState } from 'react'
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  ArrowUp, 
  ArrowDown, 
  Users, 
  Clock, 
  AlertTriangle, 
  Award, 
  Activity, 
  Calendar, 
  TrendingDown, 
  CheckCircle,
  FileText,
  CreditCard,
  Wallet,
  ChevronDown,
  Play,
  Building2,
  Menu,
  Plus,
  Search,
  Settings,
  HelpCircle,
  Bell,
  Lock,
  User,
  Receipt,
  AlertCircle
} from 'lucide-react'
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid
} from 'recharts'

const Dashboard = () => {
  const [invoicePeriod, setInvoicePeriod] = useState('last365')
  const [expensePeriod, setExpensePeriod] = useState('lastMonth')
  const [profitPeriod, setProfitPeriod] = useState('lastMonth')
  const [salesPeriod, setSalesPeriod] = useState('thisQuarter')
  const [privacyEnabled, setPrivacyEnabled] = useState(false)

  // Invoice Data
  const invoiceData = {
    unpaidLast365: 5281.52,
    overdue: 1525.50,
    notDueYet: 3756.02,
    paidLast30: 3692.22,
    notDeposited: 2062.52,
    deposited: 1629.70
  }

  // Expense Data
  const expenseData = {
    total: 467121,
    categories: [
      { name: 'Meal & Entertainment', value: 1456654, percentage: 62 },
      { name: 'Rent & Mortgage', value: 302654, percentage: 20 },
      { name: 'Automotive', value: 189342, percentage: 13 },
      { name: 'Travel Expenses', value: 14598, percentage: 5 }
    ]
  }

  const expenseChartData = expenseData.categories.map(cat => ({
    name: cat.name,
    value: cat.percentage
  }))

  const EXPENSE_COLORS = ['#14B8A6', '#10B981', '#059669', '#047857']

  // Bank Account Data
  const bankAccounts = [
    { name: 'Checking', bankBalance: 2435.65, quickbooksBalance: 16987.43 },
    { name: 'Savings', bankBalance: 18267.90, quickbooksBalance: 6900.02 }
  ]

  // Profit and Loss Data
  const profitLossData = {
    netIncome: 23876,
    income: 763432,
    expenses: 724654
  }

  // Sales Data for Line Chart
  const salesChartData = [
    { month: 'Jan', sales: 120000 },
    { month: 'Feb', sales: 150000 },
    { month: 'Mar', sales: 180000 },
    { month: 'Apr', sales: 140000 },
    { month: 'May', sales: 190000 },
    { month: 'Jun', sales: 220000 }
  ]

  const totalSales = 467121

  // Cash Flow Data
  const cashFlowData = {
    inflow: 125000,
    outflow: 98000,
    netFlow: 27000
  }

  // Top Customers Data
  const topCustomers = [
    { name: 'John Doe', purchases: 45, total: 12500, change: '+12%' },
    { name: 'Jane Smith', purchases: 38, total: 9800, change: '+8%' },
    { name: 'Michael Brown', purchases: 32, total: 8750, change: '+15%' },
    { name: 'Sarah Johnson', purchases: 28, total: 7200, change: '+5%' }
  ]

  // Inventory Status Data
  const inventoryStatus = {
    totalItems: 1250,
    lowStock: 23,
    outOfStock: 5,
    reorderNeeded: 18
  }

  // Recent Transactions Data
  const recentTransactions = [
    { id: 'TXN-001', customer: 'John Doe', amount: 450.00, type: 'Sale', time: '2 mins ago', status: 'completed' },
    { id: 'TXN-002', customer: 'Jane Smith', amount: 320.50, type: 'Sale', time: '15 mins ago', status: 'completed' },
    { id: 'TXN-003', customer: 'Michael Brown', amount: 1250.00, type: 'Sale', time: '1 hour ago', status: 'completed' },
    { id: 'TXN-004', customer: 'Sarah Johnson', amount: 89.75, type: 'Sale', time: '2 hours ago', status: 'completed' }
  ]
  
  return (
    <div className="bg-gray-50 min-h-full">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo and Menu */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu size={20} className="text-gray-700" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-green-600">awosel</span>
              <span className="text-xl font-bold text-gray-900">OS</span>
            </div>
          </div>

          {/* Right Side - Utility Icons and Controls */}
          <div className="flex items-center gap-4">
            {/* Utility Icons */}
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Add">
                <Plus size={20} className="text-gray-700" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Search">
                <Search size={20} className="text-gray-700" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Settings">
                <Settings size={20} className="text-gray-700" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Help">
                <HelpCircle size={20} className="text-gray-700" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative" title="Notifications">
                <Bell size={20} className="text-gray-700" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-300"></div>

            {/* Resume Setup and Privacy */}
            <div className="flex items-center gap-4">
              <button className="text-sm text-gray-700 hover:text-gray-900 font-medium">
                Resume setup
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-gray-600" />
                <span className="text-sm text-gray-700 font-medium">PRIVACY</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacyEnabled}
                    onChange={(e) => setPrivacyEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Company Profile Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-gray-200 w-12 h-12 rounded-full flex items-center justify-center">
              <Building2 size={24} className="text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Awosel OS Store</h1>
              <p className="text-sm text-gray-500">Dashboard Overview</p>
            </div>
          </div>
        </div>

      {/* Main Grid - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Invoices Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoices</h3>
          
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-2">UNPAID LAST 365 DAYS</p>
            <p className="text-2xl font-bold text-gray-900">₵{invoiceData.unpaidLast365.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-lg font-bold text-gray-900">₵{invoiceData.overdue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} OVERDUE</p>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${(invoiceData.overdue / invoiceData.unpaidLast365) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-lg font-bold text-gray-900">₵{invoiceData.notDueYet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NOT DUE YET</p>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gray-400 rounded-full"
                  style={{ width: `${(invoiceData.notDueYet / invoiceData.unpaidLast365) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">PAID LAST 30 DAYS</p>
            <p className="text-2xl font-bold text-gray-900 mb-4">₵{invoiceData.paidLast30.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-lg font-bold text-gray-900">₵{invoiceData.notDeposited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NOT DEPOSITED</p>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-400 rounded-full"
                    style={{ width: `${(invoiceData.notDeposited / invoiceData.paidLast30) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-lg font-bold text-gray-900">₵{invoiceData.deposited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DEPOSITED</p>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-600 rounded-full"
                    style={{ width: `${(invoiceData.deposited / invoiceData.paidLast30) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Expenses</h3>
            <div className="relative">
              <select
                value={expensePeriod}
                onChange={(e) => setExpensePeriod(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="lastMonth">Last month</option>
                <option value="thisMonth">This month</option>
                <option value="lastQuarter">Last quarter</option>
                <option value="thisYear">This year</option>
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">LAST MONTH</p>
            <p className="text-3xl font-bold text-gray-900">₵{expenseData.total.toLocaleString()}</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={expenseChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expenseChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {expenseData.categories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: EXPENSE_COLORS[index % EXPENSE_COLORS.length] }}
                    />
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">₵{category.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bank Accounts Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank accounts</h3>
          
          <div className="space-y-6">
            {bankAccounts.map((account, index) => (
              <div key={index}>
                <p className="text-sm font-semibold text-gray-700 mb-3">{account.name}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bank Balance</span>
                    <span className="text-sm font-semibold text-gray-900">₵{account.bankBalance.toLocaleString(undefined,{ minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">In QuickBooks</span>
                    <span className="text-sm font-semibold text-gray-900">₵{account.quickbooksBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
                {index < bankAccounts.length - 1 && <div className="border-t border-gray-200 mt-4" />}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium block">Connect accounts</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-700 font-medium flex items-center">
              Go to registers
              <ChevronDown size={16} className="ml-1" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profit and Loss Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Profit and Loss</h3>
            <div className="relative">
              <select
                value={profitPeriod}
                onChange={(e) => setProfitPeriod(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="lastMonth">Last month</option>
                <option value="thisMonth">This month</option>
                <option value="lastQuarter">Last quarter</option>
                <option value="thisYear">This year</option>
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-1">NET INCOME FOR {new Date().toLocaleDateString('en-US', { month: 'long' }).toUpperCase()}</p>
            <p className="text-3xl font-bold text-gray-900">₵{profitLossData.netIncome.toLocaleString()}</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900">₵{profitLossData.income.toLocaleString()} INCOME</span>
                <ArrowUp size={16} className="text-green-600" />
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(profitLossData.income / (profitLossData.income + profitLossData.expenses)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900">₵{profitLossData.expenses.toLocaleString()} EXPENSES</span>
                <ArrowUp size={16} className="text-teal-600" />
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-500 rounded-full"
                  style={{ width: `${(profitLossData.expenses / (profitLossData.income + profitLossData.expenses)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sales Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg shadow-sm border border-green-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sales</h3>
            <div className="relative">
              <select
                value={salesPeriod}
                onChange={(e) => setSalesPeriod(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="thisQuarter">This quarter</option>
                <option value="lastQuarter">Last quarter</option>
                <option value="thisYear">This year</option>
                <option value="lastYear">Last year</option>
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-1 font-medium">THIS QUARTER</p>
            <p className="text-3xl font-bold text-gray-900">₵{totalSales.toLocaleString()}</p>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D1FAE5" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `₵${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value) => `₵${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Discover Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-sm border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Discover</h3>
          
          <div className="bg-gradient-to-br from-blue-200 to-indigo-300 rounded-lg h-32 mb-4 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white bg-opacity-90 rounded-full p-4 shadow-lg">
                <Play size={32} className="text-blue-600" />
              </div>
            </div>
          </div>

          <h4 className="font-semibold text-gray-900 mb-2">Is Awosel OS Payroll for you?</h4>
          <p className="text-sm text-gray-700 mb-4">
            Learn more about how Awosel OS Payroll works in this short one minute video.
          </p>
          
          <a href="#" className="text-sm text-blue-700 hover:text-blue-800 font-semibold">
            Watch now
          </a>
        </div>
      </div>

      {/* Main Grid - Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
        {/* Cash Flow Card */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-lg shadow-sm border border-purple-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Wallet size={20} className="mr-2 text-purple-600" />
              Cash Flow
            </h3>
          </div>

          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-1 font-medium">THIS MONTH</p>
            <p className="text-2xl font-bold text-gray-900">₵{cashFlowData.netFlow.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <TrendingUp size={12} className="mr-1" />
              Net positive
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-purple-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Inflow</span>
              <span className="text-sm font-semibold text-green-700">₵{cashFlowData.inflow.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Outflow</span>
              <span className="text-sm font-semibold text-red-700">₵{cashFlowData.outflow.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Top Customers Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users size={20} className="mr-2 text-primary-600" />
              Top Customers
            </h3>
          </div>

          <div className="space-y-3">
            {topCustomers.map((customer, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center flex-1">
                  <div className="bg-primary-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    <User size={16} className="text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{customer.name}</p>
                    <p className="text-xs text-gray-500">{customer.purchases} purchases</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">₵{customer.total.toLocaleString()}</p>
                  <p className="text-xs text-green-600">{customer.change}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Status Card */}
        <div className="bg-gradient-to-br from-orange-50 to-yellow-100 rounded-lg shadow-sm border border-orange-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package size={20} className="mr-2 text-orange-600" />
              Inventory Status
            </h3>
          </div>

          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-1 font-medium">TOTAL ITEMS</p>
            <p className="text-3xl font-bold text-gray-900">{inventoryStatus.totalItems.toLocaleString()}</p>
          </div>

          <div className="space-y-3 pt-4 border-t border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle size={16} className="text-orange-600 mr-2" />
                <span className="text-sm text-gray-700">Low Stock</span>
              </div>
              <span className="text-sm font-bold text-orange-700">{inventoryStatus.lowStock}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle size={16} className="text-red-600 mr-2" />
                <span className="text-sm text-gray-700">Out of Stock</span>
              </div>
              <span className="text-sm font-bold text-red-700">{inventoryStatus.outOfStock}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Package size={16} className="text-blue-600 mr-2" />
                <span className="text-sm text-gray-700">Reorder Needed</span>
              </div>
              <span className="text-sm font-bold text-blue-700">{inventoryStatus.reorderNeeded}</span>
            </div>
          </div>
        </div>


        {/* Recent Transactions Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Receipt size={20} className="mr-2 text-primary-600" />
              Recent Transactions
            </h3>
            <a href="#" className="text-xs text-blue-600 hover:text-blue-700 font-medium">View all</a>
          </div>

          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${
                      transaction.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <p className="text-sm font-semibold text-gray-900">{transaction.customer}</p>
                  </div>
                  <p className="text-xs text-gray-500">{transaction.id} • {transaction.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">₵{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="text-xs text-gray-500">{transaction.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default Dashboard
