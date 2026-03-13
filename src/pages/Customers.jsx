import React, { useState, useEffect } from 'react'
import { Users, Plus, Edit, Trash2, Phone, Mail, MapPin, X, Eye, Search, DollarSign, AlertTriangle, TrendingUp, ShoppingBag, Calendar, User } from 'lucide-react'
import { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer as apiDeleteCustomer } from '../api/awoselDb.js'
import { useAuth } from '../contexts/AuthContext'
import { getSessionBranchId, getSessionOrgId } from '../utils/branch'

const Customers = () => {
  const { user } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDetail, setShowDetail] = useState(null)
  const [detailData, setDetailData] = useState(null)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    owing_amount: '',
  })

  const fetchCustomers = async () => {
    setLoading(true)
    setError('')
    try {
      const branchId = getSessionBranchId()
      if (!branchId) { setError('No active branch selected'); setLoading(false); return }
      const data = await listCustomers(branchId, { q: searchTerm.trim() })
      const arr = Array.isArray(data) ? data : (data?.data || [])
      setList(arr)
    } catch (err) {
      setError(err.message || 'Could not load customers')
      setList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers()
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const openAdd = () => {
    setEditingId(null)
    setForm({ name: '', phone: '', email: '', address: '', owing_amount: '' })
    setError('')
    setShowForm(true)
  }

  const openEdit = (c) => {
    setEditingId(c.uuid || c.id)
    setForm({
      name: c.name || '',
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      owing_amount: c.owing_amount ?? '',
    })
    setError('')
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const name = form.name.trim()
    if (!name) {
      setError('Customer name is required')
      return
    }
    setError('')
    setSubmitting(true)
    const payload = {
      name,
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      owing_amount: parseFloat(form.owing_amount) || 0,
    }
    try {
      if (editingId) {
        await updateCustomer(editingId, payload)
      } else {
        // Add branchId and organizationId for create
        payload.branchId = getSessionBranchId()
        payload.organizationId = getSessionOrgId()
        await createCustomer(payload)
      }
      setShowForm(false)
      fetchCustomers()
    } catch (err) {
      setError(err.message || 'Could not save customer')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return
    try {
      await apiDeleteCustomer(id)
      fetchCustomers()
    } catch (err) {
      alert(err.message || 'Could not delete customer')
    }
  }

  const handleViewDetails = async (c) => {
    setShowDetail(c)
    setDetailData(null)
    try {
      const full = await getCustomer(c.uuid || c.id)
      setDetailData(full?.data || full)
    } catch {
      setDetailData(null)
    }
  }

  const formatMoney = (n) => (Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  // Search filter (client-side fallback)
  const filteredList = searchTerm.trim()
    ? list.filter(c => {
        const q = searchTerm.toLowerCase().trim()
        return (
          (c.name || '').toLowerCase().includes(q) ||
          (c.phone || '').includes(q) ||
          (c.email || '').toLowerCase().includes(q) ||
          (c.address || '').toLowerCase().includes(q)
        )
      })
    : list

  // Stats
  const totalSales = list.reduce((sum, c) => sum + (Number(c.total_sales) || 0), 0)
  const totalOwing = list.reduce((sum, c) => sum + (Number(c.owing_amount) || 0), 0)
  const customersOwing = list.filter(c => Number(c.owing_amount) > 0).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-500 text-white">
                <Users size={18} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">Customers</h1>
                <p className="text-gray-500 text-xs">Manage your customer database and track balances</p>
              </div>
            </div>
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors shadow-sm"
            >
              <Plus size={16} strokeWidth={2.5} />
              Add Customer
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{list.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <Users className="text-primary-500" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Total Sales</p>
                <p className="text-2xl font-bold text-primary-500 mt-1">₵{formatMoney(totalSales)}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <TrendingUp className="text-primary-500" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Total Owing</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₵{formatMoney(totalOwing)}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <DollarSign className="text-primary-500" size={20} />
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 bg-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs font-medium uppercase tracking-wide">Owing Balance</p>
                <p className="text-2xl font-bold text-white mt-1">{customersOwing}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <AlertTriangle className="text-white" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, phone, email or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-gray-900 placeholder-gray-400 text-sm"
            />
          </div>
        </div>

        {/* Error */}
        {error && !showForm && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2 text-red-700 text-sm">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center">
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Loading customers...</span>
              </div>
            </div>
          ) : filteredList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Customer</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Contact</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Address</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Sales</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Total Spent</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Owing</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredList.map((c, idx) => {
                    const hasDebt = Number(c.owing_amount) > 0
                    return (
                      <tr key={c.uuid || c.id || idx} className={`hover:bg-primary-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                              <User size={14} className="text-primary-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{c.name}</p>
                              {c.email && (
                                <p className="text-xs text-gray-500 truncate">{c.email}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            {c.phone && (
                              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <Phone size={12} className="text-gray-400 shrink-0" />
                                {c.phone}
                              </div>
                            )}
                            {c.email && (
                              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                <Mail size={12} className="text-gray-400 shrink-0" />
                                {c.email}
                              </div>
                            )}
                            {!c.phone && !c.email && (
                              <span className="text-sm text-gray-300">—</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {c.address ? (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <MapPin size={12} className="text-gray-400 shrink-0" />
                              <span className="truncate max-w-[180px]">{c.address}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-300">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-medium text-gray-900 text-sm">{c.sales_count ?? 0}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-medium text-gray-900 text-sm">₵{formatMoney(c.total_sales)}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`text-sm font-semibold ${hasDebt ? 'text-red-600' : 'text-gray-400'}`}>
                            ₵{formatMoney(c.owing_amount)}
                          </span>
                          {hasDebt && (
                            <span className="ml-1.5 inline-flex px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-red-100 text-red-600">
                              OWING
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleViewDetails(c)}
                              className="p-1.5 rounded-md text-gray-400 hover:bg-primary-50 hover:text-primary-500 transition-colors"
                              title="View details"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(c)}
                              className="p-1.5 rounded-md text-gray-400 hover:bg-primary-50 hover:text-primary-500 transition-colors"
                              title="Edit"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(c.uuid || c.id)}
                              className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <Users size={40} />
                <p className="text-sm font-medium text-gray-500">
                  {searchTerm.trim() ? 'No customers match your search' : 'No customers yet'}
                </p>
                <p className="text-xs text-gray-500">
                  {searchTerm.trim() ? 'Try a different search term.' : 'Add a customer to get started.'}
                </p>
                {!searchTerm.trim() && (
                  <button
                    onClick={openAdd}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
                  >
                    <Plus size={16} />
                    Add Customer
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Footer count */}
          {filteredList.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing <span className="font-medium text-gray-900">{filteredList.length}</span> of <span className="font-medium text-gray-900">{list.length}</span> customers
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gray-900 rounded-t-xl px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-500/20 flex items-center justify-center">
                  {editingId ? <Edit size={18} className="text-primary-400" /> : <Plus size={18} className="text-primary-400" />}
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">{editingId ? 'Edit Customer' : 'Add Customer'}</h2>
                  <p className="text-gray-500 text-xs mt-0.5">{editingId ? 'Update customer information' : 'Enter customer details'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError('') }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 space-y-4">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm flex items-center gap-2">
                  <AlertTriangle size={14} />
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Customer Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    placeholder="+233 ..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    placeholder="customer@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="Address or area"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Owing Amount (₵)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.owing_amount}
                  onChange={(e) => setForm(f => ({ ...f, owing_amount: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="0.00"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError('') }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : editingId ? 'Update Customer' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Detail Header */}
            <div className="bg-gray-900 rounded-t-xl px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-500/20 flex items-center justify-center">
                  <Eye size={18} className="text-primary-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Customer Details</h2>
                  <p className="text-gray-500 text-xs mt-0.5">View customer information and sales record</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetail(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Detail Body */}
            <div className="flex-1 overflow-auto p-6">
              {(() => {
                const c = detailData || showDetail
                const recentSales = (detailData && detailData.recent_sales) || []
                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Customer Info */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Customer Information</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-400" />
                            <span className="text-gray-500 w-20 text-sm">Name:</span>
                            <span className="font-semibold text-gray-900 text-sm">{c.name}</span>
                          </div>
                          {c.phone && (
                            <div className="flex items-center gap-2">
                              <Phone size={16} className="text-gray-400" />
                              <span className="text-gray-500 w-20 text-sm">Phone:</span>
                              <span className="text-gray-900 text-sm">{c.phone}</span>
                            </div>
                          )}
                          {c.email && (
                            <div className="flex items-center gap-2">
                              <Mail size={16} className="text-gray-400" />
                              <span className="text-gray-500 w-20 text-sm">Email:</span>
                              <span className="text-gray-900 text-sm">{c.email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-gray-400" />
                            <span className="text-gray-500 w-20 text-sm">Address:</span>
                            <span className="text-gray-900 text-sm">{c.address || '—'}</span>
                          </div>
                          {c.created_at && (
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-gray-400" />
                              <span className="text-gray-500 w-20 text-sm">Joined:</span>
                              <span className="text-gray-900 text-sm">{new Date(c.created_at).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Sales Summary */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Sales Record</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-primary-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Sales Count</p>
                            <p className="text-xl font-bold text-primary-500">{c.sales_count ?? 0}</p>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Total Spent</p>
                            <p className="text-xl font-bold text-green-600">₵{formatMoney(c.total_sales)}</p>
                          </div>
                          <div className="bg-red-50 p-3 rounded-lg col-span-2">
                            <p className="text-xs text-gray-500">Owing Amount</p>
                            <p className="text-xl font-bold text-red-600">₵{formatMoney(c.owing_amount)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Sales */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Sales</h3>
                      {recentSales.length > 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-900 text-white">
                                <th className="text-left py-2.5 px-4 text-xs font-semibold uppercase tracking-wider">Date</th>
                                <th className="text-left py-2.5 px-4 text-xs font-semibold uppercase tracking-wider">Receipt #</th>
                                <th className="text-right py-2.5 px-4 text-xs font-semibold uppercase tracking-wider">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {recentSales.map((sale, i) => (
                                <tr key={sale.id || i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                  <td className="py-2.5 px-4 text-sm text-gray-700">{new Date(sale.created_at).toLocaleDateString()}</td>
                                  <td className="py-2.5 px-4 text-sm text-gray-700">{sale.receipt_number}</td>
                                  <td className="py-2.5 px-4 text-right text-sm font-semibold text-primary-500">₵{formatMoney(sale.total)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <ShoppingBag size={32} className="mx-auto mb-2 text-gray-300" />
                          <p className="text-sm text-gray-500">No sales yet</p>
                        </div>
                      )}
                    </div>
                  </>
                )
              })()}
            </div>

            {/* Detail Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDetail(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDetail(null)
                  openEdit(detailData || showDetail)
                }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors shadow-sm"
              >
                <Edit size={15} />
                Edit Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Customers
