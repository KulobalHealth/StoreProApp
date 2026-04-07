import React, { useState, useEffect } from 'react'
import { HIcon } from '../components/HIcon'
import {
  Activity01Icon,
  AlertCircleIcon,
  ArrowDown01Icon,
  ArrowMoveDownRightIcon,
  ArrowMoveUpRightIcon,
  ArrowUp01Icon,
  Building01Icon,
  CalculatorIcon,
  Calendar01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  CreditCardIcon,
  DatabaseIcon,
  DollarCircleIcon,
  Download01Icon,
  FileValidationIcon,
  FilterIcon,
  FlashIcon,
  LandmarkIcon,
  Package01Icon,
  PercentIcon,
  ReceiptTextIcon,
  Shield01Icon,
  TaskDone01Icon,
  UserCheck01Icon,
  UserGroupIcon,
  ViewIcon,
  Wallet02Icon,
} from '@hugeicons/core-free-icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'

const Accounting = () => {
  // Ghanaian Tax Rates
  const TAX_RATES = {
    VAT: 12.5, // Value Added Tax
    NHIL: 2.5, // National Health Insurance Levy
    GETFund: 2.5, // GETFund Levy
    CorporateTax: 25, // Corporate Income Tax
    WithholdingTax: 5 // Withholding Tax
  }

  const [reportType, setReportType] = useState('overview')
  const [dateRange, setDateRange] = useState('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showCustomRange, setShowCustomRange] = useState(false)

  // Sample transactions with Ghanaian tax structure
  const [transactions] = useState([
    {
      id: 1,
      date: '2024-01-15',
      type: 'sale',
      receiptNumber: 'RCP-001',
      description: 'Sales Revenue',
      debit: 0,
      credit: 1000.00,
      vat: 125.00,
      nhil: 25.00,
      getfund: 25.00,
      netAmount: 825.00,
      account: 'Revenue',
      category: 'Sales'
    },
    {
      id: 2,
      date: '2024-01-15',
      type: 'expense',
      receiptNumber: 'EXP-001',
      description: 'Office Supplies',
      debit: 200.00,
      credit: 0,
      vat: 25.00,
      nhil: 5.00,
      getfund: 5.00,
      netAmount: 165.00,
      account: 'Expenses',
      category: 'Operating Expenses'
    },
    {
      id: 3,
      date: '2024-01-14',
      type: 'sale',
      receiptNumber: 'RCP-002',
      description: 'Sales Revenue',
      debit: 0,
      credit: 1500.00,
      vat: 187.50,
      nhil: 37.50,
      getfund: 37.50,
      netAmount: 1237.50,
      account: 'Revenue',
      category: 'Sales'
    },
    {
      id: 4,
      date: '2024-01-14',
      type: 'purchase',
      receiptNumber: 'PO-001',
      description: 'Inventory Purchase',
      debit: 800.00,
      credit: 0,
      vat: 100.00,
      nhil: 20.00,
      getfund: 20.00,
      netAmount: 660.00,
      account: 'Inventory',
      category: 'Cost of Goods Sold'
    },
    {
      id: 5,
      date: '2024-01-13',
      type: 'sale',
      receiptNumber: 'RCP-003',
      description: 'Sales Revenue',
      debit: 0,
      credit: 750.00,
      vat: 93.75,
      nhil: 18.75,
      getfund: 18.75,
      netAmount: 618.75,
      account: 'Revenue',
      category: 'Sales'
    },
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
      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3)
        start = new Date(today.getFullYear(), quarter * 3, 1)
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
          start = new Date(today.getFullYear(), today.getMonth(), 1)
          end = new Date(today)
        }
        break
      default:
        start = new Date(today.getFullYear(), today.getMonth(), 1)
        end = new Date(today)
    }

    return { start, end }
  }

  // Filter transactions by date range
  const filteredTransactions = transactions.filter(transaction => {
    const { start, end } = getDateRange()
    const transactionDate = new Date(transaction.date)
    return transactionDate >= start && transactionDate <= end
  })

  // Calculate financial metrics
  const calculateFinancials = () => {
    const sales = filteredTransactions.filter(t => t.type === 'sale')
    const expenses = filteredTransactions.filter(t => t.type === 'expense')
    const purchases = filteredTransactions.filter(t => t.type === 'purchase')

    const totalRevenue = sales.reduce((sum, t) => sum + t.credit, 0)
    const totalExpenses = expenses.reduce((sum, t) => sum + t.debit, 0)
    const totalPurchases = purchases.reduce((sum, t) => sum + t.debit, 0)
    const totalVAT = filteredTransactions.reduce((sum, t) => sum + t.vat, 0)
    const totalNHIL = filteredTransactions.reduce((sum, t) => sum + t.nhil, 0)
    const totalGETFund = filteredTransactions.reduce((sum, t) => sum + t.getfund, 0)
    const grossProfit = totalRevenue - totalPurchases
    const netProfit = grossProfit - totalExpenses
    const totalTax = totalVAT + totalNHIL + totalGETFund

    return {
      totalRevenue,
      totalExpenses,
      totalPurchases,
      grossProfit,
      netProfit,
      totalVAT,
      totalNHIL,
      totalGETFund,
      totalTax,
      taxPayable: totalVAT - (purchases.reduce((sum, t) => sum + t.vat, 0)) // VAT Output - VAT Input
    }
  }

  const financials = calculateFinancials()

  // Income Statement Data
  const incomeStatement = {
    revenue: {
      sales: financials.totalRevenue,
      otherIncome: 0,
      totalRevenue: financials.totalRevenue
    },
    costOfGoodsSold: {
      openingStock: 5000,
      purchases: financials.totalPurchases,
      closingStock: 4500,
      costOfGoodsSold: 5000 + financials.totalPurchases - 4500
    },
    grossProfit: financials.grossProfit,
    operatingExpenses: {
      salaries: 2000,
      rent: 1500,
      utilities: 300,
      otherExpenses: financials.totalExpenses,
      totalOperatingExpenses: 2000 + 1500 + 300 + financials.totalExpenses
    },
    operatingProfit: financials.grossProfit - (2000 + 1500 + 300 + financials.totalExpenses),
    taxes: {
      corporateTax: (financials.netProfit * TAX_RATES.CorporateTax) / 100,
      vatPayable: financials.taxPayable,
      nhil: financials.totalNHIL,
      getfund: financials.totalGETFund
    },
    netProfit: financials.netProfit - ((financials.netProfit * TAX_RATES.CorporateTax) / 100)
  }

  // Balance Sheet Data
  const balanceSheet = {
    assets: {
      currentAssets: {
        cash: 15000,
        accountsReceivable: 5000,
        inventory: 4500,
        prepaidExpenses: 500,
        totalCurrentAssets: 25000
      },
      fixedAssets: {
        equipment: 20000,
        furniture: 5000,
        accumulatedDepreciation: -3000,
        totalFixedAssets: 22000
      },
      totalAssets: 47000
    },
    liabilities: {
      currentLiabilities: {
        accountsPayable: 3000,
        vatPayable: financials.taxPayable,
        nhilPayable: financials.totalNHIL,
        getfundPayable: financials.totalGETFund,
        shortTermDebt: 2000,
        totalCurrentLiabilities: 3000 + financials.taxPayable + financials.totalNHIL + financials.totalGETFund + 2000
      },
      longTermLiabilities: {
        longTermDebt: 10000,
        totalLongTermLiabilities: 10000
      },
      totalLiabilities: 3000 + financials.taxPayable + financials.totalNHIL + financials.totalGETFund + 2000 + 10000
    },
    equity: {
      capital: 20000,
      retainedEarnings: incomeStatement.netProfit,
      totalEquity: 20000 + incomeStatement.netProfit
    }
  }

  // Group transactions by date for charts
  const transactionsByDate = filteredTransactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    if (!acc[date]) {
      acc[date] = { date, revenue: 0, expenses: 0, profit: 0 }
    }
    if (transaction.type === 'sale') {
      acc[date].revenue += transaction.credit
      acc[date].profit += transaction.credit
    } else {
      acc[date].expenses += transaction.debit
      acc[date].profit -= transaction.debit
    }
    return acc
  }, {})

  const chartData = Object.values(transactionsByDate).sort((a, b) => {
    return new Date(a.date) - new Date(b.date)
  })

  // Export functions
  const handleExportCSV = (type) => {
    let csvContent = ''
    let filename = ''

    if (type === 'transactions') {
      filename = `accounting_transactions_${new Date().toISOString().split('T')[0]}.csv`
      const headers = ['Date', 'Type', 'Receipt #', 'Description', 'Debit', 'Credit', 'VAT', 'NHIL', 'GETFund', 'Net Amount', 'Account', 'Category']
      csvContent = [
        headers.join(','),
        ...filteredTransactions.map(t => [
          t.date,
          t.type,
          t.receiptNumber,
          `"${t.description}"`,
          t.debit.toFixed(2),
          t.credit.toFixed(2),
          t.vat.toFixed(2),
          t.nhil.toFixed(2),
          t.getfund.toFixed(2),
          t.netAmount.toFixed(2),
          t.account,
          t.category
        ].join(','))
      ].join('\n')
    } else if (type === 'tax') {
      filename = `tax_report_${new Date().toISOString().split('T')[0]}.csv`
      csvContent = [
        'Tax Type,Amount (₵)',
        `VAT Output,${financials.totalVAT.toFixed(2)}`,
        `VAT Input,${filteredTransactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.vat, 0).toFixed(2)}`,
        `VAT Payable,${financials.taxPayable.toFixed(2)}`,
        `NHIL,${financials.totalNHIL.toFixed(2)}`,
        `GETFund,${financials.totalGETFund.toFixed(2)}`,
        `Total Tax,${financials.totalTax.toFixed(2)}`
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
    <div className="min-h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-500 text-white">
                <HIcon icon={CalculatorIcon} size={18} strokeWidth={2}  />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">Accounting & Audit Tools</h1>
                <p className="text-gray-500 text-xs">Financial statements, tax reports, and audit trail</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleExportCSV('transactions')}
                className="btn-secondary flex items-center"
              >
                <HIcon icon={Download01Icon} size={18} className="mr-2"  />
                Export CSV
              </button>
              <button 
                onClick={handleExportPDF}
                className="btn-secondary flex items-center"
              >
                <HIcon icon={FileValidationIcon} size={18} className="mr-2"  />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5">

      {/* Report Type Tabs */}
      <div className="mb-6">
        <div className="flex space-x-2 border-b">
          <button
            onClick={() => setReportType('overview')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              reportType === 'overview'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <HIcon icon={ArrowMoveUpRightIcon} size={18} className="inline mr-2"  />
            Overview
          </button>
          <button
            onClick={() => setReportType('income')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              reportType === 'income'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <HIcon icon={DollarCircleIcon} size={18} className="inline mr-2"  />
            Income Statement
          </button>
          <button
            onClick={() => setReportType('balance')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              reportType === 'balance'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <HIcon icon={FileValidationIcon} size={18} className="inline mr-2"  />
            Balance Sheet
          </button>
          <button
            onClick={() => setReportType('tax')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              reportType === 'tax'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <HIcon icon={CalculatorIcon} size={18} className="inline mr-2"  />
            Tax Reports
          </button>
          <button
            onClick={() => setReportType('audit')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              reportType === 'audit'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <HIcon icon={Shield01Icon} size={18} className="inline mr-2"  />
            Audit Trail
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <HIcon icon={Calendar01Icon} size={18} className="text-gray-500"  />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
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

      {/* Overview */}
      {reportType === 'overview' && (
        <>
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-l-4 border-primary-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₵{financials.totalRevenue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <div className="flex items-center mt-2">
                    <HIcon icon={ArrowMoveUpRightIcon} size={14} className="text-primary-600 mr-1"  />
                    <span className="text-xs text-gray-600">{filteredTransactions.filter(t => t.type === 'sale').length} sales</span>
                  </div>
                </div>
                <div className="bg-primary-600 p-3 rounded-lg">
                  <HIcon icon={DollarCircleIcon} size={24} className="text-white"  />
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gross Profit</p>
                  <p className="text-2xl font-bold text-green-700">₵{financials.grossProfit.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <div className="flex items-center mt-2">
                    <HIcon icon={PercentIcon} size={14} className="text-green-600 mr-1"  />
                    <span className="text-xs text-gray-600">
                      Margin: {financials.totalRevenue > 0 ? ((financials.grossProfit / financials.totalRevenue) * 100).toFixed(1) : '0.0'}%
                    </span>
                  </div>
                </div>
                <div className="bg-green-600 p-3 rounded-lg">
                  <HIcon icon={ArrowMoveUpRightIcon} size={24} className="text-white"  />
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-l-4 border-primary-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Net Profit</p>
                  <p className="text-2xl font-bold text-primary-700">₵{financials.netProfit.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <div className="flex items-center mt-2">
                    <HIcon icon={CheckmarkCircle02Icon} size={14} className="text-primary-600 mr-1"  />
                    <span className="text-xs text-gray-600">After expenses</span>
                  </div>
                </div>
                <div className="bg-primary-600 p-3 rounded-lg">
                  <HIcon icon={DollarCircleIcon} size={24} className="text-white"  />
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Tax</p>
                  <p className="text-2xl font-bold text-orange-700">₵{financials.totalTax.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <div className="flex items-center mt-2">
                    <HIcon icon={CalculatorIcon} size={14} className="text-orange-600 mr-1"  />
                    <span className="text-xs text-gray-600">VAT, NHIL, GETFund</span>
                  </div>
                </div>
                <div className="bg-orange-600 p-3 rounded-lg">
                  <HIcon icon={Shield01Icon} size={24} className="text-white"  />
                </div>
              </div>
            </div>
          </div>

          {/* Financial Trend Chart */}
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <HIcon icon={ArrowMoveUpRightIcon} size={24} className="mr-3 text-primary-600"  />
                  Financial Trend
                </h2>
                <p className="text-sm text-gray-600 mt-2 flex items-center">
                  <HIcon icon={Calendar01Icon} size={16} className="mr-2"  />
                  Period: {getDateRange().start.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} to {getDateRange().end.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#0ea5e9" 
                    strokeWidth={3} 
                    name="Revenue (₵)"
                    dot={{ fill: '#0ea5e9', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#ef4444" 
                    strokeWidth={3} 
                    name="Expenses (₵)"
                    dot={{ fill: '#ef4444', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    name="Profit (₵)"
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="card">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <HIcon icon={Activity01Icon} size={24} className="mr-3 text-primary-600"  />
                  Recent Transactions
                </h2>
                <p className="text-sm text-gray-600 mt-2">All transactions for the selected period</p>
              </div>
              <button
                onClick={() => handleExportCSV('transactions')}
                className="btn-secondary flex items-center"
              >
                <HIcon icon={Download01Icon} size={18} className="mr-2"  />
                Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Receipt #</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Description</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Debit</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Credit</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">VAT</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Account</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-700">
                        <div className="flex items-center">
                          <HIcon icon={Calendar01Icon} size={14} className="text-gray-400 mr-2"  />
                          {new Date(transaction.date).toLocaleDateString('en-GB')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center w-fit ${
                          transaction.type === 'sale' ? 'bg-green-100 text-green-800' :
                          transaction.type === 'expense' ? 'bg-red-100 text-red-800' :
                          'bg-primary-100 text-primary-800'
                        }`}>
                          {transaction.type === 'sale' && <HIcon icon={ArrowMoveUpRightIcon} size={12} className="mr-1"  />}
                          {transaction.type === 'expense' && <HIcon icon={ArrowMoveDownRightIcon} size={12} className="mr-1"  />}
                          {transaction.type === 'purchase' && <HIcon icon={Package01Icon} size={12} className="mr-1"  />}
                          {transaction.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm text-gray-900 bg-gray-50 rounded">{transaction.receiptNumber}</td>
                      <td className="py-3 px-4 text-gray-700">{transaction.description}</td>
                      <td className="py-3 px-4 text-right">
                        {transaction.debit > 0 ? (
                          <span className="font-semibold text-red-600">
                            ₵{transaction.debit.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {transaction.credit > 0 ? (
                          <span className="font-semibold text-green-600">
                            ₵{transaction.credit.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-primary-600 font-medium">
                        ₵{transaction.vat.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-gray-700">{transaction.account}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr className="border-t-2">
                    <td colSpan="4" className="py-4 px-4 font-bold text-gray-900">Total</td>
                    <td className="py-4 px-4 text-right font-bold text-red-600">
                      ₵{filteredTransactions.reduce((sum, t) => sum + t.debit, 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-green-600">
                      ₵{filteredTransactions.reduce((sum, t) => sum + t.credit, 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-primary-600">
                      ₵{filteredTransactions.reduce((sum, t) => sum + t.vat, 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Income Statement */}
      {reportType === 'income' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-l-4 border-primary-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₵{incomeStatement.revenue.totalRevenue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <div className="flex items-center mt-2">
                    <HIcon icon={DollarCircleIcon} size={14} className="text-primary-600 mr-1"  />
                    <span className="text-xs text-gray-600">Sales & Income</span>
                  </div>
                </div>
                <div className="bg-primary-600 p-3 rounded-lg">
                  <HIcon icon={ArrowMoveUpRightIcon} size={24} className="text-white"  />
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gross Profit</p>
                  <p className="text-2xl font-bold text-gray-900">₵{incomeStatement.grossProfit.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <div className="flex items-center mt-2">
                    <HIcon icon={PercentIcon} size={14} className="text-green-600 mr-1"  />
                    <span className="text-xs text-gray-600">
                      {incomeStatement.revenue.totalRevenue > 0 
                        ? `${((incomeStatement.grossProfit / incomeStatement.revenue.totalRevenue) * 100).toFixed(1)}% margin`
                        : '0% margin'}
                    </span>
                  </div>
                </div>
                <div className="bg-green-600 p-3 rounded-lg">
                  <HIcon icon={ArrowUp01Icon} size={24} className="text-white"  />
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-l-4 border-primary-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Operating Profit</p>
                  <p className="text-2xl font-bold text-gray-900">₵{incomeStatement.operatingProfit.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <div className="flex items-center mt-2">
                    <HIcon icon={Building01Icon} size={14} className="text-primary-600 mr-1"  />
                    <span className="text-xs text-gray-600">Before taxes</span>
                  </div>
                </div>
                <div className="bg-primary-600 p-3 rounded-lg">
                  <HIcon icon={ArrowMoveUpRightIcon} size={24} className="text-white"  />
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-emerald-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Net Profit</p>
                  <p className="text-2xl font-bold text-emerald-700">₵{incomeStatement.netProfit.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <div className="flex items-center mt-2">
                    <HIcon icon={CheckmarkCircle02Icon} size={14} className="text-emerald-600 mr-1"  />
                    <span className="text-xs text-gray-600">After all taxes</span>
                  </div>
                </div>
                <div className="bg-emerald-600 p-3 rounded-lg">
                  <HIcon icon={DollarCircleIcon} size={24} className="text-white"  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Income Statement */}
          <div className="card">
            <div className="flex justify-between items-center mb-8 pb-4 border-b">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                  <HIcon icon={FileValidationIcon} size={28} className="mr-3 text-primary-600"  />
                  Income Statement
                </h2>
                <p className="text-sm text-gray-600 mt-2 flex items-center">
                  <HIcon icon={Calendar01Icon} size={16} className="mr-2"  />
                  For the period: {getDateRange().start.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} to {getDateRange().end.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => handleExportCSV('tax')}
                className="btn-primary flex items-center"
              >
                <HIcon icon={Download01Icon} size={18} className="mr-2"  />
                Export Report
              </button>
            </div>

            <div className="space-y-8">
              {/* Revenue Section */}
              <div className="bg-gradient-to-r from-primary-50 to-transparent p-6 rounded-lg border-l-4 border-primary-600">
                <div className="flex items-center mb-4">
                  <HIcon icon={DollarCircleIcon} size={20} className="text-primary-600 mr-2"  />
                  <h3 className="text-xl font-bold text-gray-900">Revenue</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700 font-medium">Sales Revenue</span>
                    <span className="font-bold text-lg text-gray-900">₵{incomeStatement.revenue.sales.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700 font-medium">Other Income</span>
                    <span className="font-bold text-lg text-gray-900">₵{incomeStatement.revenue.otherIncome.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 px-4 bg-primary-100 rounded-lg border-2 border-primary-300">
                    <span className="font-bold text-lg text-gray-900">Total Revenue</span>
                    <span className="font-bold text-2xl text-primary-700">₵{incomeStatement.revenue.totalRevenue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Cost of Goods Sold */}
              <div className="bg-gradient-to-r from-orange-50 to-transparent p-6 rounded-lg border-l-4 border-orange-600">
                <div className="flex items-center mb-4">
                  <HIcon icon={Package01Icon} size={20} className="text-orange-600 mr-2"  />
                  <h3 className="text-xl font-bold text-gray-900">Cost of Goods Sold</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700">Opening Stock</span>
                    <span className="font-semibold text-gray-900">₵{incomeStatement.costOfGoodsSold.openingStock.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700">Purchases</span>
                    <span className="font-semibold text-gray-900">₵{incomeStatement.costOfGoodsSold.purchases.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700">Less: Closing Stock</span>
                    <span className="font-semibold text-red-600">(₵{incomeStatement.costOfGoodsSold.closingStock.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
                  </div>
                  <div className="flex justify-between items-center py-4 px-4 bg-orange-100 rounded-lg border-2 border-orange-300">
                    <span className="font-bold text-lg text-gray-900">Cost of Goods Sold</span>
                    <span className="font-bold text-2xl text-orange-700">₵{incomeStatement.costOfGoodsSold.costOfGoodsSold.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Gross Profit */}
              <div className="flex justify-between items-center py-5 px-6 bg-gradient-to-r from-green-100 to-green-50 rounded-lg border-2 border-green-400 shadow-md">
                <div className="flex items-center">
                  <HIcon icon={ArrowMoveUpRightIcon} size={24} className="text-green-700 mr-3"  />
                  <span className="font-bold text-xl text-gray-900">Gross Profit</span>
                </div>
                <span className="font-bold text-3xl text-green-700">₵{incomeStatement.grossProfit.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              {/* Operating Expenses */}
              <div className="bg-gradient-to-r from-red-50 to-transparent p-6 rounded-lg border-l-4 border-red-600">
                <div className="flex items-center mb-4">
                  <HIcon icon={ArrowMoveDownRightIcon} size={20} className="text-red-600 mr-2"  />
                  <h3 className="text-xl font-bold text-gray-900">Operating Expenses</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <HIcon icon={UserGroupIcon} size={16} className="text-gray-400 mr-2"  />
                      <span className="text-gray-700">Salaries</span>
                    </div>
                    <span className="font-semibold text-gray-900">₵{incomeStatement.operatingExpenses.salaries.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <HIcon icon={Building01Icon} size={16} className="text-gray-400 mr-2"  />
                      <span className="text-gray-700">Rent</span>
                    </div>
                    <span className="font-semibold text-gray-900">₵{incomeStatement.operatingExpenses.rent.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <HIcon icon={FlashIcon} size={16} className="text-gray-400 mr-2"  />
                      <span className="text-gray-700">Utilities</span>
                    </div>
                    <span className="font-semibold text-gray-900">₵{incomeStatement.operatingExpenses.utilities.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700">Other Expenses</span>
                    <span className="font-semibold text-gray-900">₵{incomeStatement.operatingExpenses.otherExpenses.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 px-4 bg-red-100 rounded-lg border-2 border-red-300">
                    <span className="font-bold text-lg text-gray-900">Total Operating Expenses</span>
                    <span className="font-bold text-2xl text-red-700">₵{incomeStatement.operatingExpenses.totalOperatingExpenses.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Operating Profit */}
              <div className="flex justify-between items-center py-4 px-6 bg-gray-100 rounded-lg border-2 border-gray-300">
                <span className="font-bold text-lg text-gray-900">Operating Profit</span>
                <span className="font-bold text-2xl text-gray-900">₵{incomeStatement.operatingProfit.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              {/* Taxes */}
              <div className="bg-gradient-to-r from-yellow-50 to-transparent p-6 rounded-lg border-l-4 border-yellow-600">
                <div className="flex items-center mb-4">
                  <HIcon icon={CalculatorIcon} size={20} className="text-yellow-600 mr-2"  />
                  <h3 className="text-xl font-bold text-gray-900">Taxes & Levies</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700">Corporate Tax ({TAX_RATES.CorporateTax}%)</span>
                    <span className="font-semibold text-gray-900">₵{incomeStatement.taxes.corporateTax.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700">VAT Payable</span>
                    <span className="font-semibold text-gray-900">₵{incomeStatement.taxes.vatPayable.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700">NHIL ({TAX_RATES.NHIL}%)</span>
                    <span className="font-semibold text-gray-900">₵{incomeStatement.taxes.nhil.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700">GETFund ({TAX_RATES.GETFund}%)</span>
                    <span className="font-semibold text-gray-900">₵{incomeStatement.taxes.getfund.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Net Profit */}
              <div className="flex justify-between items-center py-6 px-8 bg-gradient-to-r from-emerald-200 to-emerald-100 rounded-lg border-4 border-emerald-400 shadow-lg">
                <div className="flex items-center">
                  <HIcon icon={CheckmarkCircle02Icon} size={28} className="text-emerald-700 mr-3"  />
                  <span className="font-bold text-2xl text-gray-900">Net Profit After Tax</span>
                </div>
                <span className="font-bold text-4xl text-emerald-700">₵{incomeStatement.netProfit.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Balance Sheet */}
      {reportType === 'balance' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-l-4 border-primary-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Assets</p>
                  <p className="text-2xl font-bold text-gray-900">₵{balanceSheet.assets.totalAssets.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <div className="flex items-center mt-2">
                    <HIcon icon={Wallet02Icon} size={14} className="text-primary-600 mr-1"  />
                    <span className="text-xs text-gray-600">All assets</span>
                  </div>
                </div>
                <div className="bg-primary-600 p-3 rounded-lg">
                  <HIcon icon={ArrowMoveUpRightIcon} size={24} className="text-white"  />
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Liabilities</p>
                  <p className="text-2xl font-bold text-gray-900">₵{balanceSheet.liabilities.totalLiabilities.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <div className="flex items-center mt-2">
                    <HIcon icon={CreditCardIcon} size={14} className="text-red-600 mr-1"  />
                    <span className="text-xs text-gray-600">All debts</span>
                  </div>
                </div>
                <div className="bg-red-600 p-3 rounded-lg">
                  <HIcon icon={ArrowMoveDownRightIcon} size={24} className="text-white"  />
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Equity</p>
                  <p className="text-2xl font-bold text-gray-900">₵{balanceSheet.equity.totalEquity.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <div className="flex items-center mt-2">
                    <HIcon icon={LandmarkIcon} size={14} className="text-green-600 mr-1"  />
                    <span className="text-xs text-gray-600">Owner's equity</span>
                  </div>
                </div>
                <div className="bg-green-600 p-3 rounded-lg">
                  <HIcon icon={DollarCircleIcon} size={24} className="text-white"  />
                </div>
              </div>
            </div>

            <div className={`card border-l-4 ${
              Math.abs(balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.totalEquity - balanceSheet.assets.totalAssets) < 0.01
                ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-600'
                : 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-600'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Balance Status</p>
                  <p className={`text-2xl font-bold ${
                    Math.abs(balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.totalEquity - balanceSheet.assets.totalAssets) < 0.01
                      ? 'text-emerald-700'
                      : 'text-yellow-700'
                  }`}>
                    {Math.abs(balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.totalEquity - balanceSheet.assets.totalAssets) < 0.01 ? 'Balanced' : 'Unbalanced'}
                  </p>
                  <div className="flex items-center mt-2">
                    {Math.abs(balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.totalEquity - balanceSheet.assets.totalAssets) < 0.01 ? (
                      <HIcon icon={CheckmarkCircle02Icon} size={14} className="text-emerald-600 mr-1"  />
                    ) : (
                      <HIcon icon={AlertCircleIcon} size={14} className="text-yellow-600 mr-1"  />
                    )}
                    <span className="text-xs text-gray-600">Assets = Liab + Equity</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${
                  Math.abs(balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.totalEquity - balanceSheet.assets.totalAssets) < 0.01
                    ? 'bg-emerald-600'
                    : 'bg-yellow-600'
                }`}>
                  {Math.abs(balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.totalEquity - balanceSheet.assets.totalAssets) < 0.01 ? (
                    <HIcon icon={LandmarkIcon} size={24} className="text-white"  />
                  ) : (
                    <HIcon icon={AlertCircleIcon} size={24} className="text-white"  />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Balance Sheet */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assets Column */}
            <div className="card">
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <HIcon icon={Wallet02Icon} size={24} className="mr-3 text-primary-600"  />
                    Assets
                  </h2>
                  <p className="text-sm text-gray-600 mt-2 flex items-center">
                    <HIcon icon={Calendar01Icon} size={16} className="mr-2"  />
                    As at: {getDateRange().end.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Current Assets */}
                <div className="bg-gradient-to-r from-primary-50 to-transparent p-5 rounded-lg border-l-4 border-primary-600">
                  <div className="flex items-center mb-4">
                    <HIcon icon={ArrowMoveUpRightIcon} size={18} className="text-primary-600 mr-2"  />
                    <h3 className="text-lg font-bold text-gray-900">Current Assets</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2.5 px-4 bg-white rounded-lg shadow-sm">
                      <div className="flex items-center">
                        <HIcon icon={DollarCircleIcon} size={16} className="text-gray-400 mr-2"  />
                        <span className="text-gray-700">Cash</span>
                      </div>
                      <span className="font-semibold text-gray-900">₵{balanceSheet.assets.currentAssets.cash.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 px-4 bg-white rounded-lg shadow-sm">
                      <div className="flex items-center">
                        <HIcon icon={ReceiptTextIcon} size={16} className="text-gray-400 mr-2"  />
                        <span className="text-gray-700">Accounts Receivable</span>
                      </div>
                      <span className="font-semibold text-gray-900">₵{balanceSheet.assets.currentAssets.accountsReceivable.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 px-4 bg-white rounded-lg shadow-sm">
                      <div className="flex items-center">
                        <HIcon icon={Package01Icon} size={16} className="text-gray-400 mr-2"  />
                        <span className="text-gray-700">Inventory</span>
                      </div>
                      <span className="font-semibold text-gray-900">₵{balanceSheet.assets.currentAssets.inventory.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 px-4 bg-white rounded-lg shadow-sm">
                      <div className="flex items-center">
                        <HIcon icon={Calendar01Icon} size={16} className="text-gray-400 mr-2"  />
                        <span className="text-gray-700">Prepaid Expenses</span>
                      </div>
                      <span className="font-semibold text-gray-900">₵{balanceSheet.assets.currentAssets.prepaidExpenses.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 px-4 bg-primary-100 rounded-lg border-2 border-primary-300 mt-3">
                      <span className="font-bold text-gray-900">Total Current Assets</span>
                      <span className="font-bold text-xl text-primary-700">₵{balanceSheet.assets.currentAssets.totalCurrentAssets.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {/* Fixed Assets */}
                <div className="bg-gradient-to-r from-primary-50 to-transparent p-5 rounded-lg border-l-4 border-primary-600">
                  <div className="flex items-center mb-4">
                    <HIcon icon={Building01Icon} size={18} className="text-primary-600 mr-2"  />
                    <h3 className="text-lg font-bold text-gray-900">Fixed Assets</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2.5 px-4 bg-white rounded-lg shadow-sm">
                      <div className="flex items-center">
                        <HIcon icon={FlashIcon} size={16} className="text-gray-400 mr-2"  />
                        <span className="text-gray-700">Equipment</span>
                      </div>
                      <span className="font-semibold text-gray-900">₵{balanceSheet.assets.fixedAssets.equipment.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 px-4 bg-white rounded-lg shadow-sm">
                      <div className="flex items-center">
                        <HIcon icon={Building01Icon} size={16} className="text-gray-400 mr-2"  />
                        <span className="text-gray-700">Furniture</span>
                      </div>
                      <span className="font-semibold text-gray-900">₵{balanceSheet.assets.fixedAssets.furniture.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 px-4 bg-white rounded-lg shadow-sm">
                      <div className="flex items-center">
                        <HIcon icon={ArrowMoveDownRightIcon} size={16} className="text-red-400 mr-2"  />
                        <span className="text-gray-700">Less: Accumulated Depreciation</span>
                      </div>
                      <span className="font-semibold text-red-600">(₵{Math.abs(balanceSheet.assets.fixedAssets.accumulatedDepreciation).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
                    </div>
                    <div className="flex justify-between items-center py-3 px-4 bg-primary-100 rounded-lg border-2 border-primary-300 mt-3">
                      <span className="font-bold text-gray-900">Total Fixed Assets</span>
                      <span className="font-bold text-xl text-primary-700">₵{balanceSheet.assets.fixedAssets.totalFixedAssets.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {/* Total Assets */}
                <div className="flex justify-between items-center py-5 px-6 bg-gradient-to-r from-primary-200 to-primary-100 rounded-lg border-4 border-primary-400 shadow-lg">
                  <div className="flex items-center">
                    <HIcon icon={Wallet02Icon} size={28} className="text-primary-700 mr-3"  />
                    <span className="font-bold text-2xl text-gray-900">Total Assets</span>
                  </div>
                  <span className="font-bold text-3xl text-primary-700">₵{balanceSheet.assets.totalAssets.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Liabilities & Equity Column */}
            <div className="space-y-6">
              {/* Liabilities Card */}
              <div className="card">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <HIcon icon={CreditCardIcon} size={24} className="mr-3 text-red-600"  />
                      Liabilities
                    </h2>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Current Liabilities */}
                  <div className="bg-gradient-to-r from-red-50 to-transparent p-5 rounded-lg border-l-4 border-red-600">
                    <div className="flex items-center mb-4">
                      <HIcon icon={ArrowMoveDownRightIcon} size={18} className="text-red-600 mr-2"  />
                      <h3 className="text-lg font-bold text-gray-900">Current Liabilities</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2.5 px-4 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center">
                          <HIcon icon={ReceiptTextIcon} size={16} className="text-gray-400 mr-2"  />
                          <span className="text-gray-700">Accounts Payable</span>
                        </div>
                        <span className="font-semibold text-gray-900">₵{balanceSheet.liabilities.currentLiabilities.accountsPayable.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center py-2.5 px-4 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center">
                          <HIcon icon={CalculatorIcon} size={16} className="text-gray-400 mr-2"  />
                          <span className="text-gray-700">VAT Payable</span>
                        </div>
                        <span className="font-semibold text-gray-900">₵{balanceSheet.liabilities.currentLiabilities.vatPayable.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center py-2.5 px-4 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center">
                          <HIcon icon={CalculatorIcon} size={16} className="text-gray-400 mr-2"  />
                          <span className="text-gray-700">NHIL Payable</span>
                        </div>
                        <span className="font-semibold text-gray-900">₵{balanceSheet.liabilities.currentLiabilities.nhilPayable.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center py-2.5 px-4 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center">
                          <HIcon icon={CalculatorIcon} size={16} className="text-gray-400 mr-2"  />
                          <span className="text-gray-700">GETFund Payable</span>
                        </div>
                        <span className="font-semibold text-gray-900">₵{balanceSheet.liabilities.currentLiabilities.getfundPayable.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center py-2.5 px-4 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center">
                          <HIcon icon={CreditCardIcon} size={16} className="text-gray-400 mr-2"  />
                          <span className="text-gray-700">Short-term Debt</span>
                        </div>
                        <span className="font-semibold text-gray-900">₵{balanceSheet.liabilities.currentLiabilities.shortTermDebt.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 px-4 bg-red-100 rounded-lg border-2 border-red-300 mt-3">
                        <span className="font-bold text-gray-900">Total Current Liabilities</span>
                        <span className="font-bold text-xl text-red-700">₵{balanceSheet.liabilities.currentLiabilities.totalCurrentLiabilities.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Long-term Liabilities */}
                  <div className="bg-gradient-to-r from-orange-50 to-transparent p-5 rounded-lg border-l-4 border-orange-600">
                    <div className="flex items-center mb-4">
                      <HIcon icon={LandmarkIcon} size={18} className="text-orange-600 mr-2"  />
                      <h3 className="text-lg font-bold text-gray-900">Long-term Liabilities</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2.5 px-4 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center">
                          <HIcon icon={CreditCardIcon} size={16} className="text-gray-400 mr-2"  />
                          <span className="text-gray-700">Long-term Debt</span>
                        </div>
                        <span className="font-semibold text-gray-900">₵{balanceSheet.liabilities.longTermLiabilities.longTermDebt.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 px-4 bg-orange-100 rounded-lg border-2 border-orange-300 mt-3">
                        <span className="font-bold text-gray-900">Total Long-term Liabilities</span>
                        <span className="font-bold text-xl text-orange-700">₵{balanceSheet.liabilities.longTermLiabilities.totalLongTermLiabilities.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Total Liabilities */}
                  <div className="flex justify-between items-center py-4 px-6 bg-gradient-to-r from-red-200 to-red-100 rounded-lg border-4 border-red-400 shadow-lg">
                    <div className="flex items-center">
                      <HIcon icon={CreditCardIcon} size={24} className="text-red-700 mr-3"  />
                      <span className="font-bold text-xl text-gray-900">Total Liabilities</span>
                    </div>
                    <span className="font-bold text-2xl text-red-700">₵{balanceSheet.liabilities.totalLiabilities.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Equity Card */}
              <div className="card">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <HIcon icon={LandmarkIcon} size={24} className="mr-3 text-green-600"  />
                      Equity
                    </h2>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-transparent p-5 rounded-lg border-l-4 border-green-600">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center">
                          <HIcon icon={DollarCircleIcon} size={16} className="text-gray-400 mr-2"  />
                          <span className="text-gray-700 font-medium">Capital</span>
                        </div>
                        <span className="font-semibold text-gray-900">₵{balanceSheet.equity.capital.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center">
                          <HIcon icon={ArrowMoveUpRightIcon} size={16} className="text-gray-400 mr-2"  />
                          <span className="text-gray-700 font-medium">Retained Earnings</span>
                        </div>
                        <span className="font-semibold text-gray-900">₵{balanceSheet.equity.retainedEarnings.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center py-4 px-4 bg-green-100 rounded-lg border-2 border-green-300 mt-3">
                        <span className="font-bold text-lg text-gray-900">Total Equity</span>
                        <span className="font-bold text-2xl text-green-700">₵{balanceSheet.equity.totalEquity.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Balance Check */}
              <div className={`card border-4 ${
                Math.abs(balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.totalEquity - balanceSheet.assets.totalAssets) < 0.01
                  ? 'bg-gradient-to-r from-emerald-100 to-emerald-50 border-emerald-400'
                  : 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-400'
              }`}>
                <div className="flex justify-between items-center py-5">
                  <div className="flex items-center">
                    {Math.abs(balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.totalEquity - balanceSheet.assets.totalAssets) < 0.01 ? (
                      <HIcon icon={CheckmarkCircle02Icon} size={28} className="text-emerald-700 mr-3"  />
                    ) : (
                      <HIcon icon={AlertCircleIcon} size={28} className="text-yellow-700 mr-3"  />
                    )}
                    <span className="font-bold text-xl text-gray-900">Total Liabilities + Equity</span>
                  </div>
                  <span className={`font-bold text-3xl ${
                    Math.abs(balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.totalEquity - balanceSheet.assets.totalAssets) < 0.01
                      ? 'text-emerald-700'
                      : 'text-yellow-700'
                  }`}>
                    ₵{(balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.totalEquity).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                {Math.abs(balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.totalEquity - balanceSheet.assets.totalAssets) < 0.01 ? (
                  <div className="flex items-center justify-center pt-2 pb-1">
                    <HIcon icon={LandmarkIcon} size={20} className="text-emerald-700 mr-2"  />
                    <span className="text-sm font-semibold text-emerald-700">Balance Sheet is Balanced ✓</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center pt-2 pb-1">
                    <HIcon icon={AlertCircleIcon} size={20} className="text-yellow-700 mr-2"  />
                    <span className="text-sm font-semibold text-yellow-700">
                      Difference: ₵{Math.abs(balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.totalEquity - balanceSheet.assets.totalAssets).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tax Reports */}
      {reportType === 'tax' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-l-4 border-primary-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">VAT Output</p>
                  <p className="text-2xl font-bold text-gray-900">₵{financials.totalVAT.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <div className="flex items-center mt-2">
                    <HIcon icon={ArrowMoveUpRightIcon} size={14} className="text-primary-600 mr-1"  />
                    <span className="text-xs text-gray-600">From sales</span>
                  </div>
                </div>
                <div className="bg-primary-600 p-3 rounded-lg">
                  <HIcon icon={ReceiptTextIcon} size={24} className="text-white"  />
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-cyan-50 to-cyan-100 border-l-4 border-cyan-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">VAT Input</p>
                  <p className="text-2xl font-bold text-cyan-700">
                    ₵{filteredTransactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.vat, 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center mt-2">
                    <HIcon icon={ArrowMoveDownRightIcon} size={14} className="text-cyan-600 mr-1"  />
                    <span className="text-xs text-gray-600">From purchases</span>
                  </div>
                </div>
                <div className="bg-cyan-600 p-3 rounded-lg">
                  <HIcon icon={Package01Icon} size={24} className="text-white"  />
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">VAT Payable</p>
                  <p className="text-2xl font-bold text-orange-700">₵{financials.taxPayable.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <div className="flex items-center mt-2">
                    <HIcon icon={CalculatorIcon} size={14} className="text-orange-600 mr-1"  />
                    <span className="text-xs text-gray-600">Output - Input</span>
                  </div>
                </div>
                <div className="bg-orange-600 p-3 rounded-lg">
                  <HIcon icon={CalculatorIcon} size={24} className="text-white"  />
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Tax Liability</p>
                  <p className="text-2xl font-bold text-red-700">₵{financials.totalTax.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <div className="flex items-center mt-2">
                    <HIcon icon={Shield01Icon} size={14} className="text-red-600 mr-1"  />
                    <span className="text-xs text-gray-600">All taxes combined</span>
                  </div>
                </div>
                <div className="bg-red-600 p-3 rounded-lg">
                  <HIcon icon={Shield01Icon} size={24} className="text-white"  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Tax Breakdown */}
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                  <HIcon icon={CalculatorIcon} size={28} className="mr-3 text-primary-600"  />
                  Ghanaian Tax Breakdown
                </h2>
                <p className="text-sm text-gray-600 mt-2 flex items-center">
                  <HIcon icon={Calendar01Icon} size={16} className="mr-2"  />
                  For the period: {getDateRange().start.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} to {getDateRange().end.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => handleExportCSV('tax')}
                className="btn-primary flex items-center"
              >
                <HIcon icon={Download01Icon} size={18} className="mr-2"  />
                Export Tax Report
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* VAT Section */}
              <div className="bg-gradient-to-r from-primary-50 to-transparent p-6 rounded-lg border-l-4 border-primary-600 shadow-md">
                <div className="flex items-center mb-4">
                  <HIcon icon={ReceiptTextIcon} size={20} className="text-primary-600 mr-2"  />
                  <h3 className="text-xl font-bold text-gray-900">Value Added Tax (VAT)</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700 font-medium">VAT Rate:</span>
                    <span className="font-bold text-lg text-primary-600">{TAX_RATES.VAT}%</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700">VAT Output (Sales):</span>
                    <span className="font-semibold text-gray-900">₵{financials.totalVAT.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700">VAT Input (Purchases):</span>
                    <span className="font-semibold text-gray-900">
                      ₵{filteredTransactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.vat, 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-4 px-4 bg-primary-100 rounded-lg border-2 border-primary-300 mt-3">
                    <span className="font-bold text-lg text-gray-900">VAT Payable to GRA:</span>
                    <span className="font-bold text-2xl text-orange-600">₵{financials.taxPayable.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* NHIL Section */}
              <div className="bg-gradient-to-r from-green-50 to-transparent p-6 rounded-lg border-l-4 border-green-600 shadow-md">
                <div className="flex items-center mb-4">
                  <HIcon icon={Shield01Icon} size={20} className="text-green-600 mr-2"  />
                  <h3 className="text-xl font-bold text-gray-900">National Health Insurance Levy (NHIL)</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700 font-medium">NHIL Rate:</span>
                    <span className="font-bold text-lg text-green-600">{TAX_RATES.NHIL}%</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700">Total NHIL Collected:</span>
                    <span className="font-semibold text-gray-900">₵{financials.totalNHIL.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 px-4 bg-green-100 rounded-lg border-2 border-green-300 mt-3">
                    <span className="font-bold text-lg text-gray-900">NHIL Payable to GRA:</span>
                    <span className="font-bold text-2xl text-orange-600">₵{financials.totalNHIL.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* GETFund Section */}
              <div className="bg-gradient-to-r from-primary-50 to-transparent p-6 rounded-lg border-l-4 border-primary-600 shadow-md">
                <div className="flex items-center mb-4">
                  <HIcon icon={FileValidationIcon} size={20} className="text-primary-600 mr-2"  />
                  <h3 className="text-xl font-bold text-gray-900">GETFund Levy</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700 font-medium">GETFund Rate:</span>
                    <span className="font-bold text-lg text-primary-600">{TAX_RATES.GETFund}%</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700">Total GETFund Collected:</span>
                    <span className="font-semibold text-gray-900">₵{financials.totalGETFund.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 px-4 bg-primary-100 rounded-lg border-2 border-primary-300 mt-3">
                    <span className="font-bold text-lg text-gray-900">GETFund Payable to GRA:</span>
                    <span className="font-bold text-2xl text-orange-600">₵{financials.totalGETFund.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Corporate Tax Section */}
              <div className="bg-gradient-to-r from-yellow-50 to-transparent p-6 rounded-lg border-l-4 border-yellow-600 shadow-md">
                <div className="flex items-center mb-4">
                  <HIcon icon={CalculatorIcon} size={20} className="text-yellow-600 mr-2"  />
                  <h3 className="text-xl font-bold text-gray-900">Corporate Income Tax</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700 font-medium">Tax Rate:</span>
                    <span className="font-bold text-lg text-yellow-600">{TAX_RATES.CorporateTax}%</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700">Taxable Income:</span>
                    <span className="font-semibold text-gray-900">₵{financials.netProfit.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 px-4 bg-yellow-100 rounded-lg border-2 border-yellow-300 mt-3">
                    <span className="font-bold text-lg text-gray-900">Corporate Tax Payable:</span>
                    <span className="font-bold text-2xl text-orange-600">
                      ₵{((financials.netProfit * TAX_RATES.CorporateTax) / 100).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Tax Summary */}
            <div className="mt-6 flex justify-between items-center py-5 px-6 bg-gradient-to-r from-red-200 to-red-100 rounded-lg border-4 border-red-400 shadow-lg">
              <div className="flex items-center">
                <HIcon icon={Shield01Icon} size={28} className="text-red-700 mr-3"  />
                <span className="font-bold text-2xl text-gray-900">Total Tax Liability to GRA</span>
              </div>
              <span className="font-bold text-4xl text-red-700">₵{financials.totalTax.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Tax Transaction Details */}
          <div className="card">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <HIcon icon={FileValidationIcon} size={24} className="mr-3 text-primary-600"  />
                  Tax Transaction Details
                </h2>
                <p className="text-sm text-gray-600 mt-2">Detailed breakdown of all transactions with tax components</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Receipt #</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Description</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">VAT</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">NHIL</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">GETFund</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-700">{new Date(transaction.date).toLocaleDateString('en-GB')}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">{transaction.receiptNumber}</td>
                      <td className="py-3 px-4 text-gray-700">{transaction.description}</td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">₵{transaction.netAmount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 text-right text-primary-600 font-medium">₵{transaction.vat.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 text-right text-green-600 font-medium">₵{transaction.nhil.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 text-right text-primary-600 font-medium">₵{transaction.getfund.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr className="border-t-2">
                    <td colSpan="3" className="py-4 px-4 font-bold text-gray-900">Total</td>
                    <td className="py-4 px-4 text-right font-bold text-gray-900">
                      ₵{filteredTransactions.reduce((sum, t) => sum + t.netAmount, 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-primary-600">
                      ₵{filteredTransactions.reduce((sum, t) => sum + t.vat, 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-green-600">
                      ₵{filteredTransactions.reduce((sum, t) => sum + t.nhil, 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-primary-600">
                      ₵{filteredTransactions.reduce((sum, t) => sum + t.getfund, 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Audit Trail */}
      {reportType === 'audit' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-l-4 border-primary-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
                  <div className="flex items-center mt-2">
                    <HIcon icon={Activity01Icon} size={14} className="text-primary-600 mr-1"  />
                    <span className="text-xs text-gray-600">All transactions</span>
                  </div>
                </div>
                <div className="bg-primary-600 p-3 rounded-lg">
                  <HIcon icon={DatabaseIcon} size={24} className="text-white"  />
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-l-4 border-primary-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Audit Period</p>
                  <p className="text-lg font-bold text-gray-900">
                    {getDateRange().start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {getDateRange().end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <div className="flex items-center mt-2">
                    <HIcon icon={Calendar01Icon} size={14} className="text-primary-600 mr-1"  />
                    <span className="text-xs text-gray-600">Date range</span>
                  </div>
                </div>
                <div className="bg-primary-600 p-3 rounded-lg">
                  <HIcon icon={Clock01Icon} size={24} className="text-white"  />
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-emerald-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Data Integrity</p>
                  <p className="text-2xl font-bold text-emerald-700 flex items-center">
                    100%
                  </p>
                  <div className="flex items-center mt-2">
                    <HIcon icon={CheckmarkCircle02Icon} size={14} className="text-emerald-600 mr-1"  />
                    <span className="text-xs text-gray-600">Verified</span>
                  </div>
                </div>
                <div className="bg-emerald-600 p-3 rounded-lg">
                  <HIcon icon={Shield01Icon} size={24} className="text-white"  />
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-l-4 border-primary-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Verified Users</p>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                  <div className="flex items-center mt-2">
                    <HIcon icon={UserCheck01Icon} size={14} className="text-primary-600 mr-1"  />
                    <span className="text-xs text-gray-600">Active users</span>
                  </div>
                </div>
                <div className="bg-primary-600 p-3 rounded-lg">
                  <HIcon icon={UserCheck01Icon} size={24} className="text-white"  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Audit Trail */}
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                  <HIcon icon={Shield01Icon} size={28} className="mr-3 text-primary-600"  />
                  Complete Audit Trail
                </h2>
                <p className="text-sm text-gray-600 mt-2 flex items-center">
                  <HIcon icon={Calendar01Icon} size={16} className="mr-2"  />
                  For the period: {getDateRange().start.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} to {getDateRange().end.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => handleExportCSV('transactions')}
                className="btn-primary flex items-center"
              >
                <HIcon icon={Download01Icon} size={18} className="mr-2"  />
                Export Audit Log
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Date & Time</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Transaction ID</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Description</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">User</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Account</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-700">
                        <div className="flex items-center">
                          <HIcon icon={Clock01Icon} size={14} className="text-gray-400 mr-2"  />
                          {new Date(transaction.date).toLocaleString('en-GB', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm text-gray-900 bg-gray-50 rounded">{transaction.receiptNumber}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center w-fit ${
                          transaction.type === 'sale' ? 'bg-green-100 text-green-800' :
                          transaction.type === 'expense' ? 'bg-red-100 text-red-800' :
                          'bg-primary-100 text-primary-800'
                        }`}>
                          {transaction.type === 'sale' && <HIcon icon={ArrowMoveUpRightIcon} size={12} className="mr-1"  />}
                          {transaction.type === 'expense' && <HIcon icon={ArrowMoveDownRightIcon} size={12} className="mr-1"  />}
                          {transaction.type === 'purchase' && <HIcon icon={Package01Icon} size={12} className="mr-1"  />}
                          {transaction.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{transaction.description}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <HIcon icon={UserCheck01Icon} size={14} className="text-gray-400 mr-2"  />
                          <span className="text-gray-700">System User</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-semibold ${
                          transaction.type === 'sale' ? 'text-green-600' : 
                          transaction.type === 'expense' ? 'text-red-600' : 
                          'text-primary-600'
                        }`}>
                          ₵{(transaction.debit + transaction.credit).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{transaction.account}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center justify-center w-fit mx-auto">
                          <HIcon icon={CheckmarkCircle02Icon} size={12} className="mr-1"  />
                          Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transaction Types */}
            <div className="card">
              <div className="flex items-center mb-6 pb-4 border-b">
                <HIcon icon={Activity01Icon} size={20} className="text-primary-600 mr-2"  />
                <h2 className="text-2xl font-bold text-gray-900">Transaction Types</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 px-4 bg-green-50 rounded-lg border-l-4 border-green-600">
                  <div className="flex items-center">
                    <HIcon icon={ArrowMoveUpRightIcon} size={18} className="text-green-600 mr-2"  />
                    <span className="text-gray-700 font-medium">Sales Transactions</span>
                  </div>
                  <span className="font-bold text-lg text-green-700">{filteredTransactions.filter(t => t.type === 'sale').length}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-primary-50 rounded-lg border-l-4 border-primary-600">
                  <div className="flex items-center">
                    <HIcon icon={Package01Icon} size={18} className="text-primary-600 mr-2"  />
                    <span className="text-gray-700 font-medium">Purchase Transactions</span>
                  </div>
                  <span className="font-bold text-lg text-primary-700">{filteredTransactions.filter(t => t.type === 'purchase').length}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-red-50 rounded-lg border-l-4 border-red-600">
                  <div className="flex items-center">
                    <HIcon icon={ArrowMoveDownRightIcon} size={18} className="text-red-600 mr-2"  />
                    <span className="text-gray-700 font-medium">Expense Transactions</span>
                  </div>
                  <span className="font-bold text-lg text-red-700">{filteredTransactions.filter(t => t.type === 'expense').length}</span>
                </div>
              </div>
            </div>

            {/* Financial Totals */}
            <div className="card">
              <div className="flex items-center mb-6 pb-4 border-b">
                <HIcon icon={DollarCircleIcon} size={20} className="text-primary-600 mr-2"  />
                <h2 className="text-2xl font-bold text-gray-900">Financial Totals</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 px-4 bg-red-50 rounded-lg border-l-4 border-red-600">
                  <div className="flex items-center">
                    <HIcon icon={ArrowMoveDownRightIcon} size={18} className="text-red-600 mr-2"  />
                    <span className="text-gray-700 font-medium">Total Debits</span>
                  </div>
                  <span className="font-bold text-lg text-red-700">
                    ₵{filteredTransactions.reduce((sum, t) => sum + t.debit, 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-green-50 rounded-lg border-l-4 border-green-600">
                  <div className="flex items-center">
                    <HIcon icon={ArrowMoveUpRightIcon} size={18} className="text-green-600 mr-2"  />
                    <span className="text-gray-700 font-medium">Total Credits</span>
                  </div>
                  <span className="font-bold text-lg text-green-700">
                    ₵{filteredTransactions.reduce((sum, t) => sum + t.credit, 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className={`flex justify-between items-center py-4 px-4 rounded-lg border-l-4 ${
                  Math.abs(filteredTransactions.reduce((sum, t) => sum + t.debit, 0) - 
                           filteredTransactions.reduce((sum, t) => sum + t.credit, 0)) < 0.01
                    ? 'bg-emerald-50 border-emerald-600'
                    : 'bg-yellow-50 border-yellow-600'
                }`}>
                  <div className="flex items-center">
                    <Scale size={18} className={`mr-2 ${
                      Math.abs(filteredTransactions.reduce((sum, t) => sum + t.debit, 0) - 
                               filteredTransactions.reduce((sum, t) => sum + t.credit, 0)) < 0.01
                        ? 'text-emerald-600'
                        : 'text-yellow-600'
                    }`} />
                    <span className="font-bold text-gray-900">Balance</span>
                  </div>
                  <span className={`font-bold text-xl ${
                    Math.abs(filteredTransactions.reduce((sum, t) => sum + t.debit, 0) - 
                             filteredTransactions.reduce((sum, t) => sum + t.credit, 0)) < 0.01
                      ? 'text-emerald-700'
                      : 'text-yellow-700'
                  }`}>
                    ₵{Math.abs(filteredTransactions.reduce((sum, t) => sum + t.debit, 0) - 
                              filteredTransactions.reduce((sum, t) => sum + t.credit, 0)).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
    </div>
  )
}

export default Accounting

