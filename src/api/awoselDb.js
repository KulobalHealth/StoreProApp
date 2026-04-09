/**
 * Awosel API: uses fetch to backend. VITE_API_URL should include /api (e.g. https://host.com/api).
 * Paths are relative to that base: /auth/register, /login, /settings, /products, etc.
 */
const API_BASE = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env.VITE_API_URL || '') : ''
const REQUEST_TIMEOUT = 30000 // 30 second timeout

/** Sanitize a path segment to prevent path traversal / injection */
function sanitizePath(segment) {
  if (segment == null) return ''
  return String(segment).replace(/[^a-zA-Z0-9_\-.:@]/g, '')
}

async function fetchApi(method, path, body = undefined) {
  const token = localStorage.getItem('token')
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  const opts = {
    method,
    signal: controller.signal,
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {})
    }
  }
  if (body !== undefined) {
    opts.body = JSON.stringify(body)
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, opts)
    clearTimeout(timeoutId)
    const data = await res.json().catch(() => ({}))

    // Auto-logout on 401 Unauthorized (expired/invalid token)
    if (res.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('isAuthenticated')
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
      throw new Error('Session expired. Please login again.')
    }

    if (!res.ok) {
      // Extract the most detailed error message available
      let msg = data.error || data.message || res.statusText || 'Request failed'
      // Some backends return an array of validation errors
      if (Array.isArray(data.errors) && data.errors.length) {
        msg = data.errors.map(e => (typeof e === 'string' ? e : e.message || e.msg || JSON.stringify(e))).join('. ')
      } else if (data.details) {
        msg = typeof data.details === 'string' ? data.details : JSON.stringify(data.details)
      }
      throw new Error(msg)
    }
    return data
  } catch (err) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.')
    }
    throw err
  }
}

// ---- Auth ----
export async function register(body) {
  return fetchApi('POST', '/auth/register', body)
}

export async function login(body) {
  return fetchApi('POST', '/auth/login', body)
}

export async function getProfile() {
  return fetchApi('GET', '/auth/profile')
}

// ---- Branches ----
export async function listBranches() {
  return fetchApi('GET', '/branches')
}

export async function createBranch(body) {
  return fetchApi('POST', '/branches', body)
}

// ---- Settings ----
export async function getSettings() {
  return fetchApi('GET', '/settings')
}

export async function updateSettings(body) {
  return fetchApi('PUT', '/settings', body)
}

// ---- Employees ----
export async function listEmployees(branchId) {
  return fetchApi('GET', `/employees/branch/${sanitizePath(branchId)}`)
}

export async function createEmployee(body) {
  return fetchApi('POST', '/employees', body)
}

export async function updateEmployee(id, body) {
  return fetchApi('PATCH', `/employees/${sanitizePath(id)}`, body)
}

export async function deleteEmployee(id) {
  return fetchApi('DELETE', `/employees/${sanitizePath(id)}`)
}

// ---- Products ----
export async function listProducts(query = {}) {
  const params = new URLSearchParams(query)
  return fetchApi('GET', '/products?' + params.toString())
}

export async function listProductsByBranch(branchId) {
  return fetchApi('GET', `/products/branch/${sanitizePath(branchId)}`)
}

export async function getProduct(id) {
  return fetchApi('GET', '/products/' + sanitizePath(id))
}

export async function createProduct(body) {
  return fetchApi('POST', '/products/single', body)
}

export async function updateProduct(id, body) {
  return fetchApi('PATCH', '/products/' + sanitizePath(id), body)
}

export async function deleteProduct(id) {
  return fetchApi('DELETE', '/products/' + sanitizePath(id))
}

export async function bulkImportProducts(body) {
  return fetchApi('POST', '/products/bulk', body)
}

export async function listProductUnits(productId) {
  return fetchApi('GET', '/products/' + sanitizePath(productId) + '/units')
}

export async function addProductUnit(productId, body) {
  return fetchApi('POST', '/products/' + sanitizePath(productId) + '/units', body)
}

export async function updateProductUnit(productId, unitId, body) {
  return fetchApi('PUT', '/products/' + sanitizePath(productId) + '/units/' + sanitizePath(unitId), body)
}

export async function deleteProductUnit(productId, unitId) {
  return fetchApi('DELETE', '/products/' + sanitizePath(productId) + '/units/' + sanitizePath(unitId))
}

// ---- Suppliers ----
export async function listSuppliers(branchId) {
  return fetchApi('GET', '/suppliers/branch/' + sanitizePath(branchId))
}

export async function listSuppliersByBranch(branchId) {
  return fetchApi('GET', '/suppliers/branch/' + sanitizePath(branchId))
}

export async function getSupplier(id, query = {}) {
  const params = new URLSearchParams(query)
  const qs = params.toString()
  return fetchApi('GET', '/suppliers/details/' + sanitizePath(id) + (qs ? '?' + qs : ''))
}

