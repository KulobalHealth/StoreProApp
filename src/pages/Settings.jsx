import React, { useState } from 'react'
import {
  Save, Store, Shield, Database, Download, Upload, Clock, CheckCircle,
  CreditCard, DollarSign, Calendar, FileText, RefreshCw,
  Settings as SettingsIcon, Mail, Phone, MapPin, Building2, Lock,
  Smartphone, Wallet, Loader2
} from 'lucide-react'

const TAX_RATE_KEY = 'awosel_tax_rate'

const getStoredTaxRate = () => {
  try {
    const v = localStorage.getItem(TAX_RATE_KEY)
    if (v === null || v === '') return 0
    const n = parseFloat(v)
    return Number.isFinite(n) && n >= 0 ? n : 0
  } catch {
    return 0
  }
}

const Settings = () => {
  const [settings, setSettings] = useState({
    store: {
      name: 'StorePro',
      address: '123 Main Street, Accra',
      phone: '+233 24 123 4567',
      email: 'store@awosel.com',
      taxId: 'TAX-123456',
      taxRate: getStoredTaxRate() === 0 ? '' : String(getStoredTaxRate()),
    },
    security: {
      requirePassword: true,
      sessionTimeout: '30',
      twoFactorAuth: false,
    },
    backups: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupLocation: 'local',
      lastBackup: '2024-01-15 10:30:00',
      nextBackup: '2024-01-16 02:00:00',
      retentionDays: '30',
    },
    billing: {
      plan: 'Professional',
      billingCycle: 'monthly',
      nextBillingDate: '2024-02-15',
      amount: 99.00,
      status: 'active',
      paymentMethod: 'mobile_money',
      creditCard: {
        last4: '4567',
        brand: 'Visa',
        expiryMonth: '12',
        expiryYear: '2025',
      },
      mobileMoney: {
        provider: 'MTN',
        phoneNumber: '+233 24 123 4567',
        accountName: 'John Doe',
      },
      invoices: [],
    },
  })

  const [backupHistory] = useState([
    { id: 1, date: '2024-01-15 02:00:00', type: 'Automatic', size: '125.5 MB', status: 'success' },
    { id: 2, date: '2024-01-14 02:00:00', type: 'Automatic', size: '124.8 MB', status: 'success' },
    { id: 3, date: '2024-01-13 02:00:00', type: 'Automatic', size: '123.2 MB', status: 'success' },
    { id: 4, date: '2024-01-12 15:30:00', type: 'Manual', size: '122.1 MB', status: 'success' },
  ])

  const [billingHistory] = useState([
    { id: 1, date: '2024-01-15', amount: 99.00, status: 'paid', invoice: 'INV-2024-001', paymentMethod: 'mobile_money', provider: 'MTN' },
    { id: 2, date: '2023-12-15', amount: 99.00, status: 'paid', invoice: 'INV-2023-012', paymentMethod: 'credit_card', provider: null },
    { id: 3, date: '2023-11-15', amount: 99.00, status: 'paid', invoice: 'INV-2023-011', paymentMethod: 'mobile_money', provider: 'Vodafone' },
  ])

  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [activeTab, setActiveTab] = useState('store')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2500))
      const now = new Date()
      const fmt = (d) => d.toLocaleString('en-GB', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      })
      setSettings(prev => ({
        ...prev,
        backups: {
          ...prev.backups,
          lastBackup: fmt(now),
          nextBackup: fmt(new Date(now.getTime() + 86400000))
        }
      }))
      alert('Sales Uploaded created successfully!')
    } catch (error) {
      alert('Failed to create sales upload. Please try again.')
    } finally {
      setIsCreatingBackup(false)
    }
  }

  const handleRestoreBackup = (backupId) => {
    if (window.confirm('Are you sure you want to restore this backup? This will replace all current data.')) {
      alert(`Restoring backup ${backupId}...`)
    }
  }

  const handleDownloadBackup = (backupId) => {
    alert(`Downloading backup ${backupId}...`)
  }

  const handleDownloadInvoice = (invoiceId) => {
    alert(`Downloading invoice ${invoiceId}...`)
  }

  const tabs = [
    { id: 'store', label: 'Store Info', icon: Store },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'backups', label: 'Backups', icon: Database },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
              <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
                <SettingsIcon size={18} className="text-white" />
              </div>
              Settings
            </h1>
            <p className="text-sm text-gray-500 mt-1 ml-12">Configure your store and preferences</p>
          </div>
          <button
            onClick={handleSave}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-primary-500 hover:bg-primary-600 text-white'
            }`}
          >
            {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* ─── Store Info ─── */}
        {activeTab === 'store' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                <Store size={18} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Store Information</h2>
                <p className="text-xs text-gray-500">Your store details and contact info</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                    <Building2 size={14} className="text-gray-400" /> Store Name
                  </label>
                  <input
                    type="text"
                    value={settings.store.name}
                    onChange={e => setSettings({ ...settings, store: { ...settings.store, name: e.target.value } })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                    placeholder="Enter store name"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                    <FileText size={14} className="text-gray-400" /> Tax ID
                  </label>
                  <input
                    type="text"
                    value={settings.store.taxId}
                    onChange={e => setSettings({ ...settings, store: { ...settings.store, taxId: e.target.value } })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                    placeholder="TAX-123456"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                    <DollarSign size={14} className="text-gray-400" /> Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={settings.store.taxRate}
                    onChange={e => {
                      const raw = e.target.value
                      setSettings({ ...settings, store: { ...settings.store, taxRate: raw } })
                      try {
                        const num = raw === '' ? 0 : (parseFloat(raw) || 0)
                        localStorage.setItem(TAX_RATE_KEY, String(num >= 0 ? num : 0))
                      } catch (_) {}
                    }}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-gray-400 mt-1">Applied to POS subtotal (0 = no tax)</p>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                    <MapPin size={14} className="text-gray-400" /> Address
                  </label>
                  <input
                    type="text"
                    value={settings.store.address}
                    onChange={e => setSettings({ ...settings, store: { ...settings.store, address: e.target.value } })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                    placeholder="Store address"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                    <Phone size={14} className="text-gray-400" /> Phone
                  </label>
                  <input
                    type="text"
                    value={settings.store.phone}
                    onChange={e => setSettings({ ...settings, store: { ...settings.store, phone: e.target.value } })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                    placeholder="+233 24 123 4567"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                    <Mail size={14} className="text-gray-400" /> Email
                  </label>
                  <input
                    type="email"
                    value={settings.store.email}
                    onChange={e => setSettings({ ...settings, store: { ...settings.store, email: e.target.value } })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                    placeholder="store@awosel.com"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Security ─── */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield size={18} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Security</h2>
                <p className="text-xs text-gray-500">Authentication and access settings</p>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <Lock size={15} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Require Password for Transactions</p>
                    <p className="text-xs text-gray-500">Extra security for high-value transactions</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.security.requirePassword}
                  onChange={e => setSettings({ ...settings, security: { ...settings.security, requirePassword: e.target.checked } })}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                />
              </label>
              <div className="p-4 bg-gray-50 rounded-xl">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Clock size={15} className="text-gray-400" /> Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={e => setSettings({ ...settings, security: { ...settings.security, sessionTimeout: e.target.value } })}
                  className="w-32 px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  min="5"
                  max="480"
                  placeholder="30"
                />
                <p className="text-xs text-gray-400 mt-1.5">Auto-logout after inactivity</p>
              </div>
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shield size={15} className="text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500">Add an extra layer of security</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.security.twoFactorAuth}
                  onChange={e => setSettings({ ...settings, security: { ...settings.security, twoFactorAuth: e.target.checked } })}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                />
              </label>
            </div>
          </div>
        )}

        {/* ─── Backups ─── */}
        {activeTab === 'backups' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Database size={18} className="text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Backups</h2>
                    <p className="text-xs text-gray-500">Data backup & restore</p>
                  </div>
                </div>
                <button
                  onClick={handleCreateBackup}
                  disabled={isCreatingBackup}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all ${
                    isCreatingBackup ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isCreatingBackup
                    ? <><Loader2 size={15} className="animate-spin" /> Uploading...</>
                    : <><Upload size={15} /> Upload Sales</>
                  }
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-2 text-xs font-medium text-blue-600 mb-1">
                      <Clock size={13} /> Last Backup
                    </div>
                    <p className="text-sm font-bold text-gray-900">{new Date(settings.backups.lastBackup).toLocaleString('en-GB')}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                      <CheckCircle size={12} /> Success
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-2 text-xs font-medium text-green-600 mb-1">
                      <Calendar size={13} /> Next Backup
                    </div>
                    <p className="text-sm font-bold text-gray-900">{new Date(settings.backups.nextBackup).toLocaleString('en-GB')}</p>
                    <p className="text-xs text-gray-500 mt-1">{settings.backups.autoBackup ? 'Automatic' : 'Manual only'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">Sales Upload History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600">
                      <th className="text-left py-3 px-5 font-medium">Date & Time</th>
                      <th className="text-left py-3 px-5 font-medium">Type</th>
                      <th className="text-left py-3 px-5 font-medium">Size</th>
                      <th className="text-left py-3 px-5 font-medium">Status</th>
                      <th className="text-center py-3 px-5 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backupHistory.map(b => (
                      <tr key={b.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-5 text-gray-700">{new Date(b.date).toLocaleString('en-GB')}</td>
                        <td className="py-3 px-5">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            b.type === 'Automatic' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>{b.type}</span>
                        </td>
                        <td className="py-3 px-5 text-gray-700">{b.size}</td>
                        <td className="py-3 px-5">
                          <span className="flex items-center gap-1 text-xs font-semibold text-green-700">
                            <CheckCircle size={13} /> {b.status}
                          </span>
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex justify-center gap-1">
                            <button onClick={() => handleDownloadBackup(b.id)} className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors" title="Download">
                              <Download size={15} />
                            </button>
                            <button onClick={() => handleRestoreBackup(b.id)} className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition-colors" title="Restore">
                              <RefreshCw size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── Billing ─── */}
        {activeTab === 'billing' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CreditCard size={18} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Billing & Subscription</h2>
                  <p className="text-xs text-gray-500">Plan, payment and invoices</p>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* Plan banner */}
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-transparent rounded-xl border border-blue-100">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{settings.billing.plan} Plan</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Billed {settings.billing.billingCycle === 'monthly' ? 'monthly' : 'annually'}
                    </p>
                    <span className={`inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      settings.billing.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {settings.billing.status === 'active' && <CheckCircle size={11} />}
                      {settings.billing.status.charAt(0).toUpperCase() + settings.billing.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-700">{'\u20B5'}{settings.billing.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">per {settings.billing.billingCycle === 'monthly' ? 'month' : 'year'}</p>
                  </div>
                </div>

                {/* Payment method */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                    <Wallet size={16} className="text-primary-500" /> Payment Method
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                    <button
                      onClick={() => setSettings({ ...settings, billing: { ...settings.billing, paymentMethod: 'credit_card' } })}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        settings.billing.paymentMethod === 'credit_card'
                          ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CreditCard size={20} className={settings.billing.paymentMethod === 'credit_card' ? 'text-blue-600' : 'text-gray-400'} />
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900">Credit / Debit Card</p>
                        <p className="text-xs text-gray-500">Pay with card</p>
                      </div>
                      {settings.billing.paymentMethod === 'credit_card' && <CheckCircle size={18} className="ml-auto text-blue-600" />}
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, billing: { ...settings.billing, paymentMethod: 'mobile_money' } })}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        settings.billing.paymentMethod === 'mobile_money'
                          ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Smartphone size={20} className={settings.billing.paymentMethod === 'mobile_money' ? 'text-green-600' : 'text-gray-400'} />
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900">Mobile Money</p>
                        <p className="text-xs text-gray-500">MTN, Vodafone, AirtelTigo</p>
                      </div>
                      {settings.billing.paymentMethod === 'mobile_money' && <CheckCircle size={18} className="ml-auto text-green-600" />}
                    </button>
                  </div>

                  {settings.billing.paymentMethod === 'credit_card' ? (
                    <div className="p-5 bg-blue-50 rounded-xl border border-blue-100 space-y-3">
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <CreditCard size={16} className="text-blue-600" /> Card Details
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 bg-white rounded-lg">
                          <p className="text-xs text-gray-500 mb-0.5">Card Number</p>
                          <p className="text-sm font-medium text-gray-900">{'\u2022\u2022\u2022\u2022'} {'\u2022\u2022\u2022\u2022'} {'\u2022\u2022\u2022\u2022'} {settings.billing.creditCard.last4}</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg">
                          <p className="text-xs text-gray-500 mb-0.5">Brand</p>
                          <p className="text-sm font-medium text-gray-900">{settings.billing.creditCard.brand}</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg">
                          <p className="text-xs text-gray-500 mb-0.5">Expires</p>
                          <p className="text-sm font-medium text-gray-900">{settings.billing.creditCard.expiryMonth}/{settings.billing.creditCard.expiryYear}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 bg-green-50 rounded-xl border border-green-100 space-y-4">
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <Smartphone size={16} className="text-green-600" /> Mobile Money Details
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Provider</label>
                          <select
                            value={settings.billing.mobileMoney.provider}
                            onChange={e => setSettings({
                              ...settings,
                              billing: { ...settings.billing, mobileMoney: { ...settings.billing.mobileMoney, provider: e.target.value } }
                            })}
                            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                          >
                            <option value="MTN">MTN Mobile Money</option>
                            <option value="Vodafone">Vodafone Cash</option>
                            <option value="AirtelTigo">AirtelTigo Money</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                          <div className="relative">
                            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="tel"
                              value={settings.billing.mobileMoney.phoneNumber}
                              onChange={e => setSettings({
                                ...settings,
                                billing: { ...settings.billing, mobileMoney: { ...settings.billing.mobileMoney, phoneNumber: e.target.value } }
                              })}
                              className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                              placeholder="+233 24 123 4567"
                            />
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Account Name</label>
                          <input
                            type="text"
                            value={settings.billing.mobileMoney.accountName}
                            onChange={e => setSettings({
                              ...settings,
                              billing: { ...settings.billing, mobileMoney: { ...settings.billing.mobileMoney, accountName: e.target.value } }
                            })}
                            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                            placeholder="Account holder name"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Next billing */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Calendar size={18} className="text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Next billing: {new Date(settings.billing.nextBillingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500">Payment processed automatically</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing history */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <FileText size={16} className="text-primary-500" />
                <h3 className="text-sm font-bold text-gray-900">Billing History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600">
                      <th className="text-left py-3 px-5 font-medium">Date</th>
                      <th className="text-left py-3 px-5 font-medium">Invoice</th>
                      <th className="text-right py-3 px-5 font-medium">Amount</th>
                      <th className="text-left py-3 px-5 font-medium">Method</th>
                      <th className="text-left py-3 px-5 font-medium">Status</th>
                      <th className="text-center py-3 px-5 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingHistory.map(inv => (
                      <tr key={inv.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-5 text-gray-700">{new Date(inv.date).toLocaleDateString('en-GB')}</td>
                        <td className="py-3 px-5 font-medium text-gray-900">{inv.invoice}</td>
                        <td className="py-3 px-5 text-right font-semibold text-gray-900">{'\u20B5'}{inv.amount.toFixed(2)}</td>
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-1.5">
                            {inv.paymentMethod === 'mobile_money'
                              ? <><Smartphone size={14} className="text-green-600" /><span className="text-gray-700">{inv.provider}</span></>
                              : <><CreditCard size={14} className="text-blue-600" /><span className="text-gray-700">Card</span></>
                            }
                          </div>
                        </td>
                        <td className="py-3 px-5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {inv.status === 'paid' && <CheckCircle size={11} />}
                            {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-center">
                          <button
                            onClick={() => handleDownloadInvoice(inv.invoice)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Download size={13} /> Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Settings
