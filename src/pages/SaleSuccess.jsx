import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { HIcon } from '../components/HIcon'
import {
  CheckmarkCircle02Icon,
  DashboardSpeed02Icon,
  ShoppingCart01Icon,
  Package01Icon,
  UserGroupIcon,
  Analytics02Icon,
  ArrowRight01Icon,
  SparklesIcon,
  Rocket01Icon,
} from '@hugeicons/core-free-icons'
import logo from '../MainLogo.jpeg'

const features = [
  {
    icon: ShoppingCart01Icon,
    title: 'Point of Sale',
    desc: 'Fast checkout with barcode scanning, multiple payment methods, and receipts.',
    color: '#FF7521',
    bg: '#fff7ed',
  },
  {
    icon: Package01Icon,
    title: 'Inventory Management',
    desc: 'Track stock levels in real-time, get low-stock alerts, and manage products.',
    color: '#FF7521',
    bg: '#fff7ed',
  },
  {
    icon: UserGroupIcon,
    title: 'Customer & Staff',
    desc: 'Manage customers, staff roles, and supplier relationships in one place.',
    color: '#FF7521',
    bg: '#fff7ed',
  },
  {
    icon: Analytics02Icon,
    title: 'Reports & Insights',
    desc: 'Sales analytics, profit tracking, and business intelligence at your fingertips.',
    color: '#FF7521',
    bg: '#fff7ed',
  },
]

const SaleSuccess = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const userData = location.state
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  const storeName = userData?.storeName || 'your store'
  const firstName = userData?.firstName || ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      {/* Confetti celebration */}
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 10}%`,
                backgroundColor: ['#FF7521', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#f43f5e'][
                  Math.floor(Math.random() * 6)
                ],
                opacity: 0.8,
                animation: `confettiFall ${2 + Math.random() * 3}s ease-in ${Math.random() * 1.5}s forwards`,
              }}
            />
          ))}
          <style>{`
            @keyframes confettiFall {
              0% { transform: translateY(0) rotate(0deg); opacity: 0.9; }
              100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-10">
        {/* Logo */}
        <img src={logo} alt="Microbiz" className="mb-8 h-10 object-contain" />

        {/* Main Card */}
        <div className="w-full overflow-hidden rounded-none bg-white">
          {/* Orange Header */}
          <div
            className="relative overflow-hidden px-8 pb-8 pt-10 text-center"
          >


            <div className="relative">
              <div
                className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full"
                style={{
                  backgroundColor: '#fff7ed',
                }}
              >
                <HIcon icon={CheckmarkCircle02Icon} size={44} style={{ color: '#FF7521' }} />
              </div>

              <h1 className="text-3xl font-extrabold text-gray-900">
                Welcome to Microbiz!
              </h1>

              <p className="mx-auto mt-2 max-w-sm text-base text-gray-500">
                {firstName
                  ? `Congratulations ${firstName}, your account has been created successfully!`
                  : 'Your account has been created successfully!'}
              </p>

              <div
                className="mx-auto mt-4 inline-flex items-center gap-2 rounded-none px-4 py-1.5"
                style={{ backgroundColor: '#fff7ed' }}
              >
                <HIcon icon={SparklesIcon} size={14} style={{ color: '#FF7521' }} />
                <span className="text-sm font-bold text-gray-900">
                  {storeName}
                </span>
              </div>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="px-8 py-6">
            <div className="mb-4 flex items-center gap-2">
              <HIcon icon={Rocket01Icon} size={16} style={{ color: '#FF7521' }} />
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                What you can do
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {features.map((feature) => {
                return (
                  <div
                    key={feature.title}
                    className="flex gap-3 rounded-none p-4"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none"
                      style={{ backgroundColor: feature.bg }}
                    >
                      <HIcon icon={feature.icon} size={20} style={{ color: feature.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900">{feature.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{feature.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Getting Started Steps */}
          <div className="bg-white px-8 py-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
              Get started in 3 steps
            </p>
            <div className="flex flex-col gap-2.5">
              {[
                { step: '1', text: 'Log in with your new credentials' },
                { step: '2', text: 'Add your products and set up inventory' },
                { step: '3', text: 'Start selling with the POS!' },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-3">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-none text-xs font-bold text-white"
                    style={{ backgroundColor: '#FF7521' }}
                  >
                    {item.step}
                  </div>
                  <span className="text-sm text-gray-700">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-8 py-6">
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => navigate('/login')}
                className="flex w-full items-center justify-center gap-2 rounded-none px-4 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#FF7521' }}
              >
                Log In to Your Account
                <HIcon icon={ArrowRight01Icon} size={18} />
              </button>

              <button
                onClick={() => navigate('/branch-dashboard')}
                className="flex w-full items-center justify-center gap-2 rounded-none bg-white px-4 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                <HIcon icon={DashboardSpeed02Icon} size={16} />
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-xs text-gray-400">
          <span>You're all set — welcome aboard!</span>
        </div>
      </div>
    </div>
  )
}

export default SaleSuccess
