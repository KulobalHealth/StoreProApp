import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import {
  ShoppingCart, 
  Settings,
  Package,
  Menu,
  X,
  LogOut,
  ArrowLeft,
  Users,
  Truck,
  UserCircle,
  Receipt,
  LayoutDashboard,
  Store,
  ArrowLeftRight,
  Wallet,
  Sparkles,
  Zap
} from 'lucide-react'
import { useNavigationHistory } from '../contexts/NavigationHistory'
import { useAuth } from '../contexts/AuthContext'
import Footer from './Footer'
import AppGuide from './AppGuide'
import logo from '../logo.png'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { canGoBack, getPreviousPath } = useNavigationHistory()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return (user.first_name[0] + user.last_name[0]).toUpperCase()
    }
    if (user?.first_name) return user.first_name[0].toUpperCase()
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return 'U'
  }

  const activeBranch = (() => {
    try {
      const saved = localStorage.getItem('awosel_active_branch')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })()

  const userRole = (user?.role || '').toLowerCase()
  const isManager = userRole === 'manager'
  const isSales = userRole === 'sales'

  const allMenuItems = [
    { path: '/branch-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/pos', icon: ShoppingCart, label: 'POS / Checkout', salesAllowed: true },
    { path: '/sales', icon: Receipt, label: 'Sales History', adminOnly: true },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/customers', icon: UserCircle, label: 'Customers' },
    { path: '/cashiers', icon: Wallet, label: 'Cashiers' },
    { path: '/suppliers', icon: Truck, label: 'Suppliers' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  // Sales users can only see POS
  // Managers cannot access admin-only pages (e.g. Sales History)
  const menuItems = isSales
    ? allMenuItems.filter(item => item.salesAllowed)
    : isManager
      ? allMenuItems.filter(item => !item.adminOnly)
      : allMenuItems

  const isActive = (path) => location.pathname === path

  const handleGoBack = () => {
    const previousPath = getPreviousPath()
    if (previousPath) {
      navigate(previousPath)
    } else {
      // Fallback to POS if no history
      navigate('/pos')
    }
  }

  // Keyboard shortcut for back navigation (Alt+Left Arrow or Backspace)
  useEffect(() => {
    if (!canGoBack) return

    const handleKeyDown = (e) => {
      // Alt+Left Arrow or Backspace (when not in input/textarea)
      if (
        (e.altKey && e.key === 'ArrowLeft') ||
        (e.key === 'Backspace' && 
         e.target.tagName !== 'INPUT' && 
         e.target.tagName !== 'TEXTAREA' &&
         !e.target.isContentEditable)
      ) {
        e.preventDefault()
        const previousPath = getPreviousPath()
        if (previousPath) {
          navigate(previousPath)
        } else {
          navigate('/pos')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canGoBack, getPreviousPath, navigate])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {sidebarOpen ? (
            <img src={logo} alt="Awosel OS" className="h-12 w-40 object-contain" />
          ) : (
            <img src={logo} alt="Awosel OS" className="h-10 w-10 object-contain" />
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Active Branch */}
        {activeBranch && (
          <div className="px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <Store size={16} className="text-primary-600 flex-shrink-0" />
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{activeBranch.name}</p>
                  {activeBranch.location && (
                    <p className="text-xs text-gray-500 truncate">{activeBranch.location}</p>
                  )}
                </div>
              )}
            </div>
            {sidebarOpen && !isManager && !isSales && (
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-2 flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium w-full"
              >
                <ArrowLeftRight size={12} />
                Switch Branch
              </button>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {/* Go Back Button */}
          {canGoBack && (
            <button
              onClick={handleGoBack}
              className="flex items-center px-4 py-3 mx-2 mb-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              <ArrowLeft size={20} className="mr-3" />
              {sidebarOpen && <span>Go Back</span>}
            </button>
          )}
          
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 mx-2 mb-1 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} className="mr-3" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Upgrade Banner */}
        {sidebarOpen ? (
          <div className="mx-3 mb-3 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 p-4 text-white relative overflow-hidden">
            <div className="absolute -top-3 -right-3 w-16 h-16 bg-white/10 rounded-full" />
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white/10 rounded-full" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-yellow-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-white/90">Upgrade</span>
              </div>
              <h4 className="text-sm font-bold leading-tight">StorePro Plus</h4>
              <p className="text-[11px] text-white/70 mt-1 leading-relaxed">Unlock analytics, multi-store & more.</p>
              <button className="mt-3 w-full py-2 bg-white text-primary-600 rounded-lg text-xs font-bold hover:bg-white/90 transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                <Zap size={13} />
                Upgrade Now
              </button>
            </div>
          </div>
        ) : (
          <div className="mx-auto mb-3">
            <button className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white hover:shadow-lg transition-shadow" title="Upgrade to StorePro Plus">
              <Sparkles size={18} className="text-yellow-300" />
            </button>
          </div>
        )}

        {/* User Section */}
        <div className="p-4 border-t">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {getUserInitials()}
            </div>
            {sidebarOpen && (
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'User'}</p>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center text-gray-700 hover:text-red-600 transition-colors text-sm w-full"
          >
            <LogOut size={16} className="mr-2" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col bg-gray-50">
        <div className="flex-1 overflow-auto min-h-0">
          <Outlet />
        </div>
        <Footer />
      </main>

      {/* In-App Feature Guide */}
      <AppGuide userRole={user?.role || 'admin'} />
    </div>
  )
}

export default Layout

