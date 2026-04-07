import React, { useState, useEffect } from 'react'
import { HIcon } from './HIcon'
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  BookOpenIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  DashboardSpeed02Icon,
  DeliveryTruck01Icon,
  HelpCircleIcon,
  KeyboardIcon,
  BulbIcon,
  Package01Icon,
  ReceiptTextIcon,
  Settings02Icon,
  ShoppingCart01Icon,
  StarIcon,
  UserCircleIcon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'

const GUIDE_DISMISSED_KEY = 'awosel_guide_dismissed'
const GUIDE_VERSION = '1' // bump to re-show after major updates

/**
 * Full feature guide content — sections are filtered by role at render time.
 */
const guideContent = [
  {
    id: 'welcome',
    title: 'Welcome to StorePro',
    icon: StarIcon,
    color: 'bg-primary-500',
    forRoles: ['admin', 'manager', 'sales'],
    content: (
      <>
        <p className="text-gray-600 leading-relaxed">
          StorePro is your all-in-one Point of Sale and store management platform.
          This quick guide will walk you through the key features so you can get
          started right away.
        </p>
        <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-100">
          <p className="text-primary-700 text-sm font-medium flex items-center gap-2">
            <HIcon icon={BulbIcon} size={16}  /> Use the arrows below to navigate through the guide.
          </p>
        </div>
      </>
    ),
  },
  {
    id: 'dashboard',
    title: 'Branch Dashboard',
    icon: DashboardSpeed02Icon,
    color: 'bg-gray-900',
    forRoles: ['admin', 'manager'],
    content: (
      <>
        <p className="text-gray-600 leading-relaxed">
          Your dashboard gives you a real-time overview of today's performance at
          a glance — revenue, transactions, profit, and more.
        </p>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> View today's sales, revenue & profit</li>
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> See inventory alerts & low-stock items</li>
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Quick-action buttons to jump to any section</li>
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Payment breakdown by method (Cash, MoMo, etc.)</li>
        </ul>
      </>
    ),
  },
  {
    id: 'pos',
    title: 'POS / Checkout',
    icon: ShoppingCart01Icon,
    color: 'bg-primary-500',
    forRoles: ['admin', 'manager', 'sales'],
    content: (
      <>
        <p className="text-gray-600 leading-relaxed">
          The POS screen is where you process sales. Search or scan products,
          build a cart, apply discounts, and complete payment.
        </p>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Search products by name, SKU, or barcode</li>
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Choose unit sizes (piece, pack, carton, etc.)</li>
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Apply per-item or cart-wide discounts</li>
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Pay by Cash, Card, or Mobile Money</li>
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Hold a sale and recall it later</li>
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Print or preview receipts after checkout</li>
        </ul>
        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
          <p className="text-amber-700 text-sm font-medium flex items-center gap-2">
            <HIcon icon={KeyboardIcon} size={16}  /> Tip: Press <kbd className="px-1.5 py-0.5 bg-amber-100 rounded text-xs font-mono">Enter</kbd> in the search bar to quickly add the first matching product.
          </p>
        </div>
      </>
    ),
  },
  {
    id: 'sales-history',
    title: 'Sales History',
    icon: ReceiptTextIcon,
    color: 'bg-gray-900',
    forRoles: ['admin'],
    content: (
      <>
        <p className="text-gray-600 leading-relaxed">
          Review all past transactions with powerful filtering. Track revenue,
          profit margins, and payment method breakdowns.
        </p>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Filter by date, month, year, or view all</li>
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Search by receipt number or customer name</li>
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Click any sale to view full line-item details</li>
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Export to CSV for accounting or analysis</li>
        </ul>
      </>
    ),
  },
  {
    id: 'inventory',
    title: 'Inventory Management',
    icon: Package01Icon,
    color: 'bg-primary-500',
    forRoles: ['admin', 'manager'],
    content: (
      <>
        <p className="text-gray-600 leading-relaxed">
          Manage your entire product catalog. Add new products, track stock
          levels, set reorder points, and monitor low-stock items.
        </p>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Add single products or bulk import via Excel</li>
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Set selling price, cost price & min stock level</li>
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Manage unit types (piece, pack, carton, kg…)</li>
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Low-stock alerts shown on the dashboard</li>
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Review product availability and restock needs quickly</li>
        </ul>
      </>
    ),
  },
  {
    id: 'customers',
    title: 'Customer Management',
    icon: UserCircleIcon,
    color: 'bg-gray-900',
    forRoles: ['admin', 'manager'],
    content: (
      <>
        <p className="text-gray-600 leading-relaxed">
          Build a customer database for your store. Link customers to sales for
          better tracking and relationship management.
        </p>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Add customers with name, phone & email</li>
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Link a customer at checkout in POS</li>
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Track customer balances & owing amounts</li>
        </ul>
      </>
    ),
  },
  {
    id: 'suppliers',
    title: 'Supplier Management',
    icon: DeliveryTruck01Icon,
    color: 'bg-primary-500',
    forRoles: ['admin', 'manager'],
    content: (
      <>
        <p className="text-gray-600 leading-relaxed">
          Keep track of your suppliers, manage debts, and record payments.
        </p>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Add supplier contact details & notes</li>
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Track outstanding debts per supplier</li>
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Record debt payments with history</li>
        </ul>
      </>
    ),
  },
  {
    id: 'users',
    title: 'User & Staff Management',
    icon: UserGroupIcon,
    color: 'bg-gray-900',
    forRoles: ['admin', 'manager'],
    content: (
      <>
        <p className="text-gray-600 leading-relaxed">
          Manage team members, assign roles, and control what each person can
          access.
        </p>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> <strong>Admin</strong> — full access to everything</li>
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> <strong>Manager</strong> — branch-level access, no sales history</li>
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> <strong>Sales</strong> — POS only, focused on checkout</li>
        </ul>
      </>
    ),
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings02Icon,
    color: 'bg-primary-500',
    forRoles: ['admin', 'manager'],
    content: (
      <>
        <p className="text-gray-600 leading-relaxed">
          Configure your store preferences — receipt layout, tax rates, and more.
        </p>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Set store name, address & contact info</li>
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Configure tax rate (applied at POS)</li>
          <li className="flex items-start gap-2"><HIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-500 mt-0.5 shrink-0"  /> Customise receipt header & footer</li>
        </ul>
      </>
    ),
  },
  {
    id: 'tips',
    title: 'Pro Tips & Shortcuts',
    icon: BulbIcon,
    color: 'bg-gray-900',
    forRoles: ['admin', 'manager', 'sales'],
    content: (
      <>
        <p className="text-gray-600 leading-relaxed mb-3">
          A few tricks to help you work faster:
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <HIcon icon={KeyboardIcon} size={18} className="text-primary-500 mt-0.5 shrink-0"  />
            <div>
              <p className="text-sm font-medium text-gray-900">Keyboard Navigation</p>
              <p className="text-xs text-gray-500 mt-0.5">Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-[10px] font-mono">Alt + ←</kbd> to go back to the previous page.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <HIcon icon={ShoppingCart01Icon} size={18} className="text-primary-500 mt-0.5 shrink-0"  />
            <div>
              <p className="text-sm font-medium text-gray-900">Quick Add in POS</p>
              <p className="text-xs text-gray-500 mt-0.5">Type a product name and press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-[10px] font-mono">Enter</kbd> to instantly add it to the cart.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <HIcon icon={ReceiptTextIcon} size={18} className="text-primary-500 mt-0.5 shrink-0"  />
            <div>
              <p className="text-sm font-medium text-gray-900">Hold & Recall Sales</p>
              <p className="text-xs text-gray-500 mt-0.5">Use "I Want To → Hold Sale" to save a cart and pick it up later from the held sales list.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <HIcon icon={Package01Icon} size={18} className="text-primary-500 mt-0.5 shrink-0"  />
            <div>
              <p className="text-sm font-medium text-gray-900">Bulk Import Products</p>
              <p className="text-xs text-gray-500 mt-0.5">In Inventory, use the import button to upload an Excel spreadsheet of products at once.</p>
            </div>
          </div>
        </div>
      </>
    ),
  },
]

