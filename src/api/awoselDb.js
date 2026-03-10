/**
 * Awosel API: uses fetch to backend. VITE_API_URL should include /api (e.g. https://host.com/api).
 * Paths are relative to that base: /auth/register, /login, /settings, /products, etc.
 */
const API_BASE = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env.VITE_API_URL || '') : ''

async function fetchApi(method, path, body = undefined) {
  const token = localStorage.getItem('token')
  const opts = {
    method,
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {})
    }
  }
  if (body !== undefined) {
    opts.body = JSON.stringify(body)
  }
  const res = await fetch(`${API_BASE}${path}`, opts)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || data.message || res.statusText || 'Request failed')
  return data
}

// ---- Auth ----
export async function register(body) {
  return fetchApi('POST', '/auth/register', body)
}

export async function login(body) {
  return fetchApi('POST', '/auth/login', body)
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
  return fetchApi('GET', `/employees/branch/${branchId}`)
}

export async function createEmployee(body) {
  return fetchApi('POST', '/employees', body)
}

export async function updateEmployee(id, body) {
  return fetchApi('PATCH', `/employees/${id}`, body)
}

export async function deleteEmployee(id) {
  return fetchApi('DELETE', `/employees/${id}`)
}

// ---- Products ----
export async function listProducts(query = {}) {
  const params = new URLSearchParams(query)
  return fetchApi('GET', '/products?' + params.toString())
}

export async function listProductsByBranch(branchId) {
  return fetchApi('GET', `/products/branch/${branchId}`)
}

export async function getProduct(id) {
  return fetchApi('GET', '/products/' + id)
}

export async function createProduct(body) {
  return fetchApi('POST', '/products/single', body)
}

export async function updateProduct(id, body) {
  return fetchApi('PUT', '/products/' + id, body)
}

export async function deleteProduct(id) {
  return fetchApi('DELETE', '/products/' + id)
}

export async function bulkImportProducts(body) {
  return fetchApi('POST', '/products/bulk', body)
}

export async function listProductUnits(productId) {
  return fetchApi('GET', '/products/' + productId + '/units')
}

export async function addProductUnit(productId, body) {
  return fetchApi('POST', '/products/' + productId + '/units', body)
}

export async function updateProductUnit(productId, unitId, body) {
  return fetchApi('PUT', '/products/' + productId + '/units/' + unitId, body)
}

export async function deleteProductUnit(productId, unitId) {
  return fetchApi('DELETE', '/products/' + productId + '/units/' + unitId)
}

// ---- Suppliers ----
export async function listSuppliers(branchId) {
  return fetchApi('GET', '/suppliers/branch/' + branchId)
}

export async function getSupplier(id) {
  return fetchApi('GET', '/suppliers/' + id)
}

export async function createSupplier(body) {
  return fetchApi('POST', '/suppliers/create', body)
}

export async function updateSupplier(id, body) {
  return fetchApi('PUT', '/suppliers/' + id, body)
}

export async function deleteSupplier(id) {
  return fetchApi('DELETE', '/suppliers/' + id)
}

export async function postDebtPayment(supplierId, body) {
  return fetchApi('POST', '/suppliers/' + supplierId + '/debt-payment', body)
}

export async function listDebtPayments(supplierId) {
  return fetchApi('GET', '/suppliers/' + supplierId + '/debt-payments')
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
  return fetchApi('GET', '/stock-receipts/' + id)
}

export async function addReceiptItem(receiptId, body) {
  return fetchApi('POST', '/stock-receipts/' + receiptId + '/items', body)
}

export async function receiveReceipt(body) {
  return fetchApi('POST', '/stock-receipts/receive', body)
}

// ---- Sales ----
export async function listSales() {
  return fetchApi('GET', '/sales')
}

export async function createSale(body) {
  return fetchApi('POST', '/sales', body)
}

// ---- Customers ----
export async function listCustomers(branchId, query = {}) {
  if (!branchId) throw new Error('branchId is required to list customers')
  const q = query.q ? '?q=' + encodeURIComponent(query.q) : ''
  return fetchApi('GET', '/customers/branch/' + branchId + q)
}

export async function getCustomer(id) {
  return fetchApi('GET', '/customers/' + id)
}

export async function createCustomer(body) {
  return fetchApi('POST', '/customers', body)
}

export async function updateCustomer(id, body) {
  return fetchApi('PUT', '/customers/' + id, body)
}

export async function deleteCustomer(id) {
  return fetchApi('DELETE', '/customers/' + id)
}

// ---- Held sales ----
export async function listHeldSales() {
  return fetchApi('GET', '/held-sales')
}

export async function createHeldSale(body) {
  return fetchApi('POST', '/held-sales', body)
}

export async function deleteHeldSale(id) {
  return fetchApi('DELETE', '/held-sales/' + encodeURIComponent(id))
}
