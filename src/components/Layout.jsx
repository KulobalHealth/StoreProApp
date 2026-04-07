import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { HIcon } from './HIcon'
import {
  DashboardSpeed02Icon,
  ShoppingCart01Icon,
  UserGroupIcon,
  DeliveryTruck01Icon,
  UserMultipleIcon,
  Settings02Icon,
  Package01Icon,
  CheckListIcon,
  Clock02Icon,
  ReceiptDollarIcon,
  Wallet02Icon,
  Invoice01Icon,
  Analytics02Icon,
  LandmarkIcon,
  CalculatorIcon,
  ArrowLeft01Icon,
  ArrowDown01Icon,
  Cancel01Icon,
  Menu01Icon,
  Add01Icon,
  Search01Icon,
  HelpCircleIcon,
  Notification03Icon,
  Building01Icon,
  CreditCardIcon,
  Logout01Icon,
  MagicWand01Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons'
import { useNavigationHistory } from '../contexts/NavigationHistory'
import { useAuth } from '../contexts/AuthContext'
import Footer from './Footer'
import AppGuide from './AppGuide'
import logo from '../MainLogo.jpeg'
import sidebarIcon from '../ic.png'
import Tooltip from './Tooltip'

const MOBILE_APP_URL = 'https://www.youtube.com/watch?v=jU7CCUwY-Do'
const STORE_LOGO_DRAFT_KEY = 'awosel_store_logo_draft'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [accountingOpen, setAccountingOpen] = useState(false)
  const [inventoryOpen, setInventoryOpen] = useState(false)
  const [storeMenuOpen, setStoreMenuOpen] = useState(false)
  const [storeLogo, setStoreLogo] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const { canGoBack, getPreviousPath } = useNavigationHistory()
  const { user, logout } = useAuth()
  const storeMenuRef = useRef(null)

  const storeName =
    user?.organization?.name ||
    user?.organization_name ||
    user?.business_name ||
    user?.store_name ||
    'StorePro'

  const branchName =
    user?.branch?.name ||
    user?.branch_name ||
    user?.organization?.branch_name ||
    'Main Branch'

  const roleLabel = (user?.role || 'User').toLowerCase()
  const showGlobalHeader = location.pathname !== '/pos'
  const showAppGuide = location.pathname !== '/pos'

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

  const userRole = (user?.role || '').toLowerCase()
  const isManager = userRole === 'manager'
  const isSales = userRole === 'sales'

  const isActive = (path) => location.pathname === path

  const filterMenuItemsByRole = (items) => {
    if (isSales) return items.filter(item => item.salesAllowed)
    if (isManager) return items.filter(item => !item.adminOnly)
    return items
  }

  const allMenuItems = [
    { path: '/branch-dashboard', icon: DashboardSpeed02Icon, label: 'Dashboard' },
    { path: '/pos', icon: ShoppingCart01Icon, label: 'POS / Checkout', salesAllowed: true },
    { path: '/customers', icon: UserGroupIcon, label: 'Customers' },
    { path: '/suppliers', icon: DeliveryTruck01Icon, label: 'Suppliers' },
    { path: '/users', icon: UserMultipleIcon, label: 'Users' },
    { path: '/settings', icon: Settings02Icon, label: 'Settings' },
  ]

  const inventoryMenuItems = [
    { path: '/inventory', icon: Package01Icon, label: 'Inventory' },
    { path: '/receive-items', icon: CheckListIcon, label: 'Receive Items' },
    { path: '/receive-history', icon: Clock02Icon, label: 'Receive History' },
  ]

  const accountingMenuItems = [
    { path: '/sales', icon: ReceiptDollarIcon, label: 'Sales History', adminOnly: true },
    { path: '/cashiers', icon: Wallet02Icon, label: 'Cashiers' },
    { path: '/invoices', icon: Invoice01Icon, label: 'Invoicing', disabled: true, badge: 'Coming Soon' },
    { path: '/reports', icon: Analytics02Icon, label: 'Reports', disabled: true, badge: 'Coming Soon' },
    { path: '/cheque-management', icon: LandmarkIcon, label: 'Cheque Management', disabled: true, badge: 'Coming Soon' },
  ]

  // Sales users can only see POS
  // Managers cannot access admin-only pages (e.g. Sales History)
  const menuItems = filterMenuItemsByRole(allMenuItems)
  const visibleInventoryItems = filterMenuItemsByRole(inventoryMenuItems)
  const visibleAccountingItems = filterMenuItemsByRole(accountingMenuItems)
  const isInventoryActive = visibleInventoryItems.some((item) => {
    const [itemPath] = item.path.split('?')
    return location.pathname === itemPath || location.pathname.startsWith(`${itemPath}/`)
  })
  const isAccountingActive = visibleAccountingItems.some(item => !item.disabled && isActive(item.path))
  const inventoryInsertIndex = menuItems.findIndex(item => item.path === '/customers')
  const menuItemsBeforeInventory = inventoryInsertIndex >= 0 ? menuItems.slice(0, inventoryInsertIndex) : menuItems
  const menuItemsAfterInventory = inventoryInsertIndex >= 0 ? menuItems.slice(inventoryInsertIndex) : []
  const accountingInsertIndex = menuItemsAfterInventory.findIndex(item => item.path === '/customers')
  const menuItemsBeforeAccounting = accountingInsertIndex >= 0 ? menuItemsAfterInventory.slice(0, accountingInsertIndex) : menuItemsAfterInventory
  const menuItemsAfterAccounting = accountingInsertIndex >= 0 ? menuItemsAfterInventory.slice(accountingInsertIndex) : []

  useEffect(() => {
    if (isInventoryActive) {
      setInventoryOpen(true)
    }
  }, [isInventoryActive])

  useEffect(() => {
    if (isAccountingActive) {
      setAccountingOpen(true)
    }
  }, [isAccountingActive])

  useEffect(() => {
    const readStoredLogo = () => {
      try {
        setStoreLogo(localStorage.getItem(STORE_LOGO_DRAFT_KEY) || '')
      } catch {
        setStoreLogo('')
      }
    }

    readStoredLogo()

    const handleStorage = (event) => {
      if (event.key === STORE_LOGO_DRAFT_KEY) {
        readStoredLogo()
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (storeMenuRef.current && !storeMenuRef.current.contains(event.target)) {
        setStoreMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
    <div className="app-shell flex h-screen">
      <style>{`
        .sidebar-scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .sidebar-scrollbar-hidden::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col overflow-hidden`}>
        {/* Logo */}
        <div className={`border-b ${sidebarOpen ? 'flex h-16 items-center justify-between gap-3 px-3' : 'flex flex-col items-center justify-center gap-2 px-2 py-3'}`}>
          {sidebarOpen ? (
            <img src={logo} alt="StorePro" className="h-12 w-40 object-contain" />
          ) : (
            <img src={sidebarIcon} alt="StorePro icon" className="h-10 w-10 rounded-[2px] object-contain" />
          )}
          <Tooltip text={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'} position="right">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex-shrink-0 rounded-lg p-2 hover:bg-gray-100"
            >
              {sidebarOpen ? <HIcon icon={Cancel01Icon} size={20} /> : <HIcon icon={Menu01Icon} size={20} />}
            </button>
          </Tooltip>
        </div>

        {/* Navigation */}
        <nav className="sidebar-scrollbar-hidden flex-1 min-h-0 overflow-y-auto py-4">
          {/* Go Back Button */}
          {canGoBack && (
            <Tooltip text="Go to previous page" position="right">
              <button
                onClick={handleGoBack}
                className="flex items-center px-4 py-3 mx-2 mb-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <HIcon icon={ArrowLeft01Icon} size={18} className="mr-3 w-5 text-center" />
                {sidebarOpen && <span>Go Back</span>}
              </button>
            </Tooltip>
          )}
          
          {menuItemsBeforeInventory.map((item) => (
              <Tooltip key={item.path} text={!sidebarOpen ? item.label : ''} position="right">
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 mx-2 mb-1 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <HIcon icon={item.icon} size={18} className="mr-3 w-5 text-center" />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              </Tooltip>
          ))}

          {visibleInventoryItems.length > 0 && (
            <div className="mx-2 mt-2">
              <Tooltip text={!sidebarOpen ? 'Inventory' : ''} position="right">
                <button
                  type="button"
                  onClick={() => setInventoryOpen(prev => !prev)}
                  className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                    isInventoryActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <HIcon icon={Package01Icon} size={18} className="mr-3 w-5 text-center shrink-0" />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left">Inventory</span>
                      <HIcon
                        icon={ArrowDown01Icon}
                        size={14}
                        className={`transition-transform ${inventoryOpen ? 'rotate-180' : ''}`}
                      />
                    </>
                  )}
                </button>
              </Tooltip>

              {inventoryOpen && (
                <div className="mt-1 space-y-1">
                  {visibleInventoryItems.map((item) => {
                    const [itemPath] = item.path.split('?')
                    const itemIsActive = location.pathname === itemPath || location.pathname.startsWith(`${itemPath}/`)
                    return (
                      <Tooltip key={item.path} text={!sidebarOpen ? item.label : ''} position="right">
                        <Link
                          to={item.path}
                          className={`flex items-center rounded-lg transition-colors ${
                            sidebarOpen ? 'ml-4 px-4 py-2.5' : 'px-4 py-3'
                          } ${
                            itemIsActive
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700'
                          }`}
                        >
                          <HIcon icon={item.icon} size={16} className="mr-3 w-5 text-center shrink-0" />
                          {sidebarOpen && <span className="text-sm">{item.label}</span>}
                        </Link>
                      </Tooltip>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {visibleAccountingItems.length > 0 && (
            <div className="mx-2 mt-2">
              <Tooltip text={!sidebarOpen ? 'Accounting' : ''} position="right">
                <button
                  type="button"
                  onClick={() => setAccountingOpen(prev => !prev)}
                  className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                    isAccountingActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <HIcon icon={CalculatorIcon} size={18} className="mr-3 w-5 text-center shrink-0" />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left">Accounting</span>
                      <HIcon
                        icon={ArrowDown01Icon}
                        size={14}
                        className={`transition-transform ${accountingOpen ? 'rotate-180' : ''}`}
                      />
                    </>
                  )}
                </button>
              </Tooltip>

              {accountingOpen && (
                <div className="mt-1 space-y-1">
                  {visibleAccountingItems.map((item) => {
                    const itemTooltip = !sidebarOpen
                      ? `${item.label}${item.badge ? ` • ${item.badge}` : ''}`
                      : ''
                    const sharedClasses = `flex items-center rounded-lg ${
                      sidebarOpen ? 'ml-4 px-4 py-2.5' : 'px-4 py-3'
                    }`
                    return (
                      <Tooltip key={item.path} text={itemTooltip} position="right">
                        {item.disabled ? (
                          <div
                            className={`${sharedClasses} cursor-not-allowed text-gray-400 bg-gray-50/80 border border-dashed border-gray-200`}
                            aria-disabled="true"
                          >
                            <HIcon icon={item.icon} size={16} className="mr-3 w-5 text-center shrink-0" />
                            {sidebarOpen && (
                              <>
                                <span className="text-sm flex-1">{item.label}</span>
                                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                                  {item.badge}
                                </span>
                              </>
                            )}
                          </div>
                        ) : (
                          <Link
                            to={item.path}
                            className={`${sharedClasses} transition-colors ${
                              isActive(item.path)
                                ? 'bg-primary-50 text-primary-700'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700'
                            }`}
                          >
                            <HIcon icon={item.icon} size={16} className="mr-3 w-5 text-center shrink-0" />
                            {sidebarOpen && <span className="text-sm">{item.label}</span>}
                          </Link>
                        )}
                      </Tooltip>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {menuItemsAfterAccounting.map((item) => (
              <Tooltip key={item.path} text={!sidebarOpen ? item.label : ''} position="right">
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 mx-2 mb-1 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <HIcon icon={item.icon} size={18} className="mr-3 w-5 text-center" />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              </Tooltip>
          ))}
        </nav>

        <div className="shrink-0 border-t border-gray-100 bg-white/95 backdrop-blur-sm">
          {/* Upgrade Banner */}
          {sidebarOpen ? (
            <div className="mx-3 mt-3 mb-3 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 p-4 text-white relative overflow-hidden shadow-sm">
              <div className="absolute -top-3 -right-3 w-16 h-16 bg-white/10 rounded-full" />
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white/10 rounded-full" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <HIcon icon={MagicWand01Icon} size={14} className="text-yellow-300" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white/90">Mobile App</span>
                </div>
                <h4 className="text-sm font-bold leading-tight">Get the Microbiz App</h4>
                <p className="text-[11px] text-white/70 mt-1 leading-relaxed">Watch the quick install guide for mobile.</p>
                <a
                  href={MOBILE_APP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 w-full py-2 bg-white text-primary-600 rounded-lg text-xs font-bold hover:bg-white/90 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <HIcon icon={SparklesIcon} size={12} />
                  Download Mobile App
                </a>
              </div>
            </div>
          ) : (
            <div className="mx-auto mt-3 mb-3">
              <Tooltip text="Download Mobile App" position="right">
                <a
                  href={MOBILE_APP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white hover:shadow-lg transition-shadow"
                >
                  <HIcon icon={MagicWand01Icon} size={16} className="text-yellow-300" />
                </a>
              </Tooltip>
            </div>
          )}

          {/* User Section */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {getUserInitials()}
              </div>
              {sidebarOpen && (
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.role || 'User'}</p>
                </div>
              )}
            </div>
            <Tooltip text="Sign out of your account" position="right">
              <button 
                onClick={handleLogout}
                className="flex items-center text-gray-700 hover:text-red-600 transition-colors text-sm w-full"
              >
                <HIcon icon={Logout01Icon} size={16} className="mr-2" />
                {sidebarOpen && <span>Logout</span>}
              </button>
            </Tooltip>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-auto bg-surface-page">
        {showGlobalHeader && (
          <div className="app-page-header relative z-50 shrink-0 overflow-visible px-6 py-2">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="hidden xl:block"></div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="flex items-center gap-2">
                  <button type="button" className="rounded-control p-1.5 transition-colors hover:bg-gray-100" title="Add">
                    <HIcon icon={Add01Icon} size={18} className="text-gray-700" />
                  </button>
                  <button type="button" className="rounded-control p-1.5 transition-colors hover:bg-gray-100" title="Search">
                    <HIcon icon={Search01Icon} size={18} className="text-gray-700" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/settings')}
                    className="rounded-control p-1.5 transition-colors hover:bg-gray-100"
                    title="Settings"
                  >
                    <HIcon icon={Settings02Icon} size={16} className="text-gray-700" />
                  </button>
                  <button type="button" className="rounded-control p-1.5 transition-colors hover:bg-gray-100" title="Help">
                    <HIcon icon={HelpCircleIcon} size={16} className="text-gray-700" />
                  </button>
                  <button type="button" className="relative rounded-control p-1.5 transition-colors hover:bg-gray-100" title="Notifications">
                    <HIcon icon={Notification03Icon} size={16} className="text-gray-700" />
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
                  </button>
                </div>

                <div className="hidden h-6 w-px bg-gray-300 lg:block"></div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative z-50" ref={storeMenuRef}>
                    <button
                      type="button"
                      onClick={() => setStoreMenuOpen((previous) => !previous)}
                      className="flex min-w-[210px] items-center gap-2.5 rounded-panel border border-gray-200 bg-white px-3 py-1.5 text-left shadow-soft transition-colors hover:bg-gray-50"
                      aria-haspopup="menu"
                      aria-expanded={storeMenuOpen}
                    >
                      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 shadow-sm">
                        {storeLogo ? (
                          <img src={storeLogo} alt="Business logo" className="h-full w-full object-contain" />
                        ) : (
                          <HIcon icon={Building01Icon} size={14} className="text-gray-500" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-gray-900">{storeName}</span>
                        <span className="block truncate text-xs text-gray-500">{branchName} · {roleLabel}</span>
                      </div>

                      <HIcon
                        icon={ArrowDown01Icon}
                        size={12}
                        className={`shrink-0 text-gray-500 transition-transform ${storeMenuOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {storeMenuOpen && (
                      <div className="absolute right-0 top-[calc(100%+0.5rem)] z-[80] w-64 overflow-hidden rounded-[2px] border border-gray-200 bg-white shadow-xl" role="menu">
                        <div className="border-b border-gray-100 px-4 py-3">
                          <p className="truncate text-sm font-semibold text-gray-900">{storeName}</p>
                          <p className="truncate text-xs text-gray-500">{branchName} · {roleLabel}</p>
                        </div>

                        <div className="p-2">
                          <button
                            type="button"
                            onClick={() => {
                              setStoreMenuOpen(false)
                              navigate('/settings')
                            }}
                            className="flex w-full items-center gap-2.5 rounded-control px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                            role="menuitem"
                          >
                            <HIcon icon={Settings02Icon} size={16} className="w-4 text-center text-gray-400" />
                            Store Settings
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setStoreMenuOpen(false)
                              navigate('/billing')
                            }}
                            className="flex w-full items-center gap-2.5 rounded-control px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                            role="menuitem"
                          >
                            <HIcon icon={CreditCardIcon} size={16} className="w-4 text-center text-gray-400" />
                            Billing
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setStoreMenuOpen(false)
                              navigate('/dashboard')
                            }}
                            className="flex w-full items-center gap-2.5 rounded-control px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                            role="menuitem"
                          >
                            <HIcon icon={Building01Icon} size={16} className="w-4 text-center text-gray-400" />
                            Switch Branch
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setStoreMenuOpen(false)
                              handleLogout()
                            }}
                            className="flex w-full items-center gap-2.5 rounded-control px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                            role="menuitem"
                          >
                            <HIcon icon={Logout01Icon} size={16} className="w-4 text-center" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="relative z-0 flex-1 overflow-auto min-h-0">
          <Outlet />
        </div>
        <Footer />
      </main>

      {/* In-App Feature Guide */}
      {showAppGuide && <AppGuide userRole={user?.role || 'admin'} />}
    </div>
  )
}

export default Layout

