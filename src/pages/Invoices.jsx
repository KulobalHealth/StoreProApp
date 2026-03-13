import React, { useState } from 'react'
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Send,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Printer,
  Copy,
  CreditCard,
  Wallet,
  X,
  DollarSign,
  Receipt
} from 'lucide-react'
import CreateInvoice from '../components/CreateInvoice'
import InvoiceReceipt from '../components/InvoiceReceipt'

const Invoices = () => {
  const [invoices, setInvoices] = useState([
    {
      id: 'INV-001',
      invoiceNumber: 'INV-001',
      customer: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+233 24 111 2222',
        address: '123 Main Street, Accra'
      },
      date: '2024-01-15',
      dueDate: '2024-02-15',
      status: 'sent',
      items: [
        { description: 'Product A', quantity: 2, price: 150.00, total: 300.00 },
        { description: 'Product B', quantity: 1, price: 200.00, total: 200.00 }
      ],
      subtotal: 500.00,
      tax: 60.00,
      discount: 0,
      total: 560.00,
      paid: 0,
      balance: 560.00,
      notes: 'Payment due within 30 days'
    },
    {
      id: 'INV-002',
      invoiceNumber: 'INV-002',
      customer: {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+233 24 222 3333',
        address: '456 Market Street, Kumasi'
      },
      date: '2024-01-10',
      dueDate: '2024-02-10',
      status: 'overdue',
      items: [
        { description: 'Service Package', quantity: 1, price: 1200.00, total: 1200.00 }
      ],
      subtotal: 1200.00,
      tax: 144.00,
      discount: 50.00,
      total: 1294.00,
      paid: 0,
      balance: 1294.00,
      notes: 'Overdue invoice'
    },
    {
      id: 'INV-003',
      invoiceNumber: 'INV-003',
      customer: {
        name: 'Michael Brown',
        email: 'michael.brown@example.com',
        phone: '+233 24 333 4444',
        address: '789 Business District, Accra'
      },
      date: '2024-01-20',
      dueDate: '2024-02-20',
      status: 'paid',
      items: [
        { description: 'Item X', quantity: 5, price: 80.00, total: 400.00 },
        { description: 'Item Y', quantity: 3, price: 120.00, total: 360.00 }
      ],
      subtotal: 760.00,
      tax: 91.20,
      discount: 0,
      total: 851.20,
      paid: 851.20,
      balance: 0,
      notes: 'Fully paid'
    },
    {
      id: 'INV-004',
      invoiceNumber: 'INV-004',
      customer: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+233 24 444 5555',
        address: '321 Commerce Road, Tema'
      },
      date: '2024-01-25',
      dueDate: '2024-02-25',
      status: 'draft',
      items: [
        { description: 'Consultation', quantity: 2, price: 250.00, total: 500.00 }
      ],
      subtotal: 500.00,
      tax: 60.00,
      discount: 0,
      total: 560.00,
      paid: 0,
      balance: 560.00,
      notes: 'Draft invoice'
    },
    {
      id: 'INV-005',
      invoiceNumber: 'INV-005',
      customer: {
        name: 'David Wilson',
        email: 'david.wilson@example.com',
        phone: '+233 24 555 6666',
        address: '654 Trade Center, Accra'
      },
      date: '2024-01-12',
      dueDate: '2024-02-12',
      status: 'partial',
      items: [
        { description: 'Product C', quantity: 4, price: 175.00, total: 700.00 }
      ],
      subtotal: 700.00,
      tax: 84.00,
      discount: 35.00,
      total: 749.00,
      paid: 400.00,
      balance: 349.00,
      notes: 'Partial payment received'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [editingInvoice, setEditingInvoice] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [receiptInvoice, setReceiptInvoice] = useState(null)

  const filteredInvoices = invoices.filter(invoice => {
    if (!invoice || !invoice.customer) return false
    
    const matchesSearch = 
      (invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (invoice.customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (invoice.customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex)

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-700 border-green-200'
      case 'sent': return 'bg-primary-100 text-primary-700 border-primary-200'
      case 'overdue': return 'bg-red-100 text-red-700 border-red-200'
      case 'partial': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'paid': return <CheckCircle size={14} />
      case 'sent': return <Send size={14} />
      case 'overdue': return <AlertCircle size={14} />
      case 'partial': return <Clock size={14} />
      case 'draft': return <FileText size={14} />
      default: return <FileText size={14} />
    }
  }

  const handleSaveInvoice = (invoiceData) => {
    const invoice = {
      id: editingInvoice ? editingInvoice.id : `INV-${String(invoices.length + 1).padStart(3, '0')}`,
      invoiceNumber: editingInvoice ? editingInvoice.invoiceNumber : `INV-${String(invoices.length + 1).padStart(3, '0')}`,
      ...invoiceData,
      paid: editingInvoice ? editingInvoice.paid : 0,
      balance: invoiceData.total - (editingInvoice ? editingInvoice.paid : 0)
    }

    if (editingInvoice) {
      setInvoices(invoices.map(inv => inv.id === editingInvoice.id ? invoice : inv))
      alert('Invoice updated successfully!')
    } else {
      setInvoices([...invoices, invoice])
      alert('Invoice created successfully!')
    }

    setEditingInvoice(null)
  }

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice)
    setShowAddModal(true)
  }

  const handleDeleteInvoice = (invoice) => {
    if (window.confirm(`Are you sure you want to delete invoice "${invoice.invoiceNumber}"?`)) {
      setInvoices(invoices.filter(inv => inv.id !== invoice.id))
      alert('Invoice deleted successfully!')
    }
  }

  const handleSendInvoice = (invoice) => {
    const email = invoice.customer?.email || 'customer'
    if (window.confirm(`Send invoice ${invoice.invoiceNumber || 'N/A'} to ${email}?`)) {
      setInvoices(invoices.map(inv => 
        inv.id === invoice.id 
          ? { ...inv, status: inv.status === 'draft' ? 'sent' : inv.status }
          : inv
      ))
      alert(`Invoice ${invoice.invoiceNumber || 'N/A'} sent to ${email}`)
    }
  }

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice)
    setShowDetailModal(true)
  }

  const handleRecordPayment = (invoice) => {
    const balance = invoice.balance || 0
    const amount = prompt(`Enter payment amount for invoice ${invoice.invoiceNumber || 'N/A'}:\nBalance: ₵${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
      const paymentAmount = parseFloat(amount)
      const currentPaid = invoice.paid || 0
      const currentTotal = invoice.total || 0
      const newPaid = currentPaid + paymentAmount
      const newBalance = currentTotal - newPaid
      const newStatus = newBalance <= 0 ? 'paid' : (newPaid > 0 ? 'partial' : (invoice.status || 'draft'))

      setInvoices(invoices.map(inv => 
        inv.id === invoice.id 
          ? { ...inv, paid: newPaid, balance: newBalance, status: newStatus }
          : inv
      ))
      alert(`Payment of ₵${paymentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} recorded successfully!`)
    }
  }


  const stats = {
    total: invoices.length,
    paid: invoices.filter(inv => inv?.status === 'paid').length,
    overdue: invoices.filter(inv => inv?.status === 'overdue').length,
    totalAmount: invoices.reduce((sum, inv) => sum + (inv?.total || 0), 0),
    outstanding: invoices.reduce((sum, inv) => sum + (inv?.balance || 0), 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-500 text-white">
                <FileText size={18} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">Invoices & Payments</h1>
                <p className="text-gray-500 text-xs">Add, organize, and send invoices</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingInvoice(null)
                setShowAddModal(true)
              }}
              className="btn-primary flex items-center"
            >
              <Plus size={18} className="mr-2" />
              Create Invoice
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5">

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <FileText size={20} className="text-primary-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Paid</p>
              <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertCircle size={20} className="text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-primary-600">₵{(stats.totalAmount / 1000).toFixed(0)}K</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <DollarSign size={20} className="text-primary-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Outstanding</p>
              <p className="text-2xl font-bold text-orange-600">₵{(stats.outstanding / 1000).toFixed(0)}K</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <CreditCard size={20} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center mb-4">
          <Search size={20} className="text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by invoice number, customer name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Filter size={18} className="text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field pl-10 w-full appearance-none"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText size={20} className="text-primary-600 mr-2" />
            Invoices List
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Invoice #</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Customer</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Date</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Due Date</th>
                <th className="text-right py-4 px-6 text-sm font-bold text-gray-700">Amount</th>
                <th className="text-right py-4 px-6 text-sm font-bold text-gray-700">Balance</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Status</th>
                <th className="text-center py-4 px-6 text-sm font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInvoices.length > 0 ? (
                paginatedInvoices.map((invoice, index) => (
                  <tr key={invoice.id || `invoice-${index}`} className="border-b hover:bg-primary-50 transition-colors group">
                    <td className="py-5 px-6">
                      <div className="flex items-center">
                        <FileText size={18} className="text-primary-600 mr-2" />
                        <span className="font-bold text-gray-900">{invoice.invoiceNumber || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div>
                        <p className="font-semibold text-gray-900">{invoice.customer?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{invoice.customer?.email || ''}</p>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <p className="text-sm text-gray-700">
                        {invoice.date ? new Date(invoice.date).toLocaleDateString('en-GB') : 'N/A'}
                      </p>
                    </td>
                    <td className="py-5 px-6">
                      <p className="text-sm text-gray-700">
                        {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-GB') : 'N/A'}
                      </p>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <p className="font-bold text-gray-900">₵{(invoice.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <p className={`font-bold ${(invoice.balance || 0) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        ₵{(invoice.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="py-5 px-6">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center w-fit border ${getStatusColor(invoice.status || 'draft')}`}>
                        {getStatusIcon(invoice.status || 'draft')}
                        <span className="ml-1">{(invoice.status || 'draft').charAt(0).toUpperCase() + (invoice.status || 'draft').slice(1)}</span>
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(invoice)}
                          className="p-2 rounded-lg hover:bg-primary-100 text-primary-600 transition-all hover:scale-110"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setReceiptInvoice(invoice)
                            setShowReceiptModal(true)
                          }}
                          className="p-2 rounded-lg hover:bg-primary-100 text-primary-600 transition-all hover:scale-110"
                          title="Generate Receipt"
                        >
                          <Receipt size={18} />
                        </button>
                        <button
                          onClick={() => handleSendInvoice(invoice)}
                          className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-all hover:scale-110"
                          title="Send Invoice"
                        >
                          <Send size={18} />
                        </button>
                        <button
                          onClick={() => handleEditInvoice(invoice)}
                          className="p-2 rounded-lg hover:bg-primary-100 text-primary-600 transition-all hover:scale-110"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(invoice)}
                          className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-all hover:scale-110"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-100 p-4 rounded-full mb-4">
                        <FileText size={48} className="text-gray-400" />
                      </div>
                      <p className="text-xl font-semibold text-gray-500 mb-2">No invoices found</p>
                      <p className="text-sm text-gray-500">
                        {searchTerm || statusFilter !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'Click "Create Invoice" to create your first invoice'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredInvoices.length > 0 && (
          <div className="border-t bg-gray-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Showing <span className="font-bold">{startIndex + 1}</span> to <span className="font-bold">{Math.min(endIndex, filteredInvoices.length)}</span> of <span className="font-bold">{filteredInvoices.length}</span> invoices
              </span>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Items per page:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm transition-all bg-white"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm transition-all bg-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Create/Edit Invoice Modal */}
      <CreateInvoice
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setEditingInvoice(null)
        }}
        onSave={handleSaveInvoice}
        editingInvoice={editingInvoice}
      />

      {/* Invoice Details Modal */}
      {showDetailModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gray-900 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-primary-500 p-2 rounded-lg mr-3">
                    <FileText size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Invoice {selectedInvoice.invoiceNumber}</h3>
                    <p className="text-sm text-gray-400 mt-1">Invoice Details & Information</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                    title="Print"
                  >
                    <Printer size={20} />
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedInvoice.invoiceNumber)
                      alert('Invoice number copied!')
                    }}
                    className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                    title="Copy Invoice Number"
                  >
                    <Copy size={20} />
                  </button>
                  <button 
                    onClick={() => setShowDetailModal(false)} 
                    className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">From:</h4>
                  <p className="text-sm text-gray-700 font-bold">Awosel OS Store</p>
                  <p className="text-sm text-gray-700">123 Business Street</p>
                  <p className="text-sm text-gray-700">Accra, Ghana</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">To:</h4>
                  <p className="text-sm text-gray-700 font-bold">{selectedInvoice.customer?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-700">{selectedInvoice.customer?.email || ''}</p>
                  <p className="text-sm text-gray-700">{selectedInvoice.customer?.phone || ''}</p>
                  <p className="text-sm text-gray-700">{selectedInvoice.customer?.address || ''}</p>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Invoice Number</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedInvoice.invoiceNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Invoice Date</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedInvoice.date ? new Date(selectedInvoice.date).toLocaleDateString('en-GB') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Due Date</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString('en-GB') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit border ${getStatusColor(selectedInvoice.status || 'draft')}`}>
                      {getStatusIcon(selectedInvoice.status || 'draft')}
                      <span className="ml-1">{(selectedInvoice.status || 'draft').charAt(0).toUpperCase() + (selectedInvoice.status || 'draft').slice(1)}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="mb-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                      selectedInvoice.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4 text-sm text-gray-900">{item.description || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-gray-900 text-center">{item.quantity || 0}</td>
                          <td className="py-3 px-4 text-sm text-gray-900 text-right">₵{(item.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">₵{(item.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-3 px-4 text-center text-gray-500">No items</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="py-3 px-4 text-right text-sm font-semibold text-gray-700">Subtotal:</td>
                      <td className="py-3 px-4 text-right text-sm font-semibold text-gray-900">₵{(selectedInvoice.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    {(selectedInvoice.discount || 0) > 0 && (
                      <tr>
                        <td colSpan="3" className="py-3 px-4 text-right text-sm font-semibold text-gray-700">Discount:</td>
                        <td className="py-3 px-4 text-right text-sm font-semibold text-gray-900">-₵{(selectedInvoice.discount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan="3" className="py-3 px-4 text-right text-sm font-semibold text-gray-700">Tax:</td>
                      <td className="py-3 px-4 text-right text-sm font-semibold text-gray-900">₵{(selectedInvoice.tax || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td colSpan="3" className="py-3 px-4 text-right text-base font-bold text-gray-900">Total:</td>
                      <td className="py-3 px-4 text-right text-base font-bold text-primary-600">₵{(selectedInvoice.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="py-3 px-4 text-right text-sm font-semibold text-gray-700">Paid:</td>
                      <td className="py-3 px-4 text-right text-sm font-semibold text-green-600">₵{(selectedInvoice.paid || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="py-3 px-4 text-right text-sm font-semibold text-gray-700">Balance:</td>
                      <td className="py-3 px-4 text-right text-sm font-bold text-orange-600">₵{(selectedInvoice.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-700">{selectedInvoice.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setReceiptInvoice(selectedInvoice)
                    setShowReceiptModal(true)
                  }}
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  <Receipt size={18} className="mr-2" />
                  Generate Receipt
                </button>
                <button
                  onClick={() => handleRecordPayment(selectedInvoice)}
                  className="btn-primary flex-1 flex items-center justify-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Wallet size={18} className="mr-2" />
                  Record Payment
                </button>
                <button
                  onClick={() => handleSendInvoice(selectedInvoice)}
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  <Send size={18} className="mr-2" />
                  Send Invoice
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    handleEditInvoice(selectedInvoice)
                  }}
                  className="btn-secondary flex-1 flex items-center justify-center"
                >
                  <Edit size={18} className="mr-2" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && receiptInvoice && (
        <InvoiceReceipt
          invoice={receiptInvoice}
          storeInfo={{
            name: 'Awosel OS Store',
            address: '123 Main Street, Accra',
            phone: '+233 24 123 4567',
            email: 'store@awosel.com',
            taxId: 'TAX-123456'
          }}
          onClose={() => {
            setShowReceiptModal(false)
            setReceiptInvoice(null)
          }}
        />
      )}
    </div>
  )
}

export default Invoices

