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
const RoleGuard = ({ blockedRoles = [], allowedRoles = [], children }) => {
  try {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}')
    const role = (savedUser.role || '').toLowerCase()

    // If allowedRoles is specified, only those roles may access
    if (allowedRoles.length > 0 && !allowedRoles.map(r => r.toLowerCase()).includes(role)) {
      // Sales users go straight to POS; others to branch-dashboard
      const fallback = role === 'sales' ? '/pos' : '/branch-dashboard'
      return <Navigate to={fallback} replace />
    }

    // If blockedRoles is specified, those roles are denied
    if (blockedRoles.length > 0 && blockedRoles.map(r => r.toLowerCase()).includes(role)) {
      const fallback = role === 'sales' ? '/pos' : '/branch-dashboard'
      return <Navigate to={fallback} replace />
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
                <Route path="/dashboard" element={<RoleGuard blockedRoles={['sales']}><ActivityDashboard /></RoleGuard>} />
                <Route path="/" element={<Layout />}>
                  <Route path="branch-dashboard" element={<RoleGuard blockedRoles={['sales']}><BranchDashboard /></RoleGuard>} />
                  <Route index element={<Navigate to="/branch-dashboard" replace />} />
                  <Route path="pos" element={<POS />} />
                  <Route path="sales" element={<RoleGuard blockedRoles={['manager', 'sales']}><SalesHistory /></RoleGuard>} />
                  <Route path="inventory" element={<RoleGuard blockedRoles={['sales']}><Inventory /></RoleGuard>} />
                  <Route path="purchase-orders/:id" element={<RoleGuard blockedRoles={['sales']}><PurchaseOrderDetail /></RoleGuard>} />
                  <Route path="settings" element={<RoleGuard blockedRoles={['sales']}><Settings /></RoleGuard>} />
                  <Route path="users" element={<RoleGuard blockedRoles={['sales']}><Users /></RoleGuard>} />
                  <Route path="customers" element={<RoleGuard blockedRoles={['sales']}><Customers /></RoleGuard>} />
                  <Route path="suppliers" element={<RoleGuard blockedRoles={['sales']}><Suppliers /></RoleGuard>} />
                  <Route path="suppliers/:id" element={<RoleGuard blockedRoles={['sales']}><SupplierDetail /></RoleGuard>} />
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

