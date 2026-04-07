import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { NavigationHistoryProvider } from './contexts/NavigationHistory'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import { useAuth } from './contexts/AuthContext'

/* ─── Lazy-loaded pages (code-split into separate chunks) ─── */
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const LandingPage = lazy(() => import('./pages/LandingPage'))
const InventoryManagementPage = lazy(() => import('./pages/InventoryManagementPage'))
const InvoicingAccountingPage = lazy(() => import('./pages/InvoicingAccountingPage'))
const BusinessReportsPage = lazy(() => import('./pages/BusinessReportsPage'))
const PointOfSalePage = lazy(() => import('./pages/PointOfSalePage'))
const CreditCashflowManagementPage = lazy(() => import('./pages/CreditCashflowManagementPage'))
const OnlineOfflineSyncPage = lazy(() => import('./pages/OnlineOfflineSyncPage'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const DesktopDownload = lazy(() => import('./pages/DesktopDownload'))
const ActivityDashboard = lazy(() => import('./pages/ActivityDashboard'))
const BranchDashboard = lazy(() => import('./pages/BranchDashboard'))
const POS = lazy(() => import('./pages/POS'))
const Settings = lazy(() => import('./pages/Settings'))
const Inventory = lazy(() => import('./pages/Inventory'))
const ReceiveItems = lazy(() => import('./pages/ReceiveItems'))
const ReceiveHistory = lazy(() => import('./pages/ReceiveHistory'))
const Users = lazy(() => import('./pages/Users'))
const Suppliers = lazy(() => import('./pages/Suppliers'))
const SupplierDetail = lazy(() => import('./pages/SupplierDetail'))
const Customers = lazy(() => import('./pages/Customers'))
const Cashiers = lazy(() => import('./pages/Cashiers'))
const SalesHistory = lazy(() => import('./pages/SalesHistory'))
const Invoices = lazy(() => import('./pages/Invoices'))
const Reports = lazy(() => import('./pages/Reports'))
const ChequeManagement = lazy(() => import('./pages/ChequeManagement'))
const Warehouse = lazy(() => import('./pages/Warehouse'))
const SubscriptionSuccess = lazy(() => import('./pages/SaleSuccess'))
const PosSuccess = lazy(() => import('./pages/PosSuccess'))
const Billing = lazy(() => import('./pages/Billing'))
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'))

/* ─── Loading fallback ─── */
const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f9fafb' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#FF751F', borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 12px' }} />
      <p style={{ color: '#5a6a7e', fontSize: '0.85rem', fontFamily: 'Manrope, sans-serif' }}>Loading…</p>
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
)

// Role guard — blocks specific roles from accessing a route
// Uses AuthContext so the role is always in sync and can't be spoofed via localStorage
const RoleGuard = ({ blockedRoles = [], allowedRoles = [], children }) => {
  const { user } = useAuth()
  const role = (user?.role || '').toLowerCase()
  const fallback = role === 'sales' ? '/pos' : '/branch-dashboard'

  // If allowedRoles is specified, only those roles may access
  if (allowedRoles.length > 0 && !allowedRoles.map(r => r.toLowerCase()).includes(role)) {
    return <Navigate to={fallback} replace />
  }

  // If blockedRoles is specified, those roles are denied
  if (blockedRoles.length > 0 && blockedRoles.map(r => r.toLowerCase()).includes(role)) {
    return <Navigate to={fallback} replace />
  }

  return children
}

// Redirect index route based on role
const RoleAwareRedirect = () => {
  const { user } = useAuth()
  const role = (user?.role || '').toLowerCase()

  if (role === 'sales') return <Navigate to="/pos" replace />
  return <Navigate to="/branch-dashboard" replace />
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <NavigationHistoryProvider>
            <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes — Landing page is the home page */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/inventory-management" element={<InventoryManagementPage />} />
              <Route path="/point-of-sale" element={<PointOfSalePage />} />
              <Route path="/invoicing-accounting" element={<InvoicingAccountingPage />} />
              <Route path="/business-reports" element={<BusinessReportsPage />} />
              <Route path="/credit-cashflow-management" element={<CreditCashflowManagementPage />} />
              <Route path="/online-offline-sync" element={<OnlineOfflineSyncPage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<PrivacyPolicy />} />
              <Route path="/download" element={<DesktopDownload />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/welcome" element={<SubscriptionSuccess />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<RoleGuard blockedRoles={['sales']}><ActivityDashboard /></RoleGuard>} />
                <Route element={<Layout />}>
                  <Route path="/branch-dashboard" element={<RoleGuard blockedRoles={['sales']}><BranchDashboard /></RoleGuard>} />
                  <Route path="/pos" element={<POS />} />
                  <Route path="/pos-success" element={<PosSuccess />} />
                  <Route path="/sales" element={<RoleGuard blockedRoles={['manager', 'sales']}><SalesHistory /></RoleGuard>} />
                  <Route path="/invoices" element={<RoleGuard blockedRoles={['sales']}><Invoices /></RoleGuard>} />
                  <Route path="/reports" element={<RoleGuard blockedRoles={['sales']}><Reports /></RoleGuard>} />
                  <Route path="/cheque-management" element={<RoleGuard blockedRoles={['sales']}><ChequeManagement /></RoleGuard>} />
                  <Route path="/warehouse" element={<RoleGuard blockedRoles={['sales']}><Warehouse /></RoleGuard>} />
                  <Route path="/inventory" element={<RoleGuard blockedRoles={['sales']}><Inventory /></RoleGuard>} />
                  <Route path="/receive-items" element={<RoleGuard blockedRoles={['sales']}><ReceiveItems /></RoleGuard>} />
                  <Route path="/receive-history" element={<RoleGuard blockedRoles={['sales']}><ReceiveHistory /></RoleGuard>} />
                  <Route path="/settings" element={<RoleGuard blockedRoles={['sales']}><Settings /></RoleGuard>} />
                  <Route path="/billing" element={<RoleGuard blockedRoles={['sales']}><Billing /></RoleGuard>} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/users" element={<RoleGuard blockedRoles={['sales']}><Users /></RoleGuard>} />
                  <Route path="/customers" element={<RoleGuard blockedRoles={['sales']}><Customers /></RoleGuard>} />
                  <Route path="/cashiers" element={<RoleGuard blockedRoles={['sales']}><Cashiers /></RoleGuard>} />
                  <Route path="/suppliers" element={<RoleGuard blockedRoles={['sales']}><Suppliers /></RoleGuard>} />
                  <Route path="/suppliers/:id" element={<RoleGuard blockedRoles={['sales']}><SupplierDetail /></RoleGuard>} />
                </Route>
              </Route>

              {/* 404 catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Suspense>
          </NavigationHistoryProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App