export async function createSupplier(body) {
  return fetchApi('POST', '/suppliers/create', body)
}

export async function updateSupplier(id, body) {
  return fetchApi('PUT', '/suppliers/' + sanitizePath(id), body)
}

export async function deleteSupplier(id) {
  return fetchApi('DELETE', '/suppliers/' + sanitizePath(id))
}

export async function postDebtPayment(supplierId, body) {
  return fetchApi('POST', '/suppliers/' + sanitizePath(supplierId) + '/debt-payment', body)
}

export async function listDebtPayments(supplierId) {
  return fetchApi('GET', '/suppliers/' + sanitizePath(supplierId) + '/debt-payments')
}

// ---- Payments ----
export async function initiatePayment(body) {
  return fetchApi('POST', '/payments/initiate', body)
}

export async function verifyPayment(body) {
  return fetchApi('POST', '/payments/verify', body)
}

// ---- Stock receipts ----
export async function listReceipts(branchId, query = {}) {
  const params = new URLSearchParams({ ...query, ...(branchId ? { branchId } : {}) })
  return fetchApi('GET', '/stock-receipts?' + params.toString())
}

export async function createReceipt(body) {
  return fetchApi('POST', '/stock-receipts', body)
}

export async function createReceiptBulk(body) {
  return fetchApi('POST', '/stock-receipts/items/bulk', body)
}

export async function getReceipt(id) {
  return fetchApi('GET', '/stock-receipts/' + sanitizePath(id))
}

export async function getReceivedStock(branchId, receiptId) {
  const params = new URLSearchParams({ branchId: sanitizePath(branchId) })
  if (receiptId) params.set('receiptId', sanitizePath(receiptId))
  return fetchApi('GET', '/stock-receipts/received?' + params.toString())
}

export async function addReceiptItem(receiptId, body) {
  return fetchApi('POST', '/stock-receipts/' + sanitizePath(receiptId) + '/items', body)
}

export async function receiveReceipt(body) {
  return fetchApi('POST', '/stock-receipts/receive', body)
}

export async function deleteReceipt(id) {
  return fetchApi('DELETE', '/stock-receipts/' + sanitizePath(id))
}

/** Detect if a value looks like a UUID (contains hyphens and hex chars) */
function isUUID(val) {
  return typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)
}

// ---- Sales ----
export async function listSales(query = {}) {
  const params = new URLSearchParams()
  if (query.branch_id) {
    // Backend accepts the branch UUID in branch_id param
    params.set('branch_id', query.branch_id)
  }
  if (query.date) params.set('date', query.date)
  if (query.year) params.set('year', query.year)
  if (query.month) params.set('month', query.month)
  if (query.user_id) params.set('user_id', query.user_id)
  if (query.cashier_id) params.set('cashier_id', query.cashier_id)
  if (query.start_date) params.set('start_date', query.start_date)
  if (query.end_date) params.set('end_date', query.end_date)
  if (query.period) params.set('period', query.period)
  const qs = params.toString()
  return fetchApi('GET', '/sales' + (qs ? '?' + qs : ''))
}

export async function createSale(body) {
  return fetchApi('POST', '/sales', body)
}

export async function getSalesDashboard(branchId) {
  return fetchApi('GET', '/sales/dashboard?branch_id=' + encodeURIComponent(branchId))
}

export async function getCashierSales(branchId, { period, date, start_date, end_date } = {}) {
  let url = '/sales/cashiers?branch_id=' + encodeURIComponent(branchId)
  if (start_date && end_date) {
    url += '&start_date=' + encodeURIComponent(start_date) + '&end_date=' + encodeURIComponent(end_date)
  } else if (date) {
    url += '&date=' + encodeURIComponent(date)
  } else if (period) {
    url += '&period=' + encodeURIComponent(period)
  }
  return fetchApi('GET', url)
}

// ---- Customers ----
export async function listCustomers(branchId, query = {}) {
  if (!branchId) throw new Error('branchId is required to list customers')
  const q = query.q ? '?q=' + encodeURIComponent(query.q) : ''
  return fetchApi('GET', '/customers/branch/' + sanitizePath(branchId) + q)
}

export async function getCustomer(id) {
  return fetchApi('GET', '/customers/' + sanitizePath(id))
}

export async function createCustomer(body) {
  return fetchApi('POST', '/customers', body)
}

export async function updateCustomer(id, body) {
  return fetchApi('PUT', '/customers/' + sanitizePath(id), body)
}

export async function deleteCustomer(id) {
  return fetchApi('DELETE', '/customers/' + sanitizePath(id))
}

// ---- Held sales ----
export async function listHeldSales(branchId) {
  return fetchApi('GET', '/held-sales/' + sanitizePath(branchId))
}

export async function createHeldSale(body) {
  return fetchApi('POST', '/held-sales', body)
}

export async function deleteHeldSale(id) {
  return fetchApi('DELETE', '/held-sales/' + sanitizePath(id))
}