const AppGuide = ({ userRole = 'admin' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  // Filter guide steps based on user role
  const role = userRole.toLowerCase()
  const steps = guideContent.filter(s => s.forRoles.includes(role))

  // Show automatically on first visit (unless dismissed for this version)
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(GUIDE_DISMISSED_KEY)
      if (dismissed !== GUIDE_VERSION) {
        // Small delay so the page renders first
        const timer = setTimeout(() => setIsOpen(true), 1200)
        return () => clearTimeout(timer)
      }
    } catch { /* ignore */ }
  }, [])

  const handleDismiss = () => {
    setIsOpen(false)
    try {
      localStorage.setItem(GUIDE_DISMISSED_KEY, GUIDE_VERSION)
    } catch { /* ignore */ }
  }

  const handleOpen = () => {
    setCurrentStep(0)
    setIsOpen(true)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1)
  }

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const step = steps[currentStep]
  if (!step) return null

  const StepIcon = step.icon
  const progress = ((currentStep + 1) / steps.length) * 100
  const isLast = currentStep === steps.length - 1
  const isFirst = currentStep === 0

  return (
    <>
      {/* Floating Help Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          title="Open feature guide"
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
        >
          <HIcon icon={BookOpenIcon} size={20}  />
        </button>
      )}

      {/* Guide Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in">
            {/* Header */}
            <div className={`${step.color} px-6 py-5 text-white shrink-0`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <StepIcon size={20} />
                  </div>
                  <div>
                    <p className="text-white/70 text-xs font-medium uppercase tracking-wider">
                      Step {currentStep + 1} of {steps.length}
                    </p>
                    <h2 className="text-lg font-bold leading-tight">{step.title}</h2>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Close guide"
                >
                  <HIcon icon={Cancel01Icon} size={18}  />
                </button>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-white/20 rounded-full h-1.5">
                <div
                  className="bg-white rounded-full h-1.5 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
              {step.content}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0 bg-gray-50">
              <div className="flex items-center gap-1">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentStep
                        ? 'bg-primary-500 w-5'
                        : i < currentStep
                          ? 'bg-primary-300'
                          : 'bg-gray-300'
                    }`}
                    title={`Go to step ${i + 1}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                {!isFirst && (
                  <button
                    onClick={handlePrev}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    <HIcon icon={ArrowLeft01Icon} size={16}  />
                    Back
                  </button>
                )}
                {isLast ? (
                  <button
                    onClick={handleDismiss}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors shadow-sm"
                  >
                    <HIcon icon={CheckmarkCircle02Icon} size={16}  />
                    Got it!
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors shadow-sm"
                  >
                    Next
                    <HIcon icon={ArrowRight01Icon} size={16}  />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AppGuide
