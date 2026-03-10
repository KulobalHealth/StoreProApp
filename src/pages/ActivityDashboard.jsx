import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { listBranches, createBranch } from '../api/awoselDb'
import logo from '../logo.png'
import {
  Store, Plus, MapPin, Building2, X,
  LogOut, Loader2, ArrowRight, Search, RefreshCw
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
  const [branchSearch, setBranchSearch] = useState('')

  // If Sales role, go straight to POS; if Manager, go to their branch
  useEffect(() => {
    const role = (user?.role || '').toLowerCase()
    if (role === 'sales') {
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
      const existingBranch = localStorage.getItem('awosel_active_branch')
      if (existingBranch) {
        navigate('/branch-dashboard', { replace: true })
        return
      }
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
      await createBranch({
        branchName: form.name.trim(),
        location: form.location.trim(),
        organization_id: user?.organization_id,
      })
      setForm({ name: '', location: '' })
      setShowForm(false)
      await fetchBranches()
    } catch (err) {
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

  const firstName = user?.first_name || user?.name?.split(' ')[0] || 'User'
  const orgName = user?.organization?.name || 'StorePro'

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const filteredBranches = branchSearch.trim()
    ? branches.filter(b =>
        (b.name || '').toLowerCase().includes(branchSearch.toLowerCase()) ||
        (b.location || '').toLowerCase().includes(branchSearch.toLowerCase())
      )
    : branches

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal top bar */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <img src={logo} alt="StorePro" className="h-9 object-contain" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{orgName}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'user'}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold">
              {firstName[0]?.toUpperCase() || 'U'}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero greeting */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-gray-500 mt-1">Select a branch to get started, or create a new one.</p>
        </div>

        {/* Branch section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Section header */}
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                <Store size={16} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Branches</h2>
                <p className="text-xs text-gray-500">{branches.length} location{branches.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {branches.length > 3 && (
                <div className="relative">
                  <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search branches..."
                    value={branchSearch}
                    onChange={e => setBranchSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 w-48"
                  />
                </div>
              )}
              <button
                onClick={fetchBranches}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
              >
                <Plus size={15} />
                <span className="hidden sm:inline">New Branch</span>
              </button>
            </div>
          </div>

          {/* Branch list */}
          <div className="p-2">
            {loading ? (
              <div className="py-16 text-center">
                <Loader2 size={28} className="animate-spin text-primary-500 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Loading branches...</p>
              </div>
            ) : branches.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Store className="text-gray-400" size={24} />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-1">No branches yet</h3>
                <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto">
                  Create your first store branch to start using the POS system.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg shadow-sm transition-colors"
                >
                  <Plus size={16} />
                  Create Branch
                </button>
              </div>
            ) : filteredBranches.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-400 text-sm">No branches match "{branchSearch}"</p>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {filteredBranches.map((branch) => (
                  <button
                    key={branch.id || branch.uuid}
                    onClick={() => selectBranch(branch)}
                    className="flex items-center gap-3.5 p-4 rounded-xl text-left hover:bg-primary-50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors shrink-0">
                      <Store size={18} className="text-orange-600 group-hover:text-primary-600 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{branch.name}</p>
                      {branch.location && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin size={11} className="shrink-0" /> {branch.location}
                        </p>
                      )}
                    </div>
                    <ArrowRight size={16} className="text-gray-300 group-hover:text-primary-500 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pb-2 text-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} StorePro. All rights reserved.</p>
          <p className="mt-0.5">
            Powered by <span className="font-semibold text-primary-500">Data Leap Technologies INC</span>
          </p>
        </footer>
      </div>

      {/* Create Branch Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowForm(false); setError('') }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Building2 className="text-primary-600" size={18} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">New Branch</h2>
              </div>
              <button
                onClick={() => { setShowForm(false); setError('') }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch Name</label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-sm"
                    placeholder="e.g. Main Branch"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-sm"
                    placeholder="e.g. Accra, Ghana"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError('') }}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 py-2.5 ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-600'} text-white font-semibold rounded-lg shadow-sm transition-colors text-sm flex items-center justify-center gap-2`}
                >
                  {submitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Creating...</>
                  ) : (
                    <><Plus size={16} /> Create</>
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

export default ActivityDashboard
