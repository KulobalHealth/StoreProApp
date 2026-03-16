import React, { useState, useEffect } from 'react'
import { Download, Calendar, Filter, FileText, BarChart3, Package, TrendingUp, DollarSign, X, List, LayoutGrid, ShoppingBag, Users, CreditCard, Percent, ArrowUp, ArrowDown, Minus, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import UiTooltip from '../components/Tooltip'

const Reports = () => {
  const [reportType, setReportType] = useState('sales')
  const [dateRange, setDateRange] = useState('week')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showCustomRange, setShowCustomRange] = useState(false)
  const [viewMode, setViewMode] = useState('simple') // 'simple' or 'charts'

  // Sample sales transactions data
  const [salesTransactions] = useState([
    { id: 1, date: '2024-01-15', receiptNumber: 'RCP-001', customer: 'John Doe', items: 3, subtotal: 150.00, discount: 0, tax: 18.00, total: 168.00, paymentMethod: 'Cash', profit: 45.00 },
    { id: 2, date: '2024-01-15', receiptNumber: 'RCP-002', customer: 'Jane Smith', items: 2, subtotal: 80.00, discount: 5.00, tax: 9.00, total: 84.00, paymentMethod: 'Card', profit: 24.00 },
    { id: 3, date: '2024-01-14', receiptNumber: 'RCP-003', customer: 'Michael Brown', items: 5, subtotal: 200.00, discount: 10.00, tax: 22.80, total: 212.80, paymentMethod: 'Mobile Money', profit: 60.00 },
    { id: 4, date: '2024-01-14', receiptNumber: 'RCP-004', customer: 'Sarah Johnson', items: 1, subtotal: 50.00, discount: 0, tax: 6.00, total: 56.00, paymentMethod: 'Cash', profit: 15.00 },
    { id: 5, date: '2024-01-13', receiptNumber: 'RCP-005', customer: 'David Wilson', items: 4, subtotal: 120.00, discount: 0, tax: 14.40, total: 134.40, paymentMethod: 'Card', profit: 36.00 },
    { id: 6, date: '2024-01-13', receiptNumber: 'RCP-006', customer: null, items: 2, subtotal: 75.00, discount: 0, tax: 9.00, total: 84.00, paymentMethod: 'Cash', profit: 22.50 },
    { id: 7, date: '2024-01-12', receiptNumber: 'RCP-007', customer: 'John Doe', items: 6, subtotal: 300.00, discount: 15.00, tax: 34.20, total: 319.20, paymentMethod: 'Card', profit: 90.00 },
    { id: 8, date: '2024-01-12', receiptNumber: 'RCP-008', customer: 'Jane Smith', items: 3, subtotal: 150.00, discount: 0, tax: 18.00, total: 168.00, paymentMethod: 'Mobile Money', profit: 45.00 },
  ])

  // Sample inventory data
  const [inventoryData] = useState([
    { id: 1, name: 'Coca Cola 500ml', category: 'Beverages', sku: 'CC-500', stock: 50, minStock: 10, reorderPoint: 15, cost: 3.50, price: 5.00, value: 175.00, sold: 245, revenue: 1225.00 },
    { id: 2, name: 'Bread Loaf', category: 'Bakery', sku: 'BL-001', stock: 30, minStock: 15, reorderPoint: 20, cost: 3.00, price: 5.00, value: 90.00, sold: 189, revenue: 945.00 },
    { id: 3, name: 'Milk 1L', category: 'Dairy', sku: 'ML-1L', stock: 25, minStock: 10, reorderPoint: 15, cost: 3.75, price: 5.00, value: 93.75, sold: 156, revenue: 780.00 },
    { id: 4, name: 'Rice 5kg', category: 'Grains', sku: 'RC-5KG', stock: 40, minStock: 20, reorderPoint: 25, cost: 12.00, price: 15.00, value: 480.00, sold: 98, revenue: 1470.00 },
    { id: 5, name: 'Cooking Oil 1L', category: 'Cooking', sku: 'CO-1L', stock: 35, minStock: 15, reorderPoint: 20, cost: 7.50, price: 10.00, value: 262.50, sold: 87, revenue: 870.00 },
    { id: 6, name: 'Sugar 1kg', category: 'Baking', sku: 'SG-1KG', stock: 5, minStock: 10, reorderPoint: 15, cost: 6.00, price: 8.00, value: 30.00, sold: 65, revenue: 520.00 },
  ])

  // Calculate date range
  const getDateRange = () => {
    const today = new Date()
    let start, end

    switch (dateRange) {
      case 'today':
        start = new Date(today)
        end = new Date(today)
        break
      case 'week':
        start = new Date(today)
        start.setDate(today.getDate() - 7)
        end = new Date(today)
        break
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1)
        end = new Date(today)
        break
      case 'year':
        start = new Date(today.getFullYear(), 0, 1)
        end = new Date(today)
        break
      case 'custom':
        if (startDate && endDate) {
          start = new Date(startDate)
          end = new Date(endDate)
        } else {
          start = new Date(today)
          start.setDate(today.getDate() - 7)
          end = new Date(today)
        }
        break
      default:
        start = new Date(today)
        start.setDate(today.getDate() - 7)
        end = new Date(today)
    }

    return { start, end }
  }

  // Filter transactions by date range
  const filteredTransactions = salesTransactions.filter(transaction => {
    const { start, end } = getDateRange()
    const transactionDate = new Date(transaction.date)
    return transactionDate >= start && transactionDate <= end
  })

  // Calculate sales metrics
  const salesMetrics = {
    totalSales: filteredTransactions.reduce((sum, t) => sum + t.total, 0),
    totalOrders: filteredTransactions.length,
    totalProfit: filteredTransactions.reduce((sum, t) => sum + t.profit, 0),
    totalDiscounts: filteredTransactions.reduce((sum, t) => sum + t.discount, 0),
    totalTax: filteredTransactions.reduce((sum, t) => sum + t.tax, 0),
    averageOrderValue: filteredTransactions.length > 0 
      ? filteredTransactions.reduce((sum, t) => sum + t.total, 0) / filteredTransactions.length 
      : 0,
    totalItems: filteredTransactions.reduce((sum, t) => sum + t.items, 0)
  }

  // Group sales by day for chart
  const salesByDay = filteredTransactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date).toLocaleDateString('en-US', { weekday: 'short' })
    if (!acc[date]) {
      acc[date] = { date, sales: 0, profit: 0, orders: 0 }
    }
    acc[date].sales += transaction.total
    acc[date].profit += transaction.profit
    acc[date].orders += 1
    return acc
  }, {})

  const salesChartData = Object.values(salesByDay).sort((a, b) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days.indexOf(a.date) - days.indexOf(b.date)
  })

  // Sales by payment method
  const salesByPaymentMethod = filteredTransactions.reduce((acc, transaction) => {
    if (!acc[transaction.paymentMethod]) {
      acc[transaction.paymentMethod] = { name: transaction.paymentMethod, value: 0, amount: 0 }
    }
    acc[transaction.paymentMethod].value += 1
    acc[transaction.paymentMethod].amount += transaction.total
    return acc
  }, {})

  const paymentMethodData = Object.values(salesByPaymentMethod)

  // Sales by category (from inventory)
  const salesByCategory = inventoryData.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { name: item.category, value: 0, amount: 0 }
    }
    acc[item.category].value += item.sold
    acc[item.category].amount += item.revenue
    return acc
  }, {})

  const categoryData = Object.values(salesByCategory)

  // Top products
  const topProducts = [...inventoryData]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 10)
    .map(item => ({
      name: item.name,
      sold: item.sold,
      revenue: item.revenue,
      profit: item.revenue - (item.sold * item.cost),
      margin: ((item.revenue - (item.sold * item.cost)) / item.revenue * 100)
    }))

  // Inventory metrics
  const inventoryMetrics = {
    totalProducts: inventoryData.length,
    totalStockValue: inventoryData.reduce((sum, item) => sum + item.value, 0),
    lowStockItems: inventoryData.filter(item => item.stock <= item.minStock).length,
    itemsNeedingReorder: inventoryData.filter(item => item.stock <= item.reorderPoint).length,
    totalCategories: new Set(inventoryData.map(item => item.category)).size
  }

  const COLORS = ['#0ea5e9', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

  // Export functions
  const handleExportCSV = () => {
    let csvContent = ''
    let filename = ''

    if (reportType === 'sales') {
      filename = `sales_report_${new Date().toISOString().split('T')[0]}.csv`
      const headers = ['Date', 'Receipt #', 'Customer', 'Items', 'Subtotal', 'Discount', 'Tax', 'Total', 'Payment Method', 'Profit']
      csvContent = [
        headers.join(','),
        ...filteredTransactions.map(t => [
          t.date,
          t.receiptNumber,
          t.customer || 'Walk-in',
          t.items,
          t.subtotal.toFixed(2),
          t.discount.toFixed(2),
          t.tax.toFixed(2),
          t.total.toFixed(2),
          t.paymentMethod,
          t.profit.toFixed(2)
        ].join(','))
      ].join('\n')
    } else if (reportType === 'inventory') {
      filename = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`
      const headers = ['Product', 'Category', 'SKU', 'Stock', 'Min Stock', 'Reorder Point', 'Cost', 'Price', 'Stock Value', 'Units Sold', 'Revenue']
      csvContent = [
        headers.join(','),
        ...inventoryData.map(item => [
          `"${item.name}"`,
          item.category,
          item.sku,
          item.stock,
          item.minStock,
          item.reorderPoint,
          item.cost.toFixed(2),
          item.price.toFixed(2),
          item.value.toFixed(2),
          item.sold,
          item.revenue.toFixed(2)
        ].join(','))
      ].join('\n')
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    alert(`Report exported successfully as ${filename}`)
  }

  const handleExportPDF = () => {
    // In a real app, use a library like jsPDF or html2pdf
    alert('PDF export functionality would be implemented here. For now, you can use the browser\'s print function.')
    window.print()
  }

  useEffect(() => {
    if (dateRange === 'custom') {
      setShowCustomRange(true)
    } else {
      setShowCustomRange(false)
    }
  }, [dateRange])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-500 text-white">
                <BarChart3 size={18} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">Reports & Analytics</h1>
                <p className="text-gray-500 text-xs">Generate sales reports and access analytics data</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <UiTooltip text="Simple list view">
                  <button
                    onClick={() => setViewMode('simple')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${
                      viewMode === 'simple'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <List size={16} className="mr-1.5" />
                    Simple
                  </button>
                </UiTooltip>
                <UiTooltip text="Visual charts view">
                  <button
                    onClick={() => setViewMode('charts')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${
                      viewMode === 'charts'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <BarChart3 size={16} className="mr-1.5" />
                    Charts
                  </button>
                </UiTooltip>
              </div>
              <UiTooltip text="Export current report data as a CSV spreadsheet">
                <button 
                  onClick={handleExportCSV}
                  className="btn-secondary flex items-center"
                >
                  <Download size={18} className="mr-2" />
                  Export CSV
                </button>
              </UiTooltip>
              <UiTooltip text="Print or save report as PDF using browser print">
                <button 
                  onClick={handleExportPDF}
                  className="btn-secondary flex items-center"
                >
                  <FileText size={18} className="mr-2" />
                  Export PDF
                </button>
              </UiTooltip>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5">

      {/* Report Type Tabs */}
      <div className="mb-6">
        <div className="flex space-x-2 border-b">
          <button
            onClick={() => setReportType('sales')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              reportType === 'sales'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <DollarSign size={18} className="inline mr-2" />
            Sales Reports
          </button>
          <button
            onClick={() => setReportType('inventory')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              reportType === 'inventory'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package size={18} className="inline mr-2" />
            Inventory Reports
          </button>
          <button
            onClick={() => setReportType('profit')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              reportType === 'profit'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp size={18} className="inline mr-2" />
            Profit Analysis
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-gray-500" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        {showCustomRange && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}
      </div>

      {/* Sales Reports */}
      {reportType === 'sales' && (
        <>
          {/* Sales Summary Cards - Enhanced */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
              <div className="flex items-center justify-between mb-2">
                <DollarSign size={24} className="text-primary-600" />
                <span className="text-xs bg-primary-200 text-primary-800 px-2 py-1 rounded-full font-semibold">
                  {salesMetrics.totalOrders} orders
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-1 font-medium">Total Sales</p>
              <p className="text-3xl font-bold text-gray-900">₵{salesMetrics.totalSales.toFixed(2)}</p>
              <p className="text-xs text-gray-600 mt-2">{salesMetrics.totalItems} items sold</p>
            </div>
            <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp size={24} className="text-green-600" />
                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-semibold">
                  {((salesMetrics.totalProfit / salesMetrics.totalSales) * 100).toFixed(1)}% margin
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-1 font-medium">Total Profit</p>
              <p className="text-3xl font-bold text-gray-900">₵{salesMetrics.totalProfit.toFixed(2)}</p>
              <p className="text-xs text-gray-600 mt-2">After all costs</p>
            </div>
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
              <div className="flex items-center justify-between mb-2">
                <ShoppingBag size={24} className="text-primary-600" />
                <span className="text-xs bg-primary-200 text-primary-800 px-2 py-1 rounded-full font-semibold">
                  Avg
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-1 font-medium">Average Order Value</p>
              <p className="text-3xl font-bold text-gray-900">₵{salesMetrics.averageOrderValue.toFixed(2)}</p>
              <p className="text-xs text-gray-600 mt-2">Per transaction</p>
            </div>
            <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <Percent size={24} className="text-orange-600" />
                <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full font-semibold">
                  Discounts
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-1 font-medium">Total Discounts</p>
              <p className="text-3xl font-bold text-gray-900">₵{salesMetrics.totalDiscounts.toFixed(2)}</p>
              <p className="text-xs text-gray-600 mt-2">Given to customers</p>
            </div>
          </div>

          {/* Simple View - Daily Breakdown */}
          {viewMode === 'simple' && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Sales Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {salesChartData.map((day, index) => {
                  const prevDay = salesChartData[index - 1]
                  const change = prevDay ? ((day.sales - prevDay.sales) / prevDay.sales * 100) : 0
                  return (
                    <div key={day.date} className="card border-l-4 border-primary-500">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{day.date}</h3>
                        {prevDay && (
                          <span className={`text-xs flex items-center ${
                            change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {change > 0 ? <ArrowUp size={14} className="mr-1" /> : 
                             change < 0 ? <ArrowDown size={14} className="mr-1" /> : 
                             <Minus size={14} className="mr-1" />}
                            {Math.abs(change).toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Sales:</span>
                          <span className="font-bold text-lg text-primary-600">₵{day.sales.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Profit:</span>
                          <span className="font-bold text-lg text-green-600">₵{day.profit.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-sm text-gray-600">Orders:</span>
                          <span className="font-semibold text-gray-900">{day.orders}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Charts View */}
          {viewMode === 'charts' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Sales Trend Chart */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Sales & Profit Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#0ea5e9" name="Sales (₵)" />
                    <Bar dataKey="profit" fill="#10b981" name="Profit (₵)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Payment Method Distribution */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Sales by Payment Method</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Simple View - Payment Methods */}
          {viewMode === 'simple' && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Sales by Payment Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paymentMethodData.map((method, index) => {
                  const percentage = (method.amount / salesMetrics.totalSales) * 100
                  return (
                    <div key={method.name} className="card">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <CreditCard size={20} className="text-gray-400 mr-2" />
                          <span className="font-semibold text-gray-900">{method.name}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Amount:</span>
                          <span className="font-bold text-lg text-primary-600">₵{method.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Transactions:</span>
                          <span className="font-semibold text-gray-900">{method.value}</span>
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="h-3 rounded-full transition-all"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-1 text-right">{percentage.toFixed(1)}% of total sales</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Sales Transactions Table */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sales Transactions</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Receipt #</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Items</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Subtotal</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Discount</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payment</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{new Date(transaction.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-medium">{transaction.receiptNumber}</td>
                        <td className="py-3 px-4 text-gray-700">{transaction.customer || 'Walk-in'}</td>
                        <td className="py-3 px-4 text-right">{transaction.items}</td>
                        <td className="py-3 px-4 text-right">₵{transaction.subtotal.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-orange-600">₵{transaction.discount.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-primary-600">₵{transaction.total.toFixed(2)}</td>
                        <td className="py-3 px-4 text-gray-700">{transaction.paymentMethod}</td>
                        <td className="py-3 px-4 text-right text-green-600 font-semibold">₵{transaction.profit.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="py-8 text-center text-gray-500">
                        No transactions found for the selected date range
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Inventory Reports */}
      {reportType === 'inventory' && (
        <>
          {/* Inventory Summary Cards - Enhanced */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            <div className="card bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
              <div className="flex items-center mb-2">
                <Package size={24} className="text-gray-600 mr-2" />
                <p className="text-sm text-gray-700 font-medium">Total Products</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{inventoryMetrics.totalProducts}</p>
              <p className="text-xs text-gray-600 mt-2">Items in inventory</p>
            </div>
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
              <div className="flex items-center mb-2">
                <DollarSign size={24} className="text-primary-600 mr-2" />
                <p className="text-sm text-gray-700 font-medium">Total Stock Value</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">₵{inventoryMetrics.totalStockValue.toFixed(2)}</p>
              <p className="text-xs text-gray-600 mt-2">At cost price</p>
            </div>
            <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <div className="flex items-center mb-2">
                <AlertTriangle size={24} className="text-yellow-600 mr-2" />
                <p className="text-sm text-gray-700 font-medium">Low Stock Items</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{inventoryMetrics.lowStockItems}</p>
              <p className="text-xs text-gray-600 mt-2">Need attention</p>
            </div>
            <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <div className="flex items-center mb-2">
                <ShoppingBag size={24} className="text-orange-600 mr-2" />
                <p className="text-sm text-gray-700 font-medium">Need Reorder</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{inventoryMetrics.itemsNeedingReorder}</p>
              <p className="text-xs text-gray-600 mt-2">Below reorder point</p>
            </div>
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
              <div className="flex items-center mb-2">
                <LayoutGrid size={24} className="text-primary-600 mr-2" />
                <p className="text-sm text-gray-700 font-medium">Categories</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{inventoryMetrics.totalCategories}</p>
              <p className="text-xs text-gray-600 mt-2">Product categories</p>
            </div>
          </div>

          {/* Simple View - Category Breakdown */}
          {viewMode === 'simple' && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Sales by Category</h2>
              <div className="space-y-4">
                {categoryData
                  .sort((a, b) => b.amount - a.amount)
                  .map((category, index) => {
                    const percentage = (category.amount / categoryData.reduce((sum, c) => sum + c.amount, 0)) * 100
                    return (
                      <div key={category.name} className="card">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-3"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <h3 className="font-semibold text-lg text-gray-900">{category.name}</h3>
                          </div>
                          <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Revenue:</span>
                            <span className="font-bold text-lg text-primary-600">₵{category.amount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Units Sold:</span>
                            <span className="font-semibold text-gray-900">{category.value}</span>
                          </div>
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-4">
                              <div 
                                className="h-4 rounded-full transition-all flex items-center justify-end pr-2"
                                style={{ 
                                  width: `${percentage}%`,
                                  backgroundColor: COLORS[index % COLORS.length]
                                }}
                              >
                                <span className="text-xs text-white font-semibold">{percentage.toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Charts View */}
          {viewMode === 'charts' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Sales by Category */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Sales by Category</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Stock Value by Category */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Stock Value by Category</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#0ea5e9" name="Revenue (₵)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Inventory Data Table */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Inventory Data</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">SKU</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Stock</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Min Stock</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Reorder Point</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Cost</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Stock Value</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Units Sold</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.map((item) => {
                    const isLowStock = item.stock <= item.minStock
                    const needsReorder = item.stock <= item.reorderPoint
                    return (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{item.name}</td>
                        <td className="py-3 px-4 text-gray-700">{item.category}</td>
                        <td className="py-3 px-4 text-gray-700">{item.sku}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-semibold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                            {item.stock}
                          </span>
                          {isLowStock && <span className="ml-1 text-xs text-red-600">(Low)</span>}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700">{item.minStock}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-semibold ${needsReorder ? 'text-orange-600' : 'text-gray-700'}`}>
                            {item.reorderPoint}
                          </span>
                          {needsReorder && <span className="ml-1 text-xs text-orange-600">(Reorder)</span>}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">₵{item.cost.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-semibold">₵{item.price.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-primary-600">₵{item.value.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-gray-700">{item.sold}</td>
                        <td className="py-3 px-4 text-right font-semibold text-green-600">₵{item.revenue.toFixed(2)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Profit Analysis Reports */}
      {reportType === 'profit' && (
        <>
          {/* Profit Summary Cards - Enhanced */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
              <div className="flex items-center mb-2">
                <DollarSign size={24} className="text-primary-600 mr-2" />
                <p className="text-sm text-gray-700 font-medium">Total Revenue</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">₵{salesMetrics.totalSales.toFixed(2)}</p>
              <p className="text-xs text-gray-600 mt-2">All sales income</p>
            </div>
            <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center mb-2">
                <TrendingUp size={24} className="text-green-600 mr-2" />
                <p className="text-sm text-gray-700 font-medium">Total Profit</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">₵{salesMetrics.totalProfit.toFixed(2)}</p>
              <p className="text-xs text-gray-600 mt-2">After all expenses</p>
            </div>
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
              <div className="flex items-center mb-2">
                <Percent size={24} className="text-primary-600 mr-2" />
                <p className="text-sm text-gray-700 font-medium">Profit Margin</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {((salesMetrics.totalProfit / salesMetrics.totalSales) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600 mt-2">Profit percentage</p>
            </div>
            <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <div className="flex items-center mb-2">
                <TrendingDown size={24} className="text-red-600 mr-2" />
                <p className="text-sm text-gray-700 font-medium">Total Costs</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                ₵{(salesMetrics.totalSales - salesMetrics.totalProfit).toFixed(2)}
              </p>
              <p className="text-xs text-gray-600 mt-2">Product costs</p>
            </div>
          </div>

          {/* Simple View - Top Products */}
          {viewMode === 'simple' && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Selling Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topProducts.map((product, index) => {
                  const margin = product.margin
                  const marginColor = margin > 30 ? 'text-green-600' : margin > 20 ? 'text-yellow-600' : 'text-red-600'
                  const marginBg = margin > 30 ? 'bg-green-100 border-green-200' : margin > 20 ? 'bg-yellow-100 border-yellow-200' : 'bg-red-100 border-red-200'
                  
                  return (
                    <div key={index} className={`card border-l-4 ${marginBg}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <span className="text-2xl font-bold text-gray-400 mr-3">#{index + 1}</span>
                          <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${marginColor}`}>
                          {margin.toFixed(1)}% margin
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Units Sold</p>
                          <p className="font-bold text-lg text-gray-900">{product.sold}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Revenue</p>
                          <p className="font-bold text-lg text-primary-600">₵{product.revenue.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Profit</p>
                          <p className="font-bold text-lg text-green-600">₵{product.profit.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Charts View - Top Products Table */}
          {viewMode === 'charts' && (
            <div className="card mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Selling Products (Profit Analysis)</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Units Sold</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Profit</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product, index) => {
                      const margin = product.margin
                      return (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{product.name}</td>
                          <td className="py-3 px-4 text-right">{product.sold}</td>
                          <td className="py-3 px-4 text-right font-semibold">₵{product.revenue.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right text-green-600 font-semibold">₵{product.profit.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`font-semibold ${margin > 30 ? 'text-green-600' : margin > 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {margin.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Profit Trend Chart */}
          {viewMode === 'charts' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profit Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit (₵)" />
                  <Line type="monotone" dataKey="sales" stroke="#0ea5e9" strokeWidth={2} name="Sales (₵)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
    </div>
  )
}

export default Reports
