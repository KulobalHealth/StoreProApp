import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { listBranches, createBranch } from '../api/awoselDb'
import logo from '../logo.png'
import {
  Store, Plus, MapPin, ArrowRight, Building2, X,
  Users, ShoppingCart, Package, TrendingUp, DollarSign, UserCheck,
  BarChart3, Clock, LogOut, ChevronRight, Loader2
} from 'lucide-react'

const ActivityDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', location: '' })
  const [error, setError] = useState('')

  // If Sales role, go straight to POS; if Manager, go to their branch
  useEffect(() => {
    const role = (user?.role || '').toLowerCase()
    if (role === 'sales') {
      // Sales users should never be here — auto-set branch and go to POS
      if (user?.branch_id && !localStorage.getItem('awosel_active_branch')) {
        localStorage.setItem('awosel_active_branch', JSON.stringify({
          uuid: user.branch_id,
          id: user.branch_id,
          name: user.branch_name || 'My Branch',
        }))
      }
      navigate('/pos', { replace: true })
      return
    }
    if (role === 'manager') {
      // Manager shouldn't pick branches — go to their assigned branch dashboard
      const existingBranch = localStorage.getItem('awosel_active_branch')
      if (existingBranch) {
        navigate('/branch-dashboard', { replace: true })
        return
      }
      // If no branch set yet but user has branch_id, set it and redirect
      if (user?.branch_id) {
        localStorage.setItem('awosel_active_branch', JSON.stringify({
          uuid: user.branch_id,
          id: user.branch_id,
          name: user.branch_name || 'My Branch',
        }))
        navigate('/branch-dashboard', { replace: true })
        return
      }
    }
  }, [user, navigate])

  // Fetch branches from API on mount
  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      setLoading(true)
      const res = await listBranches()
      const list = res.data || res || []
      setBranches(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error('Failed to load branches:', err)
      setBranches([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Branch name is required'); return }
    if (!form.location.trim()) { setError('Location is required'); return }

    try {
      setSubmitting(true)
      const payload = {
        branchName: form.name.trim(),
        location: form.location.trim(),
        organization_id: user?.organization_id,
      }
      await createBranch(payload)
      setForm({ name: '', location: '' })
      setShowForm(false)
      await fetchBranches()
    } catch (err) {
      console.error('Create branch error:', err)
      setError(err.message || 'Failed to create branch')
    } finally {
      setSubmitting(false)
    }
  }

  const selectBranch = (branch) => {
    localStorage.setItem('awosel_active_branch', JSON.stringify(branch))
    navigate('/branch-dashboard')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Summary stats (placeholder — wire to API later)
  const stats = [
    { label: 'Total Branches', value: branches.length, icon: Store, color: 'bg-blue-100 text-blue-600', ring: 'ring-blue-200' },
    { label: 'Total Cashiers', value: 0, icon: UserCheck, color: 'bg-green-100 text-green-600', ring: 'ring-green-200' },
    { label: 'Total Users', value: 0, icon: Users, color: 'bg-purple-100 text-purple-600', ring: 'ring-purple-200' },
    { label: 'Total Products', value: 0, icon: Package, color: 'bg-orange-100 text-orange-600', ring: 'ring-orange-200' },
  ]

  const quickActions = [
    { label: 'Open POS', desc: 'Start selling', icon: ShoppingCart, path: '/pos', color: 'from-primary-500 to-primary-700' },
    { label: 'View Sales', desc: 'Sales history', icon: BarChart3, path: '/sales', color: 'from-emerald-500 to-emerald-700' },
    { label: 'Inventory', desc: 'Manage stock', icon: Package, path: '/inventory', color: 'from-orange-500 to-orange-700' },
    { label: 'Settings', desc: 'Configuration', icon: TrendingUp, path: '/settings', color: 'from-indigo-500 to-indigo-700' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Awosel OS" className="h-10 w-32 object-contain" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                {user?.organization?.name || 'Awosel OS'}
              </h1>
              <p className="text-xs text-gray-500">
                Welcome back, {user?.first_name || user?.email || 'User'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full capitalize">
              {user?.role || 'user'}
            </span>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color} ring-4 ${s.ring}`}>
                <s.icon size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Branches Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Store Branches</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {branches.length === 0
                  ? 'No branches yet — create your first one to get started'
                  : 'Select a branch to continue, or create a new one'}
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg shadow transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New Branch</span>
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
              <Loader2 size={32} className="animate-spin text-primary-500 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Loading branches...</p>
            </div>
          ) : branches.length === 0 ? (
            /* Empty state */
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-10 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="text-primary-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Create Your First Branch</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                A branch represents a physical store location. You need at least one to start using the POS.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="py-2.5 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg transition-all inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Create Branch
              </button>
            </div>
          ) : (
            /* Branch cards */
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => selectBranch(branch)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100 hover:border-primary-300 p-5 text-left transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 bg-primary-100 group-hover:bg-primary-200 rounded-lg flex items-center justify-center transition-colors">
                      <Store className="text-primary-600" size={20} />
                    </div>
                    <ArrowRight className="text-gray-300 group-hover:text-primary-500 transition-colors mt-1" size={18} />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mt-3">{branch.name}</h3>
                  {branch.location && (
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1.5">
                      <MapPin size={13} /> {branch.location}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className={`bg-gradient-to-br ${action.color} rounded-xl p-5 text-white text-left shadow-md hover:shadow-xl transition-all group`}
              >
                <action.icon size={28} className="opacity-90 mb-3" />
                <h3 className="font-bold text-base">{action.label}</h3>
                <p className="text-sm opacity-80 mt-0.5">{action.desc}</p>
                <ChevronRight size={18} className="mt-3 opacity-60 group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity placeholder */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-gray-400" />
            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          </div>
          <div className="text-center py-8 text-gray-400">
            <Clock size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Your recent activity will appear here</p>
          </div>
        </div>
      </div>

      {/* Create Branch Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => { setShowForm(false); setError('') }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Building2 className="text-primary-600" size={22} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Create New Branch</h2>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Branch Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g. Main Branch"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g. Accra, Ghana"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'} text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-2`}
              >
                {submitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Creating...</>
                ) : (
                  <><Plus size={18} /> Create Branch</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivityDashboard
