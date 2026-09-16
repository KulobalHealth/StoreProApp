import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { HIcon } from '../components/HIcon'
import inventoryDashboardImage from '../Mockups/inventory-dashboard-transparent.png'
import posSessionDashboardImage from '../Mockups/pos-session-dashboard.jpg'
import startSellingDashboardImage from '../Mockups/start-selling-dashboard.jpg'
import customersDashboardImage from '../Mockups/customers-dashboard.png'
import suppliersDashboardImage from '../Mockups/suppliers-dashboard.avif'
import taxReportsDashboardImage from '../Mockups/tax-reports-dashboard.webp'
import { Building01Icon } from '@hugeicons/core-free-icons'

const BranchDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [branch, setBranch] = useState(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('awosel_active_branch')
      if (!saved) return navigate('/dashboard')
      setBranch(JSON.parse(saved))
    } catch {
      navigate('/dashboard')
    }
  }, [navigate])

  if (!branch) return null

  const firstName = user?.first_name || user?.name?.split(' ')[0] || 'User'
  const date = new Intl.DateTimeFormat('en-GB').format(new Date())
  const canViewSales = (user?.role || '').toLowerCase() !== 'manager'
  const actions = [
    { label: 'Start Selling', image: startSellingDashboardImage, imageLarge: true, path: '/pos' },
    { label: 'POS Sessions', image: posSessionDashboardImage, path: canViewSales ? '/sales' : '/cashiers' },
    { label: 'Inventory', image: inventoryDashboardImage, path: '/inventory' },
    { label: 'Customers', image: customersDashboardImage, path: '/customers' },
    { label: 'Suppliers', image: suppliersDashboardImage, imageLarge: true, path: '/suppliers' },
    { label: 'Tax & Reports', image: taxReportsDashboardImage, path: '/reports' },
  ]

  return (
    <div className="min-h-full bg-[#eaf0f7]">
      <main className="mx-auto w-full max-w-[1500px] p-5 sm:p-7 lg:p-8">
        <section className="mb-8 flex items-start justify-between pt-4">
          <div><p className="mb-1 text-sm text-[#8589a6]">{date}</p><h1 className="text-2xl font-bold tracking-tight text-[#3c3a67] sm:text-[29px]">Hi {firstName}, Welcome Back!</h1></div>
          <button onClick={() => navigate('/dashboard')} className="hidden items-center gap-3 rounded-lg border border-orange-600 bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-orange-600 md:flex"><HIcon icon={Building01Icon} size={16} /> Create New Branch</button>
        </section>

        <section className="mx-auto mb-8 grid w-full max-w-[1380px] grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map(action => <button key={action.label} onClick={() => navigate(action.path)} className="group flex min-h-[285px] flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-10 py-12 shadow-[0_5px_16px_rgba(44,65,94,0.11)] transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg"><span className={action.imageLarge ? 'grid h-32 w-40 place-items-center' : action.image ? 'grid h-28 w-28 place-items-center' : 'grid h-20 w-20 place-items-center'}>{action.image ? <img src={action.image} alt="" className={action.imageLarge ? 'h-32 w-40 object-contain transition-transform group-hover:scale-110' : 'h-28 w-28 object-contain transition-transform group-hover:scale-110'} /> : <HIcon icon={action.icon} size={48} className="text-orange-500 transition-transform group-hover:scale-110" />}</span><span className={action.imageLarge ? 'mt-3 text-lg font-semibold text-slate-700' : action.image ? 'mt-5 text-lg font-semibold text-slate-700' : 'mt-7 text-lg font-semibold text-slate-700'}>{action.label}</span></button>)}
        </section>
      </main>

    </div>
  )
}

export default BranchDashboard
