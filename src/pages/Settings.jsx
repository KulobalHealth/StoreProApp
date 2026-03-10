import React, { useState } from 'react'
import { Save, Store, Receipt, Printer, Bell, Shield, Globe, Database, Download, Upload, Clock, CheckCircle, AlertCircle, CreditCard, DollarSign, Calendar, FileText, RefreshCw, Trash2, Settings as SettingsIcon, Eye, QrCode, FileText as FileTextIcon, Mail, Phone, MapPin, Building2, User, Lock, Smartphone, Wallet, Loader2 } from 'lucide-react'

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
      name: 'Awosel OS Store',
      address: '123 Main Street, Accra',
      phone: '+233 24 123 4567',
      email: 'store@awosel.com',
      taxId: 'TAX-123456',
      taxRate: getStoredTaxRate() === 0 ? '' : String(getStoredTaxRate()),
    },
    receipt: {
      header: 'Thank you for shopping with us!',
      footer: 'Visit us again!',
      showTax: true,
      showBarcode: true,
      showStoreInfo: true,
      showDate: true,
      showCashier: true,
      printerWidth: '80mm', // 80mm, 58mm
      fontSize: 'normal', // small, normal, large
    },
    notifications: {
      lowStock: true,
      dailyReport: true,
      newOrder: false,
    },
    security: {
      requirePassword: true,
      sessionTimeout: '30',
      twoFactorAuth: false,
    },
    backups: {
      autoBackup: true,
      backupFrequency: 'daily', // daily, weekly, monthly
      backupLocation: 'local', // local, cloud
      lastBackup: '2024-01-15 10:30:00',
      nextBackup: '2024-01-16 02:00:00',
      retentionDays: '30',
    },
    billing: {
      plan: 'Professional',
      billingCycle: 'monthly', // monthly, yearly
      nextBillingDate: '2024-02-15',
      amount: 99.00,
      status: 'active',
      paymentMethod: 'mobile_money', // credit_card, mobile_money
      creditCard: {
        last4: '4567',
        brand: 'Visa',
        expiryMonth: '12',
        expiryYear: '2025',
      },
      mobileMoney: {
        provider: 'MTN', // MTN, Vodafone, AirtelTigo
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

  const handleSave = () => {
    alert('Settings saved successfully!')
  }

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true)
    try {
      // Simulate backup process (2-3 seconds)
      await new Promise(resolve => setTimeout(resolve, 2500))
      
      // Update last backup time
      const now = new Date()
      const formattedDate = now.toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      
      setSettings({
        ...settings,
        backups: {
          ...settings.backups,
          lastBackup: formattedDate,
          nextBackup: new Date(now.getTime() + 24 * 60 * 60 * 1000).toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        }
      })
      
      alert('Backup created successfully!')
    } catch (error) {
      alert('Failed to create backup. Please try again.')
      console.error('Backup error:', error)
    } finally {
      setIsCreatingBackup(false)
    }
  }

  const handleRestoreBackup = (backupId) => {
    if (window.confirm('Are you sure you want to restore this backup? This will replace all current data.')) {
      alert(`Restoring backup ${backupId}...`)
      // In real app, this would trigger a restore process
    }
  }

  const handleDownloadBackup = (backupId) => {
    alert(`Downloading backup ${backupId}...`)
    // In real app, this would download the backup file
  }

  const handleDownloadInvoice = (invoiceId) => {
    alert(`Downloading invoice ${invoiceId}...`)
    // In real app, this would download the invoice PDF
  }

  const [activeTab, setActiveTab] = useState('store')

  const tabs = [
    { id: 'store', label: 'Store Info', icon: Store, color: 'blue' },
    { id: 'receipt', label: 'Receipt', icon: Receipt, color: 'green' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'yellow' },
    { id: 'security', label: 'Security', icon: Shield, color: 'red' },
    { id: 'backups', label: 'Backups', icon: Database, color: 'indigo' },
    { id: 'billing', label: 'Billing', icon: CreditCard, color: 'emerald' },
  ]

  const getTabColorClasses = (color, isActive) => {
    const colors = {
      blue: isActive ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50',
      green: isActive ? 'bg-green-600 text-white' : 'text-green-600 hover:bg-green-50',
      yellow: isActive ? 'bg-yellow-600 text-white' : 'text-yellow-600 hover:bg-yellow-50',
      red: isActive ? 'bg-red-600 text-white' : 'text-red-600 hover:bg-red-50',
      indigo: isActive ? 'bg-indigo-600 text-white' : 'text-indigo-600 hover:bg-indigo-50',
      emerald: isActive ? 'bg-emerald-600 text-white' : 'text-emerald-600 hover:bg-emerald-50',
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <SettingsIcon size={32} className="mr-3 text-primary-600" />
            Settings
          </h1>
          <p className="text-gray-600 mt-2 flex items-center">
            <Shield size={16} className="mr-2" />
            Configure your store settings and preferences
          </p>
        </div>
        <button onClick={handleSave} className="btn-primary flex items-center">
          <Save size={18} className="mr-2" />
          Save All Changes
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="flex flex-wrap border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center px-5 py-4 font-medium text-sm transition-all ${
                  isActive
                    ? getTabColorClasses(tab.color, true)
                    : `text-gray-600 hover:text-gray-900 ${getTabColorClasses(tab.color, false)}`
                }`}
              >
                <Icon size={18} className="mr-2" />
                {tab.label}
                {isActive && (
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                    tab.color === 'blue' ? 'bg-blue-600' :
                    tab.color === 'green' ? 'bg-green-600' :
                    tab.color === 'yellow' ? 'bg-yellow-600' :
                    tab.color === 'red' ? 'bg-red-600' :
                    tab.color === 'indigo' ? 'bg-indigo-600' :
                    'bg-emerald-600'
                  }`} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-6">
        {/* Store Information Tab */}
        {activeTab === 'store' && (
        <div className="card">
          <div className="flex items-center mb-6 pb-4 border-b">
            <div className="bg-blue-600 p-2 rounded-lg mr-3">
              <Store size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Store Information</h2>
              <p className="text-sm text-gray-600 mt-1">Manage your store details and contact information</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Building2 size={16} className="text-gray-400 mr-2" />
                Store Name
              </label>
              <input
                type="text"
                value={settings.store.name}
                onChange={(e) => setSettings({
                  ...settings,
                  store: { ...settings.store, name: e.target.value }
                })}
                className="input-field"
                placeholder="Enter store name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FileTextIcon size={16} className="text-gray-400 mr-2" />
                Tax ID
              </label>
              <input
                type="text"
                value={settings.store.taxId}
                onChange={(e) => setSettings({
                  ...settings,
                  store: { ...settings.store, taxId: e.target.value }
                })}
                className="input-field"
                placeholder="TAX-123456"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <DollarSign size={16} className="text-gray-400 mr-2" />
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={settings.store.taxRate}
                onChange={(e) => {
                  const raw = e.target.value
                  setSettings({
                    ...settings,
                    store: { ...settings.store, taxRate: raw }
                  })
                  try {
                    const num = raw === '' ? 0 : (parseFloat(raw) || 0)
                    localStorage.setItem(TAX_RATE_KEY, String(num >= 0 ? num : 0))
                  } catch (_) {}
                }}
                className="input-field"
                placeholder="0"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">Applied to POS subtotal (0 = no tax)</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <MapPin size={16} className="text-gray-400 mr-2" />
                Address
              </label>
              <input
                type="text"
                value={settings.store.address}
                onChange={(e) => setSettings({
                  ...settings,
                  store: { ...settings.store, address: e.target.value }
                })}
                className="input-field"
                placeholder="Store address"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Phone size={16} className="text-gray-400 mr-2" />
                Phone
              </label>
              <input
                type="text"
                value={settings.store.phone}
                onChange={(e) => setSettings({
                  ...settings,
                  store: { ...settings.store, phone: e.target.value }
                })}
                className="input-field"
                placeholder="+233 24 123 4567"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Mail size={16} className="text-gray-400 mr-2" />
                Email
              </label>
              <input
                type="email"
                value={settings.store.email}
                onChange={(e) => setSettings({
                  ...settings,
                  store: { ...settings.store, email: e.target.value }
                })}
                className="input-field"
                placeholder="store@awosel.com"
              />
            </div>
          </div>
        </div>
        )}

        {/* Receipt Settings Tab */}
        {activeTab === 'receipt' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <div className="flex items-center">
              <div className="bg-green-600 p-2 rounded-lg mr-3">
                <Receipt size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Receipt Settings</h2>
                <p className="text-sm text-gray-600 mt-1">Customize receipt appearance and content</p>
              </div>
            </div>
            <button className="btn-secondary flex items-center text-sm">
              <Eye size={16} className="mr-2" />
              Preview Receipt
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Receipt Content */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <FileTextIcon size={18} className="text-primary-600 mr-2" />
                  Receipt Content
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Receipt Header Text
                    </label>
                    <textarea
                      value={settings.receipt.header}
                      onChange={(e) => setSettings({
                        ...settings,
                        receipt: { ...settings.receipt, header: e.target.value }
                      })}
                      className="input-field"
                      rows="2"
                      placeholder="Thank you for shopping with us!"
                    />
                    <p className="text-xs text-gray-500 mt-1">This text appears at the top of receipts</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Receipt Footer Text
                    </label>
                    <textarea
                      value={settings.receipt.footer}
                      onChange={(e) => setSettings({
                        ...settings,
                        receipt: { ...settings.receipt, footer: e.target.value }
                      })}
                      className="input-field"
                      rows="2"
                      placeholder="Visit us again!"
                    />
                    <p className="text-xs text-gray-500 mt-1">This text appears at the bottom of receipts</p>
                  </div>
                </div>
              </div>

              {/* Receipt Display Options */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye size={18} className="text-primary-600 mr-2" />
                  Display Options
                </h3>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <label className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <DollarSign size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Show Tax on Receipt</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.receipt.showTax}
                      onChange={(e) => setSettings({
                        ...settings,
                        receipt: { ...settings.receipt, showTax: e.target.checked }
                      })}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <QrCode size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Show Barcode on Receipt</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.receipt.showBarcode}
                      onChange={(e) => setSettings({
                        ...settings,
                        receipt: { ...settings.receipt, showBarcode: e.target.checked }
                      })}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <Store size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Show Store Information</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.receipt.showStoreInfo}
                      onChange={(e) => setSettings({
                        ...settings,
                        receipt: { ...settings.receipt, showStoreInfo: e.target.checked }
                      })}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Show Date & Time</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.receipt.showDate}
                      onChange={(e) => setSettings({
                        ...settings,
                        receipt: { ...settings.receipt, showDate: e.target.checked }
                      })}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <User size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Show Cashier Name</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.receipt.showCashier}
                      onChange={(e) => setSettings({
                        ...settings,
                        receipt: { ...settings.receipt, showCashier: e.target.checked }
                      })}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Printer Settings */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Printer size={18} className="text-primary-600 mr-2" />
                  Printer Settings
                </h3>
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Printer Width
                    </label>
                    <select
                      value={settings.receipt.printerWidth}
                      onChange={(e) => setSettings({
                        ...settings,
                        receipt: { ...settings.receipt, printerWidth: e.target.value }
                      })}
                      className="input-field"
                    >
                      <option value="80mm">80mm (Standard)</option>
                      <option value="58mm">58mm (Thermal)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Select your printer paper width</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Font Size
                    </label>
                    <select
                      value={settings.receipt.fontSize}
                      onChange={(e) => setSettings({
                        ...settings,
                        receipt: { ...settings.receipt, fontSize: e.target.value }
                      })}
                      className="input-field"
                    >
                      <option value="small">Small</option>
                      <option value="normal">Normal</option>
                      <option value="large">Large</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Adjust receipt text size</p>
                  </div>
                </div>
              </div>

              {/* Receipt Preview */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye size={18} className="text-primary-600 mr-2" />
                  Receipt Preview
                </h3>
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6 font-mono text-xs">
                  <div className="text-center mb-4 pb-4 border-b-2 border-dashed">
                    <p className="font-bold text-sm mb-1">{settings.store.name}</p>
                    <p className="text-xs">{settings.store.address}</p>
                    <p className="text-xs">{settings.store.phone}</p>
                  </div>
                  {settings.receipt.header && (
                    <div className="text-center mb-4 pb-4 border-b border-dashed">
                      <p className="text-xs">{settings.receipt.header}</p>
                    </div>
                  )}
                  <div className="mb-4 pb-4 border-b border-dashed">
                    <div className="flex justify-between mb-1">
                      <span>Item 1</span>
                      <span>₵10.00</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Item 2</span>
                      <span>₵15.00</span>
                    </div>
                    {settings.receipt.showTax && (
                      <div className="flex justify-between mt-2 pt-2 border-t">
                        <span>Tax (12.5%)</span>
                        <span>₵3.13</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between font-bold mb-4 pb-4 border-b-2">
                    <span>TOTAL</span>
                    <span>₵28.13</span>
                  </div>
                  {settings.receipt.showBarcode && (
                    <div className="text-center mb-4 pb-4 border-b border-dashed">
                      <div className="bg-gray-200 h-16 flex items-center justify-center rounded">
                        <QrCode size={24} className="text-gray-400" />
                      </div>
                      <p className="text-xs mt-2">1234567890123</p>
                    </div>
                  )}
                  {settings.receipt.footer && (
                    <div className="text-center">
                      <p className="text-xs">{settings.receipt.footer}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
        <div className="card">
          <div className="flex items-center mb-6 pb-4 border-b">
            <div className="bg-yellow-600 p-2 rounded-lg mr-3">
              <Bell size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-600 mt-1">Configure system notifications and alerts</p>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <AlertCircle size={18} className="text-orange-500 mr-3" />
                <div>
                  <span className="text-sm font-semibold text-gray-900 block">Low Stock Alerts</span>
                  <span className="text-xs text-gray-500">Get notified when inventory is running low</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.lowStock}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, lowStock: e.target.checked }
                })}
                className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
              />
            </label>
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <FileText size={18} className="text-blue-500 mr-3" />
                <div>
                  <span className="text-sm font-semibold text-gray-900 block">Daily Sales Report</span>
                  <span className="text-xs text-gray-500">Receive daily sales summary via email</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.dailyReport}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, dailyReport: e.target.checked }
                })}
                className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
              />
            </label>
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <Bell size={18} className="text-green-500 mr-3" />
                <div>
                  <span className="text-sm font-semibold text-gray-900 block">New Order Notifications</span>
                  <span className="text-xs text-gray-500">Get notified when new orders are received</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.newOrder}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, newOrder: e.target.checked }
                })}
                className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
              />
            </label>
          </div>
        </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
        <div className="card">
          <div className="flex items-center mb-6 pb-4 border-b">
            <div className="bg-red-600 p-2 rounded-lg mr-3">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
              <p className="text-sm text-gray-600 mt-1">Manage security and authentication settings</p>
            </div>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <Lock size={18} className="text-red-500 mr-3" />
                <div>
                  <span className="text-sm font-semibold text-gray-900 block">Require Password for Transactions</span>
                  <span className="text-xs text-gray-500">Additional security for high-value transactions</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.security.requirePassword}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, requirePassword: e.target.checked }
                })}
                className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
              />
            </label>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Clock size={16} className="text-gray-400 mr-2" />
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, sessionTimeout: e.target.value }
                })}
                className="input-field w-32"
                min="5"
                max="480"
                placeholder="30"
              />
              <p className="text-xs text-gray-500 mt-2">Automatically log out after inactivity period</p>
            </div>
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <Shield size={18} className="text-purple-500 mr-3" />
                <div>
                  <span className="text-sm font-semibold text-gray-900 block">Enable Two-Factor Authentication</span>
                  <span className="text-xs text-gray-500">Add an extra layer of security to your account</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.security.twoFactorAuth}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, twoFactorAuth: e.target.checked }
                })}
                className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
              />
            </label>
          </div>
        </div>
        )}

        {/* Backups Tab */}
        {activeTab === 'backups' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <div className="flex items-center">
              <div className="bg-indigo-600 p-2 rounded-lg mr-3">
                <Database size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Backups</h2>
                <p className="text-sm text-gray-600 mt-1">Manage data backups and restore points</p>
              </div>
            </div>
            <button
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
              className={`btn-primary flex items-center ${isCreatingBackup ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isCreatingBackup ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <Database size={18} className="mr-2" />
                  Create Backup Now
                </>
              )}
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Backup Settings */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Backup Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      checked={settings.backups.autoBackup}
                      onChange={(e) => setSettings({
                        ...settings,
                        backups: { ...settings.backups, autoBackup: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable Automatic Backups</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Backup Frequency
                  </label>
                  <select
                    value={settings.backups.backupFrequency}
                    onChange={(e) => setSettings({
                      ...settings,
                      backups: { ...settings.backups, backupFrequency: e.target.value }
                    })}
                    className="input-field"
                    disabled={!settings.backups.autoBackup}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Backup Location
                  </label>
                  <select
                    value={settings.backups.backupLocation}
                    onChange={(e) => setSettings({
                      ...settings,
                      backups: { ...settings.backups, backupLocation: e.target.value }
                    })}
                    className="input-field"
                  >
                    <option value="local">Local Storage</option>
                    <option value="cloud">Cloud Storage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retention Period (days)
                  </label>
                  <input
                    type="number"
                    value={settings.backups.retentionDays}
                    onChange={(e) => setSettings({
                      ...settings,
                      backups: { ...settings.backups, retentionDays: e.target.value }
                    })}
                    className="input-field"
                    min="1"
                    max="365"
                    placeholder="30"
                  />
                </div>
              </div>
            </div>

            {/* Backup Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                <div className="flex items-center mb-2">
                  <Clock size={16} className="text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Last Backup</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(settings.backups.lastBackup).toLocaleString('en-GB')}
                </p>
                <div className="flex items-center mt-2">
                  <CheckCircle size={14} className="text-green-600 mr-1" />
                  <span className="text-xs text-gray-600">Success</span>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                <div className="flex items-center mb-2">
                  <Calendar size={16} className="text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Next Backup</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(settings.backups.nextBackup).toLocaleString('en-GB')}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  {settings.backups.autoBackup ? 'Automatic' : 'Manual only'}
                </p>
              </div>
            </div>

            {/* Backup History */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Backup History</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date & Time</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Size</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backupHistory.map((backup) => (
                      <tr key={backup.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {new Date(backup.date).toLocaleString('en-GB')}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            backup.type === 'Automatic' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {backup.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">{backup.size}</td>
                        <td className="py-3 px-4">
                          <span className="flex items-center text-xs font-semibold text-green-700">
                            <CheckCircle size={14} className="mr-1" />
                            {backup.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleDownloadBackup(backup.id)}
                              className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                              title="Download Backup"
                            >
                              <Download size={16} />
                            </button>
                            <button
                              onClick={() => handleRestoreBackup(backup.id)}
                              className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                              title="Restore Backup"
                            >
                              <RefreshCw size={16} />
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
        </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
        <div className="card">
          <div className="flex items-center mb-6 pb-4 border-b">
            <div className="bg-emerald-600 p-2 rounded-lg mr-3">
              <CreditCard size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Billing & Subscription</h2>
              <p className="text-sm text-gray-600 mt-1">Manage your subscription and payment information</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="bg-gradient-to-r from-blue-50 to-transparent p-6 rounded-lg border-l-4 border-blue-600">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{settings.billing.plan} Plan</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Billed {settings.billing.billingCycle === 'monthly' ? 'monthly' : 'annually'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-700">
                    ₵{settings.billing.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    per {settings.billing.billingCycle === 'monthly' ? 'month' : 'year'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  settings.billing.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {settings.billing.status === 'active' && <CheckCircle size={12} className="inline mr-1" />}
                  {settings.billing.status.charAt(0).toUpperCase() + settings.billing.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Wallet size={18} className="text-primary-600 mr-2" />
                Payment Method
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setSettings({
                    ...settings,
                    billing: { ...settings.billing, paymentMethod: 'credit_card' }
                  })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.billing.paymentMethod === 'credit_card'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <CreditCard size={24} className={`mr-3 ${
                      settings.billing.paymentMethod === 'credit_card' ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Credit/Debit Card</p>
                      <p className="text-xs text-gray-500">Pay with card</p>
                    </div>
                    {settings.billing.paymentMethod === 'credit_card' && (
                      <CheckCircle size={20} className="ml-auto text-blue-600" />
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    billing: { ...settings.billing, paymentMethod: 'mobile_money' }
                  })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.billing.paymentMethod === 'mobile_money'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <Smartphone size={24} className={`mr-3 ${
                      settings.billing.paymentMethod === 'mobile_money' ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Mobile Money</p>
                      <p className="text-xs text-gray-500">MTN, Vodafone, AirtelTigo</p>
                    </div>
                    {settings.billing.paymentMethod === 'mobile_money' && (
                      <CheckCircle size={20} className="ml-auto text-green-600" />
                    )}
                  </div>
                </button>
              </div>

              {/* Payment Method Details */}
              {settings.billing.paymentMethod === 'credit_card' ? (
                <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600">
                  <div className="flex items-center mb-4">
                    <CreditCard size={20} className="text-blue-600 mr-2" />
                    <h4 className="font-semibold text-gray-900">Credit Card Details</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                      </label>
                      <div className="flex items-center p-3 bg-white rounded-lg">
                        <CreditCard size={16} className="text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          •••• •••• •••• {settings.billing.creditCard.last4}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Brand
                      </label>
                      <div className="flex items-center p-3 bg-white rounded-lg">
                        <span className="text-gray-900 font-medium">{settings.billing.creditCard.brand}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <div className="flex items-center p-3 bg-white rounded-lg">
                        <Calendar size={16} className="text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {settings.billing.creditCard.expiryMonth}/{settings.billing.creditCard.expiryYear}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-600">
                  <div className="flex items-center mb-4">
                    <Smartphone size={20} className="text-green-600 mr-2" />
                    <h4 className="font-semibold text-gray-900">Mobile Money Details</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Network Provider
                      </label>
                      <select
                        value={settings.billing.mobileMoney.provider}
                        onChange={(e) => setSettings({
                          ...settings,
                          billing: {
                            ...settings.billing,
                            mobileMoney: { ...settings.billing.mobileMoney, provider: e.target.value }
                          }
                        })}
                        className="input-field"
                      >
                        <option value="MTN">MTN Mobile Money</option>
                        <option value="Vodafone">Vodafone Cash</option>
                        <option value="AirtelTigo">AirtelTigo Money</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone size={16} className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="tel"
                          value={settings.billing.mobileMoney.phoneNumber}
                          onChange={(e) => setSettings({
                            ...settings,
                            billing: {
                              ...settings.billing,
                              mobileMoney: { ...settings.billing.mobileMoney, phoneNumber: e.target.value }
                            }
                          })}
                          className="input-field pl-10"
                          placeholder="+233 24 123 4567"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Account Name
                      </label>
                      <input
                        type="text"
                        value={settings.billing.mobileMoney.accountName}
                        onChange={(e) => setSettings({
                          ...settings,
                          billing: {
                            ...settings.billing,
                            mobileMoney: { ...settings.billing.mobileMoney, accountName: e.target.value }
                          }
                        })}
                        className="input-field"
                        placeholder="Account holder name"
                      />
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                    <div className="flex items-start">
                      <CheckCircle size={18} className="text-green-600 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Mobile Money Payment Active</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Payments will be processed via {settings.billing.mobileMoney.provider} Mobile Money
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Next Billing Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Calendar size={16} className="text-gray-400 mr-2" />
                Next Billing Date
              </label>
              <div className="flex items-center p-4 bg-gray-50 rounded-lg border-l-4 border-blue-600">
                <Calendar size={20} className="text-blue-600 mr-3" />
                <div>
                  <p className="font-semibold text-gray-900">
                    {new Date(settings.billing.nextBillingDate).toLocaleDateString('en-GB', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Your next payment will be processed automatically
                  </p>
                </div>
              </div>
            </div>

            {/* Billing History */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <FileText size={18} className="text-primary-600 mr-2" />
                Billing History
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Date</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Invoice #</th>
                      <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Amount</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Payment Method</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingHistory.map((invoice) => (
                      <tr key={invoice.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {new Date(invoice.date).toLocaleDateString('en-GB')}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">{invoice.invoice}</td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">
                          ₵{invoice.amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4">
                          {invoice.paymentMethod === 'mobile_money' ? (
                            <div className="flex items-center">
                              <Smartphone size={16} className="text-green-600 mr-2" />
                              <div>
                                <span className="text-sm font-medium text-gray-900">Mobile Money</span>
                                <p className="text-xs text-gray-500">{invoice.provider}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <CreditCard size={16} className="text-blue-600 mr-2" />
                              <span className="text-sm font-medium text-gray-900">Credit Card</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center w-fit ${
                            invoice.status === 'paid' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {invoice.status === 'paid' && <CheckCircle size={12} className="mr-1" />}
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDownloadInvoice(invoice.invoice)}
                            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors mx-auto flex items-center"
                            title="Download Invoice"
                          >
                            <Download size={16} className="mr-1" />
                            <span className="text-xs">Invoice</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Billing Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <button className="btn-secondary flex items-center">
                {settings.billing.paymentMethod === 'credit_card' ? (
                  <>
                    <CreditCard size={18} className="mr-2" />
                    Update Card
                  </>
                ) : (
                  <>
                    <Smartphone size={18} className="mr-2" />
                    Update Mobile Money
                  </>
                )}
              </button>
              <button className="btn-secondary flex items-center">
                <FileText size={18} className="mr-2" />
                View All Invoices
              </button>
              {settings.billing.paymentMethod === 'mobile_money' && (
                <button className="btn-primary flex items-center">
                  <Smartphone size={18} className="mr-2" />
                  Pay Now with Mobile Money
                </button>
              )}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

export default Settings

