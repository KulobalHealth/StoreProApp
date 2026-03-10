import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  Users as UsersIcon, UserPlus, X, Shield, Pencil, Trash2,
  Search, Filter, Mail, Calendar, Eye, EyeOff, Phone,
  UserCheck, ChevronDown, RefreshCw, Building2, MapPin
} from 'lucide-react'
import { listEmployees, createEmployee, updateEmployee, deleteEmployee, listBranches } from '../api/awoselDb.js'
import { getActiveBranch, getSessionBranchId, getSessionOrgId } from '../utils/branch'

const ROLES = ['manager', 'sales', 'account']

const ROLE_COLORS = {
  manager: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  sales: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  account: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  admin: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
}

const AVATAR_COLORS = [
  'from-primary-500 to-primary-700',
  'from-emerald-500 to-teal-700',
  'from-blue-500 to-indigo-700',
  'from-orange-500 to-red-600',
  'from-purple-500 to-violet-700',
  'from-pink-500 to-rose-700',
  'from-cyan-500 to-sky-700',
]

const Users = () => {
  const { user } = useAuth()
  const [list, setList] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'sales', branch_id: '' })

  const isAdmin = user?.role === 'admin' || user?.role === 'manager'

  const fetchBranches = async () => {
    try {
      const res = await listBranches()
      const data = Array.isArray(res) ? res : (res?.data || [])
      setBranches(data)
      return data
    } catch { setBranches([]) ; return [] }
  }

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError('')
      const activeBranch = getActiveBranch()
      const branchId = activeBranch?.uuid || activeBranch?.id || getSessionBranchId()
      if (!branchId) {
        // If no active branch, try to load from all branches
        const branchList = branches.length ? branches : await fetchBranches()
        if (branchList.length === 0) { setList([]); return }
        // Fetch employees from all branches
        const allEmployees = []
        for (const b of branchList) {
          try {
            const res = await listEmployees(b.uuid || b.id)
            const data = Array.isArray(res) ? res : (res?.data || [])
            allEmployees.push(...data.map(e => ({ ...e, _branchName: b.name })))
          } catch {}
        }
        setList(allEmployees)
        return
      }
      const res = await listEmployees(branchId)
      const data = Array.isArray(res) ? res : (res?.data || [])
      setList(data)
    } catch (err) {
      setError(err.message || 'Could not load employees')
      setList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchBranches()
      fetchEmployees()
    }
  }, [isAdmin])

  const filteredUsers = useMemo(() => {
    return list.filter(u => {
      const q = searchQuery.toLowerCase()
      const matchesSearch = !q || (u.username || '').toLowerCase().includes(q) ||
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.first_name || '').toLowerCase().includes(q) ||
        (u.last_name || '').toLowerCase().includes(q)
      const matchesRole = roleFilter === 'all' || u.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [list, searchQuery, roleFilter])

  const stats = useMemo(() => {
    const total = list.length
    const byRole = {}
    ROLES.forEach(r => { byRole[r] = 0 })
    list.forEach(u => {
      if (byRole[u.role] !== undefined) byRole[u.role]++
    })
    return { total, byRole }
  }, [list])

  const getInitials = (u) => {
    if (u.first_name && u.last_name) return (u.first_name[0] + u.last_name[0]).toUpperCase()
    if (u.name && u.name.includes(' ')) {
      const parts = u.name.split(' ')
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return (u.name || u.username || u.email || '?')[0].toUpperCase()
  }

  const getDisplayName = (u) => {
    if (u.first_name && u.last_name) return `${u.first_name} ${u.last_name}`
    return u.name || u.username || u.email || 'Unknown'
  }

  const getAvatarColor = (u) => {
    // Handle both numeric and UUID ids
    const id = typeof u.id === 'string' ? u.id.charCodeAt(0) + u.id.charCodeAt(u.id.length - 1) : (u.id || 0)
    return AVATAR_COLORS[id % AVATAR_COLORS.length]
  }

  const formatDate = (str) => {
    if (!str) return '—'
    try {
      const d = new Date(str)
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    } catch (_) {
      return str
    }
  }

  const openAddModal = () => {
    setEditingUser(null)
    const activeBranch = getActiveBranch()
    setForm({
      firstName: '', lastName: '', email: '', phone: '',
      password: '', role: 'sales',
      branch_id: activeBranch?.uuid || activeBranch?.id || (branches[0]?.uuid || branches[0]?.id || ''),
    })
    setShowModal(true)
    setShowPassword(false)
    setError('')
  }

  const openEditModal = (u) => {
    setEditingUser(u)
    setForm({
      firstName: u.first_name || '',
      lastName: u.last_name || '',
      email: u.email || '',
      phone: u.phone || '',
      password: '',
      role: u.role || 'sales',
      branch_id: u.branch_id || '',
    })
    setShowModal(true)
    setShowPassword(false)
    setError('')
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (editingUser) {
      // Update employee
      if (!form.firstName.trim() || !form.lastName.trim()) { setError('First and last name are required'); return }
      if (form.password && form.password.length < 4) { setError('Password must be at least 4 characters'); return }
      try {
        setSubmitting(true)
        const body = {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          role: form.role,
        }
        if (form.email) body.email = form.email
        if (form.phone) body.phone = form.phone
        if (form.password) body.password = form.password
        if (form.branch_id) body.branch_id = form.branch_id
        await updateEmployee(editingUser.id, body)
        closeModal()
        fetchEmployees()
      } catch (err) {
        setError(err.message || 'Could not update employee')
      } finally {
        setSubmitting(false)
      }
    } else {
      // Create employee
      if (!form.firstName.trim() || !form.lastName.trim()) { setError('First and last name are required'); return }
      if (!form.email.trim()) { setError('Email is required'); return }
      if (!form.password) { setError('Password is required'); return }
      if (form.password.length < 4) { setError('Password must be at least 4 characters'); return }
      if (!form.branch_id) { setError('Please select a branch'); return }
      try {
        setSubmitting(true)
        await createEmployee({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone || undefined,
          password: form.password,
          role: form.role,
          branch_id: form.branch_id,
          organization_id: user?.organization_id || user?.organization?.id || '',
        })
        closeModal()
        fetchEmployees()
      } catch (err) {
        setError(err.message || 'Could not create employee')
      } finally {
        setSubmitting(false)
      }
    }
  }

  const handleDeleteUser = async (u) => {
    if (u.id === user?.id) { setError('You cannot delete your own account'); return }
    const displayName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email
    if (!window.confirm(`Delete employee "${displayName}"? This cannot be undone.`)) return
    setError('')
    try {
      setSubmitting(true)
      await deleteEmployee(u.id)
      fetchEmployees()
    } catch (err) {
      setError(err.message || 'Could not delete employee')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-10 text-center max-w-md">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-amber-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">Only administrators can manage users and permissions.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Employee Management</h1>
            <p className="text-gray-500 mt-1">Manage your team members and their roles</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchEmployees}
              className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-sm shadow-primary-200 transition-all hover:shadow-md"
            >
              <UserPlus size={18} />
              <span className="font-medium">Add Employee</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {!loading && list.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <UsersIcon size={16} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          {ROLES.map(role => {
            const colors = ROLE_COLORS[role]
            return (
              <button
                key={role}
                onClick={() => setRoleFilter(f => f === role ? 'all' : role)}
                className={`rounded-xl border p-4 text-left transition-all ${roleFilter === role ? `${colors.bg} ${colors.border} ring-2 ring-offset-1 ring-${role === 'manager' ? 'blue' : role === 'sales' ? 'emerald' : role === 'account' ? 'purple' : 'red'}-300` : 'bg-white border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider capitalize">{role}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.byRole[role] || 0}</p>
              </button>
            )
          })}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <X size={16} className="text-red-600" />
          </div>
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search users by name, username or email..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white appearance-none cursor-pointer"
          >
            <option value="all">All roles</option>
            {ROLES.map(r => <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Loading employees...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {list.length === 0 ? <UserPlus size={28} className="text-gray-400" /> : <Search size={28} className="text-gray-400" />}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {list.length === 0 ? 'No employees yet' : 'No employees found'}
            </h3>
            <p className="text-gray-500 mb-4">
              {list.length === 0 ? 'Get started by adding your first team member.' : 'Try adjusting your search or filter criteria.'}
            </p>
            {list.length === 0 && (
              <button onClick={openAddModal} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                <UserPlus size={16} /> Add first employee
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-3">Employee</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Email</div>
              <div className="col-span-2">Phone</div>
              <div className="col-span-1">Joined</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* User Rows */}
            <div className="divide-y divide-gray-100">
              {filteredUsers.map(u => {
                const roleColor = ROLE_COLORS[u.role] || ROLE_COLORS.staff
                const isCurrentUser = u.id === user?.id

                return (
                  <div key={u.id} className="group px-4 sm:px-6 py-4 hover:bg-gray-50/50 transition-colors">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center flex flex-col gap-3">
                      {/* Avatar + Name */}
                      <div className="col-span-3 flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(u)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm`}>
                          {getInitials(u)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900 truncate">{getDisplayName(u)}</p>
                            {isCurrentUser && (
                              <span className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded">YOU</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{u.email || '—'}</p>
                        </div>
                      </div>

                      {/* Role Badge */}
                      <div className="col-span-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${roleColor.bg} ${roleColor.text} border ${roleColor.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${roleColor.dot}`} />
                          {(u.role || 'sales').charAt(0).toUpperCase() + (u.role || 'sales').slice(1)}
                        </span>
                      </div>

                      {/* Email */}
                      <div className="col-span-2 hidden lg:block">
                        <p className="text-sm text-gray-600 truncate">{u.email || '—'}</p>
                      </div>

                      {/* Phone */}
                      <div className="col-span-2 hidden lg:flex items-center gap-1.5 text-sm text-gray-500">
                        <Phone size={13} className="flex-shrink-0" />
                        {u.phone || '—'}
                      </div>

                      {/* Joined Date */}
                      <div className="col-span-1 hidden lg:flex items-center gap-1 text-xs text-gray-500">
                        {formatDate(u.created_at || u.createdAt)}
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          className="p-2 rounded-lg text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                          title="Edit user"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          disabled={isCurrentUser || submitting}
                          className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title={isCurrentUser ? 'Cannot delete yourself' : 'Delete user'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Showing <span className="font-semibold text-gray-700">{filteredUsers.length}</span> of{' '}
                <span className="font-semibold text-gray-700">{list.length}</span> employees
              </p>
              {(searchQuery || roleFilter !== 'all') && (
                <button
                  onClick={() => { setSearchQuery(''); setRoleFilter('all') }}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editingUser ? 'bg-blue-50' : 'bg-primary-50'}`}>
                  {editingUser ? <Pencil size={18} className="text-blue-600" /> : <UserPlus size={18} className="text-primary-600" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{editingUser ? 'Edit Employee' : 'Add New Employee'}</h2>
                  <p className="text-xs text-gray-500">{editingUser ? `Editing ${editingUser.first_name || ''} ${editingUser.last_name || ''}`.trim() || editingUser.email : 'Create a new team member account'}</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                  <X size={14} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="Ekow"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      placeholder="ekow@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      placeholder="+233567896543"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {editingUser ? 'New Password' : 'Password'} {!editingUser && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm pr-10"
                      placeholder={editingUser ? 'Leave blank to keep' : 'Min 4 characters'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role <span className="text-red-500">*</span></label>
                  <select
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm appearance-none cursor-pointer bg-white"
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Branch Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  <span className="flex items-center gap-1.5"><Building2 size={14} /> Branch</span>
                  {!editingUser && <span className="text-red-500 ml-1">*</span>}
                </label>
                <select
                  value={form.branch_id}
                  onChange={e => setForm(f => ({ ...f, branch_id: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm appearance-none cursor-pointer bg-white"
                >
                  <option value="">Select a branch...</option>
                  {branches.map(b => (
                    <option key={b.uuid || b.id} value={b.uuid || b.id}>
                      {b.name} — {b.location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Preview */}
              <div className="flex flex-wrap gap-2">
                {ROLES.map(r => {
                  const c = ROLE_COLORS[r]
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, role: r }))}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${form.role === r ? `${c.bg} ${c.text} ${c.border} ring-2 ring-offset-1` : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${form.role === r ? c.dot : 'bg-gray-400'}`} />
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  )
                })}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 text-sm font-medium shadow-sm transition-all flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {editingUser ? 'Saving...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {editingUser ? <UserCheck size={16} /> : <UserPlus size={16} />}
                      {editingUser ? 'Save Changes' : 'Create Employee'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
