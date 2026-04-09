import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { listBranches, createBranch } from '../api/awoselDb'
import logo from '../MainLogo.jpeg'
import { HIcon } from '../components/HIcon'
import {
  Store01Icon, Add01Icon, MapPinIcon, Building01Icon, Cancel01Icon,
  Logout01Icon, Loading03Icon, ArrowRight01Icon, Search01Icon, RefreshIcon,
} from '@hugeicons/core-free-icons'

const STORE_TYPE_OPTIONS = [
  { value: 'retail', label: 'Retail' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'warehouse', label: 'Warehouse' },
]

const STORE_LOGO_DRAFT_KEY = 'awosel_store_logo_draft'
const BRANCH_CACHE_KEY = 'awosel_branches_cache'
const BRANCHES_UPDATED_EVENT = 'awosel:branches-updated'

const normalizeBranch = (branch) => ({
  ...branch,
  uuid: branch.uuid || branch.id || branch.branch_id || branch.branchId,
  id: branch.id || branch.uuid || branch.branch_id || branch.branchId,
  name: branch.name || branch.branchName || branch.branch_name || 'Unnamed Store',
  location: branch.location || branch.address || branch.branch_location || '',
  store_type: branch.store_type || branch.storeType || branch.type || '',
  logo: branch.logo || branch.logo_url || branch.image || branch.image_url || '',
})

const publishBranchUpdates = (branchList) => {
  localStorage.setItem(BRANCH_CACHE_KEY, JSON.stringify(branchList))
  window.dispatchEvent(new CustomEvent(BRANCHES_UPDATED_EVENT, {
    detail: { branches: branchList },
  }))
}

const ActivityDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', location: '', storeType: '' })
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
      const rawList = res?.data?.branches || res?.branches || res?.data || res || []
      const nextBranches = (Array.isArray(rawList) ? rawList : []).map(normalizeBranch)
      setBranches(nextBranches)
      publishBranchUpdates(nextBranches)
    } catch (err) {
      console.error('Failed to load branches:', err)
      try {
        const cached = JSON.parse(localStorage.getItem(BRANCH_CACHE_KEY) || '[]')
        setBranches(Array.isArray(cached) ? cached.map(normalizeBranch) : [])
      } catch {
        setBranches([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Branch name is required'); return }
    if (!form.location.trim()) { setError('Location is required'); return }
    if (!form.storeType) { setError('Store type is required'); return }
    try {
      setSubmitting(true)
      const createResponse = await createBranch({
        branchName: form.name.trim(),
        location: form.location.trim(),
        store_type: form.storeType,
        organization_id: user?.organization_id,
      })

      const createdBranchRaw = createResponse?.data?.branch || createResponse?.branch || createResponse?.data || createResponse
      const createdBranch = createdBranchRaw ? normalizeBranch(createdBranchRaw) : null

      if (createdBranch?.id || createdBranch?.uuid) {
        setBranches((previousBranches) => {
          const nextBranches = [
            createdBranch,
            ...previousBranches.filter((branch) => String(branch.id || branch.uuid) !== String(createdBranch.id || createdBranch.uuid)),
          ]
          publishBranchUpdates(nextBranches)
          return nextBranches
        })
      }

      setForm({ name: '', location: '', storeType: '' })
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
    <div className="min-h-full bg-gray-50">
      {/* Minimal top bar */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          <img src={logo} alt="StorePro" className="h-16 object-contain" />
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
              <HIcon icon={Logout01Icon} size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 py-8">
        {/* Hero greeting */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-gray-500 mt-1">Select a branch to get started, or create a new one.</p>
        </div>

        {/* Branch section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Section header */}
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                <HIcon icon={Store01Icon} size={16} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Branches</h2>
                <p className="text-xs text-gray-500">{branches.length} location{branches.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {branches.length > 3 && (
                <div className="relative">
                  <HIcon icon={Search01Icon} size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
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
                <HIcon icon={RefreshIcon} size={16} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
              >
                <HIcon icon={Add01Icon} size={15} />
                <span className="hidden sm:inline">New Branch</span>
              </button>
            </div>
          </div>

          {/* Branch list */}
          <div className="p-2">
            {loading ? (
              <div className="py-16 text-center">
                <HIcon icon={Loading03Icon} size={28} className="animate-spin text-primary-500 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading branches...</p>
              </div>
            ) : branches.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <HIcon icon={Store01Icon} className="text-gray-400" size={24} />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-1">No branches yet</h3>
                <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto">
                  Create your first store branch to start using the POS system.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg shadow-sm transition-colors"
                >
                  <HIcon icon={Add01Icon} size={16} />
                  Create Branch
                </button>
              </div>
            ) : filteredBranches.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-500 text-sm">No branches match "{branchSearch}"</p>
              </div>
            ) : (
              <div className="flex justify-center px-3 py-4">
                <div className="grid w-full max-w-5xl justify-center gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredBranches.map((branch) => {
                  const branchLogo = branch.logo || localStorage.getItem(STORE_LOGO_DRAFT_KEY) || ''
                  return (
                    <button
                      key={branch.id || branch.uuid}
                      onClick={() => selectBranch(branch)}
                      className="group aspect-square w-full max-w-[240px] rounded-[3px] border border-gray-200 bg-white p-5 text-center shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50/50 hover:shadow-md"
                    >
                      <div className="flex h-full flex-col items-center justify-center">
                        {/* Logo / Icon */}
                        <div className="w-14 h-14 rounded-[3px] shrink-0 flex items-center justify-center overflow-hidden bg-primary-50 group-hover:bg-primary-100 transition-colors">
                          {branchLogo ? (
                            <img src={branchLogo} alt={branch.name} className="w-full h-full object-cover" />
                          ) : (
                            <HIcon icon={Store01Icon} size={22} className="text-primary-500" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="mt-4 flex flex-col items-center">
                          <p className="text-sm font-semibold text-gray-900 text-center line-clamp-2">{branch.name}</p>
                          {branch.location && (
                            <p className="text-xs text-gray-400 flex items-center justify-center gap-0.5 mt-1.5 text-center line-clamp-1">
                              <HIcon icon={MapPinIcon} size={11} className="shrink-0" />
                              {branch.location}
                            </p>
                          )}
                          {(branch.store_type || branch.storeType) && (
                            <span className="mt-2.5 text-[10px] font-semibold uppercase tracking-wide text-primary-600 bg-primary-50 px-2 py-0.5 rounded-[2px]">
                              {branch.store_type || branch.storeType}
                            </span>
                          )}
                        </div>

                        {/* Arrow */}
                        <div className="mt-auto pt-4 flex items-center justify-center text-xs font-medium text-gray-300 group-hover:text-primary-500 transition-colors">
                          <span>Open</span>
                          <HIcon icon={ArrowRight01Icon} size={14} className="ml-1" />
                        </div>
                      </div>
                    </button>
                  )
                })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pb-2 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} StorePro. All rights reserved.</p>
          <p className="mt-0.5">
            Powered by <span className="font-semibold text-primary-500">Data Leap Technologies INC</span>
          </p>
        </footer>
      </div>

      {/* Create Branch Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50 p-4" onClick={() => { setShowForm(false); setError('') }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-[fadeUp_0.2s_ease-out]" onClick={e => e.stopPropagation()}>
            {/* Accent top strip */}
            <div className="h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />

            {/* Header — compact */}
            <div className="px-6 pt-5 pb-1 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">New Branch</h2>
              <button
                onClick={() => { setShowForm(false); setError('') }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
              >
                <HIcon icon={Cancel01Icon} size={18} />
              </button>
            </div>
            <p className="px-6 text-xs text-gray-400 mb-4">Add a store location to your organisation.</p>

            {/* Form */}
            <form onSubmit={handleCreate} className="px-6 pb-6 space-y-3.5">
              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
              )}

              {/* Branch Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Branch Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-shadow"
                  placeholder="e.g. Main Branch"
                  autoFocus
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-shadow"
                  placeholder="e.g. Accra, Ghana"
                />
              </div>

              {/* Store Type — pill selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Store Type</label>
                <div className="flex gap-2">
                  {STORE_TYPE_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setForm({ ...form, storeType: opt.value })}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        form.storeType === opt.value
                          ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-primary-300 hover:text-primary-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError('') }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 border border-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 ${
                    submitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-primary-500 hover:bg-primary-600 text-white active:scale-[0.98]'
                  }`}
                >
                  {submitting ? (
                    <><HIcon icon={Loading03Icon} size={15} className="animate-spin" /> Creating…</>
                  ) : (
                    'Create Branch'
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
