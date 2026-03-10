import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { NavigationHistoryProvider } from './contexts/NavigationHistory'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import ActivityDashboard from './pages/ActivityDashboard'
import BranchDashboard from './pages/BranchDashboard'
import POS from './pages/POS'
import Settings from './pages/Settings'
import Inventory from './pages/Inventory'
import PurchaseOrderDetail from './pages/PurchaseOrderDetail'
import Users from './pages/Users'
import Suppliers from './pages/Suppliers'
import SupplierDetail from './pages/SupplierDetail'
import Customers from './pages/Customers'
import SalesHistory from './pages/SalesHistory'

// Role guard — blocks specific roles from accessing a route
const RoleGuard = ({ blockedRoles = [], children }) => {
  try {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}')
    const role = (savedUser.role || '').toLowerCase()
    if (blockedRoles.map(r => r.toLowerCase()).includes(role)) {
      return <Navigate to="/branch-dashboard" replace />
    }
  } catch { /* allow through */ }
  return children
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <NavigationHistoryProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<ActivityDashboard />} />
                <Route path="/" element={<Layout />}>
                  <Route path="branch-dashboard" element={<BranchDashboard />} />
                  <Route index element={<Navigate to="/branch-dashboard" replace />} />
                  <Route path="pos" element={<POS />} />
                  <Route path="sales" element={<RoleGuard blockedRoles={['manager']}><SalesHistory /></RoleGuard>} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="purchase-orders/:id" element={<PurchaseOrderDetail />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="users" element={<Users />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="suppliers" element={<Suppliers />} />
                  <Route path="suppliers/:id" element={<SupplierDetail />} />
                </Route>
              </Route>
            </Routes>
          </NavigationHistoryProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App

