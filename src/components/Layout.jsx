import React, { Suspense, useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { HIcon } from './HIcon'
import { useAuth } from '../contexts/AuthContext'
import {
  Analytics02Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  Building01Icon,
  CreditCardIcon,
  DashboardSpeed02Icon,
  DeliveryTruck01Icon,
  HelpCircleIcon,
  Logout01Icon,
  Menu01Icon,
  Notification03Icon,
  Package01Icon,
  ReceiptDollarIcon,
  Settings02Icon,
  ShoppingCart01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'
import sidebarIcon from '../ic.png'
import { listProductsByBranch } from '../api/awoselDb'
import { getSessionBranchId } from '../utils/branch'
import PageLoadingFrame from './PageLoadingFrame'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sessionMenuOpen, setSessionMenuOpen] = useState(false)
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false)
  const [lowStockProducts, setLowStockProducts] = useState([])
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const sessionMenuRef = useRef(null)
  const notificationMenuRef = useRef(null)

  const role = (user?.role || '').toLowerCase()
  const isSales = role === 'sales'
  const isManager = role === 'manager'
  const branchName = user?.branch?.name || user?.branch_name || user?.organization?.branch_name || 'Main Branch'
  const storeName = user?.organization?.name || user?.organization_name || user?.business_name || user?.store_name || 'MicroBiz'
  const fullName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.name || 'User'
  const date = new Intl.DateTimeFormat('en-GB').format(new Date())

  useEffect(() => {
    const close = event => {
      if (sessionMenuRef.current && !sessionMenuRef.current.contains(event.target)) setSessionMenuOpen(false)
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) setNotificationMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const branchId = getSessionBranchId()

  useEffect(() => {
    if (!branchId || isSales) {
      setLowStockProducts([])
      return
    }
    listProductsByBranch(branchId)
      .then(res => {
        const products = Array.isArray(res) ? res : (res?.data || [])
        setLowStockProducts(products.filter(product => {
          const stock = Number(product.quantity ?? product.stock ?? 0)
          const minimum = Number(product.min_stock_quantity ?? product.minStock ?? product.minimum_stock ?? 5)
          return stock <= minimum
        }))
      })
      .catch(() => setLowStockProducts([]))
  }, [branchId, isSales])

  const items = [
    { label: 'Dashboard', icon: DashboardSpeed02Icon, path: '/branch-dashboard', hide: isSales },
    { label: 'Start Selling', icon: ShoppingCart01Icon, path: '/pos' },
    { label: 'Sales', icon: ReceiptDollarIcon, path: isManager ? '/cashiers' : '/sales', hide: isSales },
    { label: 'Reports', icon: Analytics02Icon, path: '/reports', hide: isSales },
    { label: 'Inventory', icon: Package01Icon, path: '/inventory', hide: isSales },
    { label: 'Customers', icon: UserGroupIcon, path: '/customers', hide: isSales },
    { label: 'Suppliers', icon: DeliveryTruck01Icon, path: '/suppliers', hide: isSales },
    { label: 'Staff', icon: UserGroupIcon, path: '/users', hide: isSales },
    { label: 'Settings', icon: Settings02Icon, path: '/settings', hide: isSales },
  ].filter(item => !item.hide)

  const isActive = path => location.pathname === path || (path !== '/branch-dashboard' && location.pathname.startsWith(`${path}/`))

  return (
    <div className="flex h-screen overflow-hidden bg-[#eaf0f7] text-[#34334f]">
      <aside className={`${sidebarOpen ? 'w-[230px]' : 'w-[72px]'} z-50 flex shrink-0 flex-col border-r border-slate-200 bg-white shadow-[2px_0_8px_rgba(32,56,85,0.05)] transition-all duration-200`}>
        <Link to={isSales ? '/pos' : '/branch-dashboard'} className="flex h-[96px] shrink-0 items-center justify-center border-b border-slate-100">
          <img src={sidebarIcon} alt="MicroBiz" className={`${sidebarOpen ? 'h-14 w-20' : 'h-10 w-10'} object-contain`} />
        </Link>
        <nav className="flex-1 overflow-y-auto py-2">
          {items.map(item => (
            <Link key={item.path + item.label} to={item.path} title={!sidebarOpen ? item.label : undefined} className={`flex min-h-[54px] items-center border-b border-slate-100 px-5 text-base transition-colors ${isActive(item.path) ? 'border-l-4 border-l-orange-500 bg-orange-50 text-slate-800' : 'border-l-4 border-l-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}>
              <HIcon icon={item.icon} size={28} className="shrink-0 text-orange-500" />
              {sidebarOpen && <span className="ml-4 truncate font-semibold">{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="shrink-0 border-t border-slate-200 p-3">
          <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-orange-500 text-sm font-bold text-white">{fullName.charAt(0).toUpperCase()}</span>
            {sidebarOpen && <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-700">{fullName}</p><p className="truncate text-xs text-slate-400">{user?.role || 'User'}</p></div>}
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="relative z-50 flex h-[50px] shrink-0 items-center bg-[#FF7521] px-3 text-white shadow-sm">
          <button onClick={() => setSidebarOpen(value => !value)} className="grid h-9 w-9 place-items-center rounded-lg transition-colors hover:bg-white/15" aria-label="Toggle sidebar">
            <HIcon icon={sidebarOpen ? ArrowLeft01Icon : Menu01Icon} size={21} />
          </button>
          <div className="ml-auto flex h-full items-center gap-1 text-xs">
            {!isSales && <button onClick={() => navigate('/dashboard')} className="hidden h-[34px] items-center gap-2 rounded-lg bg-orange-600 px-3 font-semibold text-white shadow-sm hover:bg-orange-700 sm:flex"><HIcon icon={Building01Icon} size={16} /> Create New Branch</button>}
            <button className="hidden h-9 items-center gap-2 rounded-lg px-3 font-semibold hover:bg-white/15 md:flex"><HIcon icon={HelpCircleIcon} size={19} /> Help</button>
            <div className="relative" ref={notificationMenuRef}>
              <button onClick={() => setNotificationMenuOpen(value => !value)} className="relative grid h-9 w-10 place-items-center rounded-lg text-white hover:bg-white/15" aria-label={`Notifications${lowStockProducts.length ? `, ${lowStockProducts.length} unread` : ''}`} title="Notifications" aria-haspopup="menu" aria-expanded={notificationMenuOpen}>
                <HIcon icon={Notification03Icon} size={20} />
                {lowStockProducts.length > 0 && <span className="absolute right-0.5 top-0 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#FF7521] bg-white px-1 text-[9px] font-bold text-orange-600">{lowStockProducts.length > 99 ? '99+' : lowStockProducts.length}</span>}
              </button>
              {notificationMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-[70] w-[340px] overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-700 shadow-xl" role="menu">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div><p className="text-sm font-bold text-slate-800">Notifications</p><p className="text-[11px] text-slate-500">Inventory alerts for {branchName}</p></div>
                    {lowStockProducts.length > 0 && <span className="rounded-full bg-orange-100 px-2 py-1 text-[10px] font-bold text-orange-700">{lowStockProducts.length} LOW</span>}
                  </div>
                  {lowStockProducts.length > 0 ? (
                    <>
                      <div className="max-h-72 overflow-y-auto">
                        {lowStockProducts.slice(0, 8).map((product, index) => {
                          const stock = Number(product.quantity ?? product.stock ?? 0)
                          return <button key={product.uuid || product.id || `${product.name}-${index}`} onClick={() => { setNotificationMenuOpen(false); navigate('/inventory') }} className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left hover:bg-orange-50" role="menuitem"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-orange-50 text-orange-500"><HIcon icon={Package01Icon} size={19} /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-800">{product.name || 'Unnamed product'}</span><span className="mt-0.5 block text-xs text-slate-500">Only {stock} remaining · Restock required</span></span></button>
                        })}
                      </div>
                      <button onClick={() => { setNotificationMenuOpen(false); navigate('/inventory') }} className="flex w-full items-center justify-center gap-2 bg-orange-500 px-4 py-3 text-xs font-bold text-white hover:bg-orange-600">Review Inventory <HIcon icon={ArrowLeft01Icon} size={14} className="rotate-180" /></button>
                    </>
                  ) : (
                    <div className="px-5 py-8 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-emerald-50 text-emerald-600"><HIcon icon={Notification03Icon} size={21} /></span><p className="mt-3 text-sm font-semibold text-slate-700">You’re all caught up</p><p className="mt-1 text-xs text-slate-500">No inventory alerts right now.</p></div>
                  )}
                </div>
              )}
            </div>
            <div className="relative h-full" ref={sessionMenuRef}>
              <button onClick={() => setSessionMenuOpen(value => !value)} className="flex h-full items-center gap-2 border-l border-white/20 px-3 text-left hover:bg-white/10" aria-haspopup="menu" aria-expanded={sessionMenuOpen}>
                <img src={sidebarIcon} alt="" className="h-8 w-8 rounded-lg bg-white object-contain" />
                <span className="hidden leading-tight lg:block"><b className="block max-w-[155px] truncate">{fullName}</b><span className="text-[10px] text-orange-100">{date} · {branchName}</span></span>
                <HIcon icon={ArrowDown01Icon} size={12} className={`hidden transition-transform lg:block ${sessionMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {sessionMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-[70] w-64 overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-700 shadow-xl" role="menu">
                  <div className="border-b border-slate-100 px-4 py-3"><p className="truncate text-sm font-bold">{fullName}</p><p className="mt-0.5 truncate text-xs text-slate-500">{storeName} · {branchName}</p></div>
                  <div className="p-2">
                    {[
                      ['Store Settings', Settings02Icon, '/settings'], ['Billing', CreditCardIcon, '/billing'], ['Switch Branch', Building01Icon, '/dashboard'],
                    ].map(([label, icon, path]) => <button key={label} onClick={() => { setSessionMenuOpen(false); navigate(path) }} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-orange-50 hover:text-orange-600" role="menuitem"><HIcon icon={icon} size={17} className="text-orange-500" />{label}</button>)}
                    <button onClick={() => { setSessionMenuOpen(false); logout(); navigate('/login') }} className="mt-1 flex w-full items-center gap-3 border-t border-slate-100 px-3 py-3 text-sm font-semibold text-red-600 hover:bg-red-50" role="menuitem"><HIcon icon={Logout01Icon} size={17} />Sign Out</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={`min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#eaf0f7] pb-[84px] ${location.pathname === '/sales' || location.pathname === '/inventory' ? '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden' : ''}`}>
          <Suspense fallback={<PageLoadingFrame />}>
            <Outlet />
          </Suspense>
        </main>

          <footer className={`fixed bottom-0 right-0 z-40 border-t-4 border-orange-500 bg-white px-5 py-4 shadow-[0_-4px_18px_rgba(15,23,42,0.1)] transition-[left] duration-200 sm:px-7 ${sidebarOpen ? 'left-[230px]' : 'left-[72px]'}`}>
            <div className="mx-auto flex max-w-[1500px] flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg border border-orange-100 bg-orange-50"><img src={sidebarIcon} alt="MicroBiz" className="h-7 w-7 object-contain" /></span>
                <div><p className="text-sm font-bold text-slate-800">MicroBiz</p><p className="text-[11px] text-slate-500">© {new Date().getFullYear()} · Powered By Data Leap Technologies LLC.</p></div>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-600">
                <button onClick={() => navigate('/privacy')} className="hover:text-orange-500">Privacy Policy</button>
                <button onClick={() => navigate('/terms')} className="hover:text-orange-500">Terms</button>
                <button onClick={() => navigate('/settings')} className="hover:text-orange-500">Settings</button>
                <span className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" />All systems operational</span>
              </div>
            </div>
          </footer>
      </div>
    </div>
  )
}

export default Layout
