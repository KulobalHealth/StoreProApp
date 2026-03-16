import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Plus, Edit, Trash2, Phone, MapPin, X, Eye, Search, DollarSign, AlertTriangle, Users, TrendingUp } from 'lucide-react'
import { listSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api/awoselDb.js'
import { getSessionBranchId, getSessionOrgId } from '../utils/branch'
import Tooltip from '../components/Tooltip'

const Suppliers = () => {
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [form, setForm] = useState({
    name: '',
    phone1: '',
    phone2: '',
    email: '',
    location: '',
    description: '',
    value_supplied: '',
    debt_owing: '',
  })

  const fetchSuppliers = async () => {
    setLoading(true)
    setError('')
    try {
      const branchId = getSessionBranchId()
      if (!branchId) { setError('No active branch selected'); setLoading(false); return }
      const data = await listSuppliers(branchId)
      setList(Array.isArray(data) ? data : (data?.data || []))
    } catch (err) {
      setError(err.message || 'Could not load suppliers')
      setList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const openAdd = () => {
    setEditingId(null)
    setForm({ name: '', phone1: '', phone2: '', email: '', location: '', description: '', value_supplied: '', debt_owing: '' })
    setShowForm(true)
  }

  const openEdit = (s) => {
    setEditingId(s.uuid || s.id)
    setForm({
      name: s.name || '',
      phone1: s.phone1 || '',
      phone2: s.phone2 || '',
      email: s.email || '',
      location: s.location || '',
      description: s.description || '',
      value_supplied: s.value_supplied ?? '',
      debt_owing: s.debt_owing ?? '',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const name = form.name.trim()
    if (!name) {
      setError('Supplier name is required')
      return
    }
    setError('')
    setSubmitting(true)
    const payload = {
      name,
      phone1: form.phone1.trim(),
      phone2: form.phone2.trim(),
      email: form.email.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
    }
    // Add branchId and organizationId for create
    if (!editingId) {
      payload.branchId = getSessionBranchId()
      payload.organizationId = getSessionOrgId()
    }
    // Include value_supplied and debt_owing for updates
    if (editingId) {
      payload.value_supplied = parseFloat(form.value_supplied) || 0
      payload.debt_owing = parseFloat(form.debt_owing) || 0
    }
    try {
      if (editingId) {
        await updateSupplier(editingId, payload)
      } else {
        await createSupplier(payload)
      }
      setShowForm(false)
      fetchSuppliers()
    } catch (err) {
      setError(err.message || 'Could not save supplier')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this supplier?')) return
    try {
      await deleteSupplier(id)
      fetchSuppliers()
    } catch (err) {
      alert(err.message || 'Could not delete supplier')
    }
  }

  const formatMoney = (n) => (Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  // Search filter
  const filteredList = searchTerm.trim()
    ? list.filter(s => {
        const q = searchTerm.toLowerCase().trim()
        return (
          (s.name || '').toLowerCase().includes(q) ||
          (s.phone1 || '').includes(q) ||
          (s.phone2 || '').includes(q) ||
          (s.email || '').toLowerCase().includes(q) ||
          (s.location || '').toLowerCase().includes(q)
        )
      })
    : list

  // Stats
  const totalSupplied = list.reduce((sum, s) => sum + (Number(s.value_supplied) || 0), 0)
  const totalDebt = list.reduce((sum, s) => sum + (Number(s.debt_owing) || 0), 0)
  const suppliersWithDebt = list.filter(s => Number(s.debt_owing) > 0).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-500 text-white">
                <Building2 size={18} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">Suppliers</h1>
                <p className="text-gray-500 text-xs">Manage your suppliers and track debts</p>
              </div>
            </div>
            <Tooltip text="Add a new supplier to your list">
              <button
                type="button"
                onClick={openAdd}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors shadow-sm"
              >
                <Plus size={16} strokeWidth={2.5} />
                Add Supplier
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Total Suppliers</p>
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
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Total Supplied</p>
                <p className="text-2xl font-bold text-primary-500 mt-1">₵{formatMoney(totalSupplied)}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <TrendingUp className="text-primary-500" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Total Debt</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₵{formatMoney(totalDebt)}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <DollarSign className="text-primary-500" size={20} />
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 bg-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs font-medium uppercase tracking-wide">Owing Debt</p>
                <p className="text-2xl font-bold text-white mt-1">{suppliersWithDebt}</p>
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
              placeholder="Search by name, phone, email or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-gray-900 placeholder-gray-400 text-sm"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
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
                <span className="text-sm">Loading suppliers...</span>
              </div>
            </div>
          ) : filteredList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Supplier</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Contact</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Location</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Value Supplied</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Debt Owing</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredList.map((s, idx) => {
                    const hasDebt = Number(s.debt_owing) > 0
                    return (
                      <tr key={s.id || s.uuid || idx} className={`hover:bg-primary-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                              <Building2 size={14} className="text-primary-500" />
                            </div>
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => navigate(`/suppliers/${s.uuid || s.id}`)}
                                className="font-medium text-gray-900 text-sm hover:text-primary-500 transition-colors truncate block"
                              >
                                {s.name}
                              </button>
                              {s.email && (
                                <p className="text-xs text-gray-500 truncate">{s.email}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            {s.phone1 && (
                              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <Phone size={12} className="text-gray-400 shrink-0" />
                                {s.phone1}
                              </div>
                            )}
                            {s.phone2 && (
                              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                <Phone size={12} className="text-gray-400 shrink-0" />
                                {s.phone2}
                              </div>
                            )}
                            {!s.phone1 && !s.phone2 && (
                              <span className="text-sm text-gray-300">—</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {s.location ? (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <MapPin size={12} className="text-gray-400 shrink-0" />
                              <span className="truncate max-w-[180px]">{s.location}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-300">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-medium text-gray-900 text-sm">₵{formatMoney(s.value_supplied)}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`text-sm font-semibold ${hasDebt ? 'text-red-600' : 'text-gray-400'}`}>
                            ₵{formatMoney(s.debt_owing)}
                          </span>
                          {hasDebt && (
                            <span className="ml-1.5 inline-flex px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-red-100 text-red-600">
                              OWING
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center gap-1">
                            <Tooltip text="View supplier details & purchase history">
                              <button
                                type="button"
                                onClick={() => navigate(`/suppliers/${s.uuid || s.id}`)}
                                className="p-1.5 rounded-md text-gray-400 hover:bg-primary-50 hover:text-primary-500 transition-colors"
                              >
                                <Eye size={15} />
                              </button>
                            </Tooltip>
                            <Tooltip text="Edit supplier information">
                              <button
                                type="button"
                                onClick={() => openEdit(s)}
                                className="p-1.5 rounded-md text-gray-400 hover:bg-primary-50 hover:text-primary-500 transition-colors"
                              >
                                <Edit size={15} />
                              </button>
                            </Tooltip>
                            <Tooltip text="Delete this supplier">
                              <button
                                type="button"
                                onClick={() => handleDelete(s.uuid || s.id)}
                                className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </Tooltip>
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
                <Building2 size={40} />
                <p className="text-sm font-medium text-gray-500">
                  {searchTerm.trim() ? 'No suppliers match your search' : 'No suppliers yet'}
                </p>
                <p className="text-xs text-gray-500">
                  {searchTerm.trim() ? 'Try a different search term.' : 'Add a supplier to get started.'}
                </p>
                {!searchTerm.trim() && (
                  <button
                    onClick={openAdd}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
                  >
                    <Plus size={16} />
                    Add Supplier
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Footer count */}
          {filteredList.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing <span className="font-medium text-gray-900">{filteredList.length}</span> of <span className="font-medium text-gray-900">{list.length}</span> suppliers
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
                  <h2 className="text-white font-bold text-lg">{editingId ? 'Edit Supplier' : 'Add Supplier'}</h2>
                  <p className="text-gray-500 text-xs mt-0.5">{editingId ? 'Update supplier information' : 'Enter supplier details'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Supplier Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="Enter supplier name"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone 1</label>
                  <input
                    type="text"
                    value={form.phone1}
                    onChange={(e) => setForm(f => ({ ...f, phone1: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    placeholder="+233 ..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone 2</label>
                  <input
                    type="text"
                    value={form.phone2}
                    onChange={(e) => setForm(f => ({ ...f, phone2: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    placeholder="+233 ..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="supplier@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="Address or area"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm resize-none"
                  placeholder="What does this supplier sell?"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Value Supplied (₵)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.value_supplied}
                    onChange={(e) => setForm(f => ({ ...f, value_supplied: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Debt Owing (₵)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.debt_owing}
                    onChange={(e) => setForm(f => ({ ...f, debt_owing: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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
                  ) : editingId ? 'Update Supplier' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Suppliers
