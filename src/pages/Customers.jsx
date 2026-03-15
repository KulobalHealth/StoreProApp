import React, { useState, useEffect, useMemo } from 'react'
import { Users, Plus, Edit, Trash2, Phone, Mail, MapPin, X, Eye, Search, DollarSign, AlertTriangle, TrendingUp, ShoppingBag, Calendar, User, Filter, RefreshCw, CreditCard, Hash } from 'lucide-react'
import { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer as apiDeleteCustomer } from '../api/awoselDb.js'
import { useAuth } from '../contexts/AuthContext'
import { getSessionBranchId, getSessionOrgId } from '../utils/branch'

const Avatar = ({ name, size = 'md' }) => {
  const initials = (name || '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const colors = [
    'from-orange-400 to-orange-600',
    'from-blue-400 to-blue-600',
    'from-emerald-400 to-emerald-600',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
    'from-cyan-400 to-cyan-600',
    'from-amber-400 to-amber-600',
    'from-rose-400 to-rose-600',
  ]
  const hash = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const colorClass = colors[hash % colors.length]
  const sizeClass = size === 'lg' ? 'w-14 h-14 text-lg' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'

  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold shadow-sm shrink-0`}>
      {initials}
    </div>
  )
}

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
  const [filterOwing, setFilterOwing] = useState(false)
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
    if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return
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

  const filteredList = useMemo(() => {
    let result = list
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      result = result.filter(c =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.address || '').toLowerCase().includes(q)
      )
    }
    if (filterOwing) {
      result = result.filter(c => Number(c.owing_amount) > 0)
    }
    return result
  }, [list, searchTerm, filterOwing])

  // Stats
  const totalSales = list.reduce((sum, c) => sum + (Number(c.total_sales) || 0), 0)
  const totalOwing = list.reduce((sum, c) => sum + (Number(c.owing_amount) || 0), 0)
  const customersOwing = list.filter(c => Number(c.owing_amount) > 0).length

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/25">
                <Users size={20} strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Customers</h1>
                <p className="text-gray-500 text-xs mt-0.5">Manage your customer database & track balances</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchCustomers}
                className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                title="Refresh"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                type="button"
                onClick={openAdd}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/25 active:scale-[0.98]"
              >
                <Plus size={16} strokeWidth={2.5} />
                Add Customer
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users size={18} className="text-blue-500" />
              </div>
              <span className="text-[10px] font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Total</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{list.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Customers</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <TrendingUp size={18} className="text-emerald-500" />
              </div>
              <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Revenue</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">₵{formatMoney(totalSales)}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Sales</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <CreditCard size={18} className="text-amber-500" />
              </div>
              <span className="text-[10px] font-semibold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Credit</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">₵{formatMoney(totalOwing)}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Owing</p>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 shadow-md shadow-primary-500/20">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-white" />
                </div>
                <span className="text-[10px] font-semibold text-white/90 bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Alert</span>
              </div>
              <p className="text-2xl font-extrabold text-white">{customersOwing}</p>
              <p className="text-xs text-white/80 mt-0.5">Owing Customers</p>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, phone, email or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 focus:bg-white text-gray-900 placeholder-gray-400 text-sm transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setFilterOwing(!filterOwing)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border shrink-0 ${
              filterOwing
                ? 'bg-red-50 border-red-200 text-red-700 shadow-sm'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter size={14} />
            Owing Only
            {filterOwing && customersOwing > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{customersOwing}</span>
            )}
          </button>
        </div>

        {/* Error */}
        {error && !showForm && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle size={16} className="text-red-500" />
            </div>
            <p className="text-red-700 flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 shrink-0">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Customer Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500 font-medium">Loading customers...</p>
              </div>
            </div>
          ) : filteredList.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/80">Customer</th>
                      <th className="text-left py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/80">Contact</th>
                      <th className="text-left py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/80 hidden md:table-cell">Address</th>
                      <th className="text-right py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/80 hidden sm:table-cell">Sales</th>
                      <th className="text-right py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/80">Spent</th>
                      <th className="text-right py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/80">Owing</th>
                      <th className="text-center py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/80 w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map((c, idx) => {
                      const hasDebt = Number(c.owing_amount) > 0
                      return (
                        <tr
                          key={c.uuid || c.id || idx}
                          className="border-b border-gray-50 hover:bg-primary-50/30 transition-colors group cursor-pointer"
                          onClick={() => handleViewDetails(c)}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={c.name} size="sm" />
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-primary-600 transition-colors">{c.name}</p>
                                {c.created_at && (
                                  <p className="text-[11px] text-gray-400 mt-0.5">Since {new Date(c.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              {c.phone && (
                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                  <Phone size={12} className="text-gray-400 shrink-0" />
                                  <span className="truncate">{c.phone}</span>
                                </div>
                              )}
                              {c.email && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                  <Mail size={11} className="text-gray-400 shrink-0" />
                                  <span className="truncate max-w-[160px]">{c.email}</span>
                                </div>
                              )}
                              {!c.phone && !c.email && (
                                <span className="text-sm text-gray-300 italic">No contact</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 hidden md:table-cell">
                            {c.address ? (
                              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <MapPin size={12} className="text-gray-400 shrink-0" />
                                <span className="truncate max-w-[180px]">{c.address}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-300">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right hidden sm:table-cell">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-md text-xs font-semibold text-gray-700">
                              <Hash size={10} />
                              {c.sales_count ?? 0}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-sm font-semibold text-gray-900">₵{formatMoney(c.total_sales)}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {hasDebt ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 border border-red-100">
                                <span className="text-sm font-bold text-red-600">₵{formatMoney(c.owing_amount)}</span>
                              </span>
                            ) : (
                              <span className="text-sm text-gray-300 font-medium">₵0.00</span>
                            )}
                          </td>
                          <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-center gap-0.5">
                              <button
                                type="button"
                                onClick={() => handleViewDetails(c)}
                                className="p-2 rounded-lg text-gray-400 hover:bg-primary-50 hover:text-primary-500 transition-colors"
                                title="View details"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => openEdit(c)}
                                className="p-2 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                                title="Edit"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(c.uuid || c.id)}
                                className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
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

              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Showing <span className="font-semibold text-gray-700">{filteredList.length}</span> of <span className="font-semibold text-gray-700">{list.length}</span> customers
                  {filterOwing && <span className="ml-1 text-red-500">(owing filter active)</span>}
                </span>
                {(searchTerm || filterOwing) && (
                  <button
                    onClick={() => { setSearchTerm(''); setFilterOwing(false) }}
                    className="text-xs text-primary-500 hover:text-primary-600 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="py-20 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-1">
                  <Users size={28} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    {searchTerm.trim() || filterOwing ? 'No customers match your filters' : 'No customers yet'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {searchTerm.trim() || filterOwing ? 'Try a different search term or remove filters.' : 'Add your first customer to get started.'}
                  </p>
                </div>
                {!searchTerm.trim() && !filterOwing ? (
                  <button
                    onClick={openAdd}
                    className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/25"
                  >
                    <Plus size={16} />
                    Add Customer
                  </button>
                ) : (
                  <button
                    onClick={() => { setSearchTerm(''); setFilterOwing(false) }}
                    className="mt-2 text-sm text-primary-500 hover:text-primary-600 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowForm(false); setError('') }}>
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editingId ? 'bg-blue-50' : 'bg-primary-50'}`}>
                  {editingId ? <Edit size={18} className="text-blue-500" /> : <Plus size={18} className="text-primary-500" />}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">{editingId ? 'Edit Customer' : 'New Customer'}</h2>
                  <p className="text-gray-500 text-xs mt-0.5">{editingId ? 'Update customer information' : 'Fill in the details below'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError('') }}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 space-y-5">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm flex items-center gap-3">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span className="flex-1">{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-sm bg-gray-50 focus:bg-white transition-colors"
                    placeholder="Enter customer name"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-sm bg-gray-50 focus:bg-white transition-colors"
                      placeholder="+233 ..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-sm bg-gray-50 focus:bg-white transition-colors"
                      placeholder="customer@email.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-sm bg-gray-50 focus:bg-white transition-colors"
                    placeholder="Address or area"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Owing Amount (₵)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.owing_amount}
                    onChange={(e) => setForm(f => ({ ...f, owing_amount: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-sm bg-gray-50 focus:bg-white transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError('') }}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDetail(null)}>
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const c = detailData || showDetail
              const recentSales = (detailData && detailData.recent_sales) || []
              const hasDebt = Number(c.owing_amount) > 0

              return (
                <>
                  {/* Detail Header */}
                  <div className="px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar name={c.name} size="lg" />
                        <div>
                          <h2 className="font-bold text-gray-900 text-xl">{c.name}</h2>
                          <div className="flex items-center gap-3 mt-1">
                            {c.phone && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Phone size={11} /> {c.phone}
                              </span>
                            )}
                            {c.email && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Mail size={11} /> {c.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowDetail(null)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Detail Body */}
                  <div className="flex-1 overflow-auto p-6 space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <p className="text-2xl font-bold text-blue-600">{c.sales_count ?? 0}</p>
                        <p className="text-xs text-gray-600 mt-1 font-medium">Purchases</p>
                      </div>
                      <div className="text-center p-4 bg-emerald-50 rounded-xl">
                        <p className="text-2xl font-bold text-emerald-600">₵{formatMoney(c.total_sales)}</p>
                        <p className="text-xs text-gray-600 mt-1 font-medium">Total Spent</p>
                      </div>
                      <div className={`text-center p-4 rounded-xl ${hasDebt ? 'bg-red-50' : 'bg-gray-50'}`}>
                        <p className={`text-2xl font-bold ${hasDebt ? 'text-red-600' : 'text-gray-400'}`}>₵{formatMoney(c.owing_amount)}</p>
                        <p className="text-xs text-gray-600 mt-1 font-medium">Owing</p>
                      </div>
                    </div>

                    {/* Customer Details */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Customer Information</h3>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                            <MapPin size={14} className="text-gray-400" />
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-400 font-medium uppercase">Address</p>
                            <p className="text-sm text-gray-700">{c.address || 'Not provided'}</p>
                          </div>
                        </div>
                        {c.created_at && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                              <Calendar size={14} className="text-gray-400" />
                            </div>
                            <div>
                              <p className="text-[11px] text-gray-400 font-medium uppercase">Customer Since</p>
                              <p className="text-sm text-gray-700">{new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recent Sales */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Purchases</h3>
                      {recentSales.length > 0 ? (
                        <div className="bg-gray-50 rounded-xl overflow-hidden">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-2.5 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="text-left py-2.5 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Receipt #</th>
                                <th className="text-right py-2.5 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recentSales.map((sale, i) => (
                                <tr key={sale.id || i} className="border-b border-gray-100 last:border-0">
                                  <td className="py-2.5 px-4 text-sm text-gray-700">{new Date(sale.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                  <td className="py-2.5 px-4">
                                    <span className="text-sm font-mono text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">{sale.receipt_number}</span>
                                  </td>
                                  <td className="py-2.5 px-4 text-right text-sm font-bold text-emerald-600">₵{formatMoney(sale.total)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-10 bg-gray-50 rounded-xl">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                            <ShoppingBag size={20} className="text-gray-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-500">No purchases yet</p>
                          <p className="text-xs text-gray-400 mt-1">Sales will appear here once this customer makes a purchase</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detail Footer */}
                  <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowDetail(null)}
                      className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDetail(null)
                        openEdit(detailData || showDetail)
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/25 active:scale-[0.98]"
                    >
                      <Edit size={15} />
                      Edit Customer
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

export default Customers
