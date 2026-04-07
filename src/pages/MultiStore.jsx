import React, { useState } from 'react'
import { HIcon } from '../components/HIcon'
import {
  Add01Icon,
  AlertCircleIcon,
  Analytics02Icon,
  ArrowMoveUpRightIcon,
  ArrowDataTransferHorizontalIcon,
  Calendar01Icon,
  CallIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Delete01Icon,
  DollarCircleIcon,
  Download01Icon,
  FileValidationIcon,
  FilterIcon,
  MapPinIcon,
  Package01Icon,
  PencilEdit01Icon,
  Search01Icon,
  ShoppingCart01Icon,
  Store01Icon,
  UserIcon,
  ViewIcon,
} from '@hugeicons/core-free-icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

const MultiStore = () => {
  const [activeTab, setActiveTab] = useState('overview') // overview, sales, inventory, transfers
  const [selectedStore, setSelectedStore] = useState('all') // all stores or specific store
  const [showAddStoreModal, setShowAddStoreModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showStoreDetailsModal, setShowStoreDetailsModal] = useState(false)
  const [selectedStoreDetails, setSelectedStoreDetails] = useState(null)

  // Mock stores data
  const [stores] = useState([
    { 
      id: 1, 
      name: 'Main Branch - Accra', 
      address: '123 Main Street, Accra', 
      phone: '+233 24 123 4567',
      manager: 'John Doe',
      status: 'active',
      openingDate: '2020-01-15',
      totalSales: 1250000,
      totalInventory: 45000,
      monthlySales: 125000
    },
    { 
      id: 2, 
      name: 'Kumasi Branch', 
      address: '456 High Street, Kumasi', 
      phone: '+233 24 234 5678',
      manager: 'Jane Smith',
      status: 'active',
      openingDate: '2021-03-20',
      totalSales: 980000,
      totalInventory: 32000,
      monthlySales: 98000
    },
    { 
      id: 3, 
      name: 'Tamale Branch', 
      address: '789 Market Road, Tamale', 
      phone: '+233 24 345 6789',
      manager: 'Michael Brown',
      status: 'active',
      openingDate: '2022-06-10',
      totalSales: 750000,
      totalInventory: 28000,
      monthlySales: 75000
    },
    { 
      id: 4, 
      name: 'Takoradi Branch', 
      address: '321 Harbor View, Takoradi', 
      phone: '+233 24 456 7890',
      manager: 'Sarah Johnson',
      status: 'active',
      openingDate: '2023-02-14',
      totalSales: 520000,
      totalInventory: 19000,
      monthlySales: 52000
    },
  ])

  // Mock sales data by store
  const salesDataByStore = {
    all: [
      { name: 'Jan', sales: 350000, orders: 3500 },
      { name: 'Feb', sales: 380000, orders: 3800 },
      { name: 'Mar', sales: 420000, orders: 4200 },
      { name: 'Apr', sales: 400000, orders: 4000 },
      { name: 'May', sales: 450000, orders: 4500 },
      { name: 'Jun', sales: 480000, orders: 4800 },
    ],
    1: [
      { name: 'Jan', sales: 120000, orders: 1200 },
      { name: 'Feb', sales: 130000, orders: 1300 },
      { name: 'Mar', sales: 140000, orders: 1400 },
      { name: 'Apr', sales: 135000, orders: 1350 },
      { name: 'May', sales: 150000, orders: 1500 },
      { name: 'Jun', sales: 160000, orders: 1600 },
    ],
    2: [
      { name: 'Jan', sales: 95000, orders: 950 },
      { name: 'Feb', sales: 100000, orders: 1000 },
      { name: 'Mar', sales: 110000, orders: 1100 },
      { name: 'Apr', sales: 105000, orders: 1050 },
      { name: 'May', sales: 115000, orders: 1150 },
      { name: 'Jun', sales: 120000, orders: 1200 },
    ],
    3: [
      { name: 'Jan', sales: 75000, orders: 750 },
      { name: 'Feb', sales: 78000, orders: 780 },
      { name: 'Mar', sales: 82000, orders: 820 },
      { name: 'Apr', sales: 80000, orders: 800 },
      { name: 'May', sales: 85000, orders: 850 },
      { name: 'Jun', sales: 90000, orders: 900 },
    ],
    4: [
      { name: 'Jan', sales: 60000, orders: 600 },
      { name: 'Feb', sales: 72000, orders: 720 },
      { name: 'Mar', sales: 88000, orders: 880 },
      { name: 'Apr', sales: 80000, orders: 800 },
      { name: 'May', sales: 90000, orders: 900 },
      { name: 'Jun', sales: 110000, orders: 1100 },
    ],
  }

  // Mock inventory data by store
  const inventoryDataByStore = {
    all: [
      { category: 'Electronics', quantity: 1250, value: 125000 },
      { category: 'Clothing', quantity: 3200, value: 96000 },
      { category: 'Food & Beverages', quantity: 5800, value: 87000 },
      { category: 'Home & Garden', quantity: 2100, value: 63000 },
      { category: 'Health & Beauty', quantity: 1800, value: 54000 },
    ],
    1: [
      { category: 'Electronics', quantity: 450, value: 45000 },
      { category: 'Clothing', quantity: 1200, value: 36000 },
      { category: 'Food & Beverages', quantity: 2100, value: 31500 },
      { category: 'Home & Garden', quantity: 800, value: 24000 },
      { category: 'Health & Beauty', quantity: 650, value: 19500 },
    ],
    2: [
      { category: 'Electronics', quantity: 350, value: 35000 },
      { category: 'Clothing', quantity: 900, value: 27000 },
      { category: 'Food & Beverages', quantity: 1600, value: 24000 },
      { category: 'Home & Garden', quantity: 600, value: 18000 },
      { category: 'Health & Beauty', quantity: 500, value: 15000 },
    ],
    3: [
      { category: 'Electronics', quantity: 250, value: 25000 },
      { category: 'Clothing', quantity: 700, value: 21000 },
      { category: 'Food & Beverages', quantity: 1200, value: 18000 },
      { category: 'Home & Garden', quantity: 400, value: 12000 },
      { category: 'Health & Beauty', quantity: 400, value: 12000 },
    ],
    4: [
      { category: 'Electronics', quantity: 200, value: 20000 },
      { category: 'Clothing', quantity: 400, value: 12000 },
      { category: 'Food & Beverages', quantity: 900, value: 13500 },
      { category: 'Home & Garden', quantity: 300, value: 9000 },
      { category: 'Health & Beauty', quantity: 250, value: 7500 },
    ],
  }

  // Mock transfer history
  const [transfers] = useState([
    {
      id: 1,
      transferNumber: 'TRF-2024-001',
      fromStore: 'Main Branch - Accra',
      toStore: 'Kumasi Branch',
      product: 'Coca Cola 500ml',
      quantity: 50,
      date: '2024-01-15',
      status: 'completed',
      initiatedBy: 'John Doe'
    },
    {
      id: 2,
      transferNumber: 'TRF-2024-002',
      fromStore: 'Kumasi Branch',
      toStore: 'Tamale Branch',
      product: 'Rice 5kg',
      quantity: 30,
      date: '2024-01-18',
      status: 'in-transit',
      initiatedBy: 'Jane Smith'
    },
    {
      id: 3,
      transferNumber: 'TRF-2024-003',
      fromStore: 'Main Branch - Accra',
      toStore: 'Takoradi Branch',
      product: 'Cooking Oil 1L',
      quantity: 25,
      date: '2024-01-20',
      status: 'pending',
      initiatedBy: 'John Doe'
    },
    {
      id: 4,
      transferNumber: 'TRF-2024-004',
      fromStore: 'Tamale Branch',
      toStore: 'Kumasi Branch',
      product: 'Milk 1L',
      quantity: 40,
      date: '2024-01-22',
      status: 'completed',
      initiatedBy: 'Michael Brown'
    },
  ])

  const [newTransfer, setNewTransfer] = useState({
    fromStore: '',
    toStore: '',
    product: '',
    quantity: '',
    notes: ''
  })

  const [newStore, setNewStore] = useState({
    name: '',
    address: '',
    phone: '',
    manager: '',
    openingDate: ''
  })

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  // Calculate consolidated totals
  const consolidatedStats = {
    totalStores: stores.length,
    totalSales: stores.reduce((sum, store) => sum + store.totalSales, 0),
    totalInventory: stores.reduce((sum, store) => sum + store.totalInventory, 0),
    monthlySales: stores.reduce((sum, store) => sum + store.monthlySales, 0),
    activeStores: stores.filter(s => s.status === 'active').length
  }

  const currentSalesData = salesDataByStore[selectedStore] || salesDataByStore.all
  const currentInventoryData = inventoryDataByStore[selectedStore] || inventoryDataByStore.all

  const handleCreateTransfer = () => {
    if (!newTransfer.fromStore || !newTransfer.toStore || !newTransfer.product || !newTransfer.quantity) {
      alert('Please fill in all required fields')
      return
    }
    alert('Transfer created successfully!')
    setShowTransferModal(false)
    setNewTransfer({ fromStore: '', toStore: '', product: '', quantity: '', notes: '' })
  }

  const handleAddStore = () => {
    if (!newStore.name || !newStore.address || !newStore.phone) {
      alert('Please fill in all required fields')
      return
    }
    alert('Store added successfully!')
    setShowAddStoreModal(false)
    setNewStore({ name: '', address: '', phone: '', manager: '', openingDate: '' })
  }

  const handleExportData = () => {
    alert('Exporting consolidated data...')
    // In real app, this would export to CSV/Excel
  }

  const handleViewStoreDetails = (store) => {
    setSelectedStoreDetails(store)
    setShowStoreDetailsModal(true)
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-500 text-white">
                <HIcon icon={Store01Icon} size={18} strokeWidth={2}  />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">Multi-Store Management</h1>
                <p className="text-gray-500 text-xs">Manage multiple store locations and transfers</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportData}
                className="btn-secondary flex items-center"
              >
                <HIcon icon={Download01Icon} size={18} className="mr-2"  />
                Export Data
              </button>
              <button
                onClick={() => setShowAddStoreModal(true)}
                className="btn-primary flex items-center"
              >
                <HIcon icon={Add01Icon} size={18} className="mr-2"  />
                Add Store
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Store Selector */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-semibold text-gray-700 flex items-center">
            <HIcon icon={FilterIcon} size={18} className="mr-2"  />
            Select Store:
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedStore('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedStore === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Stores (Consolidated)
          </button>
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() => setSelectedStore(store.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center ${
                selectedStore === store.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <HIcon icon={MapPinIcon} size={16} className="mr-2"  />
              {store.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-6">
        <div className="flex flex-wrap border-b">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'sales', label: 'Sales Drill-Down', icon: TrendingUp },
            { id: 'inventory', label: 'Inventory Drill-Down', icon: Package },
            { id: 'transfers', label: 'Inventory Transfers', icon: ArrowRightLeft },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-5 py-3 font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={18} className="mr-2" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Consolidated Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Total Stores</p>
                  <p className="text-3xl font-bold">{consolidatedStats.totalStores}</p>
                </div>
                <HIcon icon={Store01Icon} size={32} className="opacity-80"  />
              </div>
            </div>
            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Total Sales</p>
                  <p className="text-3xl font-bold">₵{(consolidatedStats.totalSales / 1000).toFixed(0)}K</p>
                </div>
                <HIcon icon={DollarCircleIcon} size={32} className="opacity-80"  />
              </div>
            </div>
            <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Total Inventory</p>
                  <p className="text-3xl font-bold">₵{(consolidatedStats.totalInventory / 1000).toFixed(0)}K</p>
                </div>
                <HIcon icon={Package01Icon} size={32} className="opacity-80"  />
              </div>
            </div>
            <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Monthly Sales</p>
                  <p className="text-3xl font-bold">₵{(consolidatedStats.monthlySales / 1000).toFixed(0)}K</p>
                </div>
                <HIcon icon={ArrowMoveUpRightIcon} size={32} className="opacity-80"  />
              </div>
            </div>
            <div className="card bg-gradient-to-br from-primary-600 to-primary-700 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Active Stores</p>
                  <p className="text-3xl font-bold">{consolidatedStats.activeStores}</p>
                </div>
                <HIcon icon={CheckmarkCircle02Icon} size={32} className="opacity-80"  />
              </div>
            </div>
          </div>

          {/* Stores List */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">All Stores</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Store Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Location</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Manager</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Sales</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Inventory Value</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store) => (
                    <tr key={store.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <HIcon icon={Store01Icon} size={18} className="text-primary-600 mr-2"  />
                          <span className="font-medium text-gray-900">{store.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{store.address}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{store.manager}</td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        ₵{store.totalSales.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        ₵{store.totalInventory.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewStoreDetails(store)}
                            className="p-2 rounded-lg hover:bg-primary-100 text-primary-600 transition-colors"
                            title="View Details"
                          >
                            <HIcon icon={ViewIcon} size={16}  />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                            title="Edit"
                          >
                            <HIcon icon={PencilEdit01Icon} size={16}  />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Consolidated Sales Chart */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {selectedStore === 'all' ? 'Consolidated' : stores.find(s => s.id === selectedStore)?.name} Sales Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={currentSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Sales Drill-Down Tab */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Sales Analysis - {selectedStore === 'all' ? 'All Stores' : stores.find(s => s.id === selectedStore)?.name}
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={currentSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#3B82F6" name="Sales (₵)" />
                <Bar dataKey="orders" fill="#10B981" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sales by Store Comparison */}
          {selectedStore === 'all' && (
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sales Comparison by Store</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stores.map((store) => (
                  <div key={store.id} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center mb-2">
                      <HIcon icon={MapPinIcon} size={16} className="text-primary-600 mr-2"  />
                      <span className="font-semibold text-gray-900">{store.name}</span>
                    </div>
                    <p className="text-2xl font-bold text-primary-600 mb-1">
                      ₵{store.monthlySales.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Monthly Sales</p>
                    <button
                      onClick={() => {
                        setSelectedStore(store.id)
                        setActiveTab('sales')
                      }}
                      className="mt-3 text-sm text-primary-600 hover:underline"
                    >
                      View Details →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inventory Drill-Down Tab */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Inventory Analysis - {selectedStore === 'all' ? 'All Stores' : stores.find(s => s.id === selectedStore)?.name}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Inventory by Category</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={currentInventoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {currentInventoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Inventory Details</h4>
                <div className="space-y-3">
                  {currentInventoryData.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{item.category}</span>
                        <span className="text-primary-600 font-bold">₵{item.value.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <HIcon icon={Package01Icon} size={14} className="mr-1"  />
                        Quantity: {item.quantity.toLocaleString()} units
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Inventory by Store Comparison */}
          {selectedStore === 'all' && (
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Inventory Comparison by Store</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Store</th>
                      {inventoryDataByStore.all.map((item, index) => (
                        <th key={index} className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                          {item.category}
                        </th>
                      ))}
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map((store) => {
                      const storeInventory = inventoryDataByStore[store.id] || []
                      const totalValue = storeInventory.reduce((sum, item) => sum + item.value, 0)
                      return (
                        <tr key={store.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{store.name}</td>
                          {inventoryDataByStore.all.map((categoryItem, index) => {
                            const storeItem = storeInventory.find(i => i.category === categoryItem.category)
                            return (
                              <td key={index} className="py-3 px-4 text-right text-sm text-gray-700">
                                {storeItem ? `₵${storeItem.value.toLocaleString()}` : '-'}
                              </td>
                            )
                          })}
                          <td className="py-3 px-4 text-right font-semibold text-gray-900">
                            ₵{totalValue.toLocaleString()}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inventory Transfers Tab */}
      {activeTab === 'transfers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Inventory Transfers</h3>
            <button
              onClick={() => setShowTransferModal(true)}
              className="btn-primary flex items-center"
            >
              <HIcon icon={Add01Icon} size={18} className="mr-2"  />
              Create Transfer
            </button>
          </div>

          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Transfer #</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">From Store</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">To Store</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Initiated By</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((transfer) => (
                    <tr key={transfer.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{transfer.transferNumber}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{transfer.fromStore}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{transfer.toStore}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{transfer.product}</td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">{transfer.quantity}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{transfer.date}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          transfer.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : transfer.status === 'in-transit'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {transfer.status === 'completed' && <HIcon icon={CheckmarkCircle02Icon} size={12} className="inline mr-1"  />}
                          {transfer.status === 'in-transit' && <HIcon icon={Clock01Icon} size={12} className="inline mr-1"  />}
                          {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{transfer.initiatedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Add Store Modal */}
      {showAddStoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gray-900 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-primary-500 p-2 rounded-lg mr-3">
                    <HIcon icon={Store01Icon} size={24} className="text-white"  />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Add New Store</h3>
                    <p className="text-sm text-gray-400 mt-1">Create a new store location</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddStoreModal(false)} 
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  <HIcon icon={Cancel01Icon} size={24}  />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Store Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <HIcon icon={Store01Icon} size={16} className="text-primary-600 mr-2"  />
                    Store Name <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newStore.name}
                      onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                      className="input-field pl-10 w-full"
                      placeholder="e.g., New Branch - Location"
                    />
                    <HIcon icon={Store01Icon} size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"  />
                  </div>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <HIcon icon={MapPinIcon} size={16} className="text-primary-600 mr-2"  />
                    Address <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newStore.address}
                      onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                      className="input-field pl-10 w-full"
                      placeholder="Full street address"
                    />
                    <HIcon icon={MapPinIcon} size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"  />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <HIcon icon={CallIcon} size={16} className="text-primary-600 mr-2"  />
                    Phone Number <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={newStore.phone}
                      onChange={(e) => setNewStore({ ...newStore, phone: e.target.value })}
                      className="input-field pl-10 w-full"
                      placeholder="+233 XX XXX XXXX"
                    />
                    <HIcon icon={CallIcon} size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"  />
                  </div>
                </div>

                {/* Manager */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <HIcon icon={UserIcon} size={16} className="text-primary-600 mr-2"  />
                    Manager Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newStore.manager}
                      onChange={(e) => setNewStore({ ...newStore, manager: e.target.value })}
                      className="input-field pl-10 w-full"
                      placeholder="Manager full name"
                    />
                    <HIcon icon={UserIcon} size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"  />
                  </div>
                </div>

                {/* Opening Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <HIcon icon={Calendar01Icon} size={16} className="text-primary-600 mr-2"  />
                    Opening Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={newStore.openingDate}
                      onChange={(e) => setNewStore({ ...newStore, openingDate: e.target.value })}
                      className="input-field pl-10 w-full"
                    />
                    <HIcon icon={Calendar01Icon} size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"  />
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-primary-50 border-l-4 border-primary-500 rounded-lg">
                <div className="flex items-start">
                  <HIcon icon={AlertCircleIcon} size={20} className="text-primary-600 mr-3 mt-0.5"  />
                  <div>
                    <p className="text-sm font-medium text-primary-900">Store Information</p>
                    <p className="text-xs text-primary-700 mt-1">
                      All fields marked with <span className="text-red-500">*</span> are required. 
                      The store will be set to active status by default.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 mt-6 border-t">
                <button 
                  onClick={() => setShowAddStoreModal(false)} 
                  className="btn-secondary flex-1 flex items-center justify-center"
                >
                  <HIcon icon={Cancel01Icon} size={18} className="mr-2"  />
                  Cancel
                </button>
                <button 
                  onClick={handleAddStore} 
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  <HIcon icon={Add01Icon} size={18} className="mr-2"  />
                  Add Store
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-3">
                    <HIcon icon={ArrowDataTransferHorizontalIcon} size={24} className="text-white"  />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Create Inventory Transfer</h3>
                    <p className="text-sm text-green-100 mt-1">Transfer products between stores</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowTransferModal(false)} 
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  <HIcon icon={Cancel01Icon} size={24}  />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* From Store */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <HIcon icon={Store01Icon} size={16} className="text-red-500 mr-2"  />
                    From Store <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={newTransfer.fromStore}
                      onChange={(e) => setNewTransfer({ ...newTransfer, fromStore: e.target.value })}
                      className="input-field pl-10 w-full appearance-none"
                    >
                      <option value="">Select source store...</option>
                      {stores.map((store) => (
                        <option key={store.id} value={store.name}>{store.name}</option>
                      ))}
                    </select>
                    <HIcon icon={Store01Icon} size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"  />
                  </div>
                  {newTransfer.fromStore && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <HIcon icon={MapPinIcon} size={12} className="mr-1"  />
                      {stores.find(s => s.name === newTransfer.fromStore)?.address}
                    </p>
                  )}
                </div>

                {/* To Store */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <HIcon icon={Store01Icon} size={16} className="text-green-500 mr-2"  />
                    To Store <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={newTransfer.toStore}
                      onChange={(e) => setNewTransfer({ ...newTransfer, toStore: e.target.value })}
                      className="input-field pl-10 w-full appearance-none"
                      disabled={!newTransfer.fromStore}
                    >
                      <option value="">Select destination store...</option>
                      {stores
                        .filter(store => store.name !== newTransfer.fromStore)
                        .map((store) => (
                          <option key={store.id} value={store.name}>{store.name}</option>
                        ))}
                    </select>
                    <HIcon icon={Store01Icon} size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"  />
                  </div>
                  {newTransfer.toStore && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <HIcon icon={MapPinIcon} size={12} className="mr-1"  />
                      {stores.find(s => s.name === newTransfer.toStore)?.address}
                    </p>
                  )}
                </div>

                {/* Transfer Arrow Visual */}
                {newTransfer.fromStore && newTransfer.toStore && (
                  <div className="md:col-span-2 flex items-center justify-center py-2">
                    <div className="flex items-center bg-gray-50 rounded-lg px-4 py-2 rounded-lg">
                      <div className="text-center">
                        <p className="text-xs font-medium text-gray-600 mb-1">From</p>
                        <p className="text-sm font-semibold text-red-600">{newTransfer.fromStore}</p>
                      </div>
                      <HIcon icon={ArrowDataTransferHorizontalIcon} size={24} className="mx-4 text-primary-600"  />
                      <div className="text-center">
                        <p className="text-xs font-medium text-gray-600 mb-1">To</p>
                        <p className="text-sm font-semibold text-green-600">{newTransfer.toStore}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Product */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <HIcon icon={Package01Icon} size={16} className="text-primary-600 mr-2"  />
                    Product Name <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newTransfer.product}
                      onChange={(e) => setNewTransfer({ ...newTransfer, product: e.target.value })}
                      className="input-field pl-10 w-full"
                      placeholder="Enter product name or scan barcode"
                    />
                    <HIcon icon={Package01Icon} size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"  />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">You can search by product name or scan barcode</p>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <HIcon icon={ShoppingCart01Icon} size={16} className="text-primary-600 mr-2"  />
                    Quantity <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={newTransfer.quantity}
                      onChange={(e) => setNewTransfer({ ...newTransfer, quantity: e.target.value })}
                      className="input-field pl-10 w-full"
                      placeholder="0"
                      min="1"
                    />
                    <HIcon icon={ShoppingCart01Icon} size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"  />
                  </div>
                </div>

                {/* Transfer Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <HIcon icon={Calendar01Icon} size={16} className="text-primary-600 mr-2"  />
                    Transfer Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="input-field pl-10 w-full"
                    />
                    <HIcon icon={Calendar01Icon} size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"  />
                  </div>
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <HIcon icon={FileValidationIcon} size={16} className="text-primary-600 mr-2"  />
                    Notes (Optional)
                  </label>
                  <textarea
                    value={newTransfer.notes}
                    onChange={(e) => setNewTransfer({ ...newTransfer, notes: e.target.value })}
                    className="input-field w-full"
                    rows="4"
                    placeholder="Add any additional notes or instructions for this transfer..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Include any special handling instructions or reasons for transfer</p>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                <div className="flex items-start">
                  <HIcon icon={AlertCircleIcon} size={20} className="text-green-600 mr-3 mt-0.5"  />
                  <div>
                    <p className="text-sm font-medium text-green-900">Transfer Information</p>
                    <p className="text-xs text-green-700 mt-1">
                      The transfer will be marked as "Pending" initially. Once the receiving store confirms receipt, 
                      the status will be updated to "Completed". All transfers are tracked in the transfer history.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 mt-6 border-t">
                <button 
                  onClick={() => setShowTransferModal(false)} 
                  className="btn-secondary flex-1 flex items-center justify-center"
                >
                  <HIcon icon={Cancel01Icon} size={18} className="mr-2"  />
                  Cancel
                </button>
                <button 
                  onClick={handleCreateTransfer} 
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all ${
                    !newTransfer.fromStore || !newTransfer.toStore || !newTransfer.product || !newTransfer.quantity
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                  }`}
                  disabled={!newTransfer.fromStore || !newTransfer.toStore || !newTransfer.product || !newTransfer.quantity}
                >
                  <HIcon icon={ArrowDataTransferHorizontalIcon} size={18} className="mr-2"  />
                  Create Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Store Details Modal */}
      {showStoreDetailsModal && selectedStoreDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Store Details</h3>
              <button onClick={() => setShowStoreDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <HIcon icon={Cancel01Icon} size={24}  />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                  <p className="text-gray-900 font-semibold">{selectedStoreDetails.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-semibold">
                    {selectedStoreDetails.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <p className="text-gray-900">{selectedStoreDetails.address}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-gray-900">{selectedStoreDetails.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                  <p className="text-gray-900">{selectedStoreDetails.manager}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opening Date</label>
                  <p className="text-gray-900">{selectedStoreDetails.openingDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Sales</label>
                  <p className="text-gray-900 font-bold text-lg">₵{selectedStoreDetails.totalSales.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inventory Value</label>
                  <p className="text-gray-900 font-bold text-lg">₵{selectedStoreDetails.totalInventory.toLocaleString()}</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <button
                  onClick={() => {
                    setSelectedStore(selectedStoreDetails.id)
                    setActiveTab('sales')
                    setShowStoreDetailsModal(false)
                  }}
                  className="btn-primary w-full"
                >
                  View Sales Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MultiStore

