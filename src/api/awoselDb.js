/**
 * Awosel API: uses fetch to backend. VITE_API_URL should include /api (e.g. https://host.com/api).
 * Paths are relative to that base: /auth/register, /login, /settings, /products, etc.
 */
// Fall back to the known production backend when VITE_API_URL isn't provided at
// build time (e.g. the env var wasn't set in the Vercel project). Without this,
// an empty base makes requests hit the frontend host itself and fail with a
// generic "Request failed".
const DEFAULT_API_BASE = 'https://pos-backend-api-11gm.onrender.com/api'
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || DEFAULT_API_BASE
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
    // Prevent browsers / CDNs from serving a stale product list after inventory edits
    cache: 'no-store',
    signal: controller.signal,
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
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
      let msg = data.error || data.message || res.statusText || `Request failed (${res.status})`
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

export async function listProductsByBranch(branchId, query = {}) {
  // API rejects limit > 500 — page through until every product is loaded
  const PAGE_SIZE = 500
  const limit = Math.min(PAGE_SIZE, Math.max(1, Number(query.limit) || PAGE_SIZE))
  const singlePage = query.page != null || query.offset != null || query.fetchAll === false

  const buildParams = (extra = {}) => {
    const params = new URLSearchParams({ _: String(Date.now()), limit: String(limit) })
    Object.entries({ ...query, ...extra }).forEach(([key, value]) => {
      if (key === 'limit' || key === 'fetchAll' || value == null || value === '') return
      params.set(key, String(value))
    })
    return params
  }

  const extractList = (res) => {
    const root = res?.data ?? res
    if (Array.isArray(root)) return root
    if (Array.isArray(root?.products)) return root.products
    if (Array.isArray(root?.data)) return root.data
    if (Array.isArray(root?.items)) return root.items
    if (Array.isArray(root?.rows)) return root.rows
    if (Array.isArray(res?.products)) return res.products
    return []
  }

  const extractTotal = (res) => {
    const root = res?.data ?? res
    const total = root?.total ?? root?.totalCount ?? root?.count ?? root?.meta?.total ?? res?.total
    const n = Number(total)
    return Number.isFinite(n) ? n : null
  }

  const productKey = (p) => {
    const id = p?.uuid || p?.id
    return id != null && id !== '' ? String(id) : null
  }

  if (singlePage) {
    const res = await fetchApi('GET', `/products/branch/${sanitizePath(branchId)}?${buildParams().toString()}`)
    return res
  }

  const all = []
  const seen = new Set()
  let page = 1
  let useOffset = false
  const maxPages = 200 // safety cap: 500 * 200 = 100k

  while (page <= maxPages) {
    const extra = useOffset
      ? { offset: String((page - 1) * limit) }
      : { page: String(page) }
    const res = await fetchApi(
      'GET',
      `/products/branch/${sanitizePath(branchId)}?${buildParams(extra).toString()}`
    )
    const list = extractList(res)
    if (!list.length) break

    let added = 0
    for (const product of list) {
      const key = productKey(product)
      if (key) {
        if (seen.has(key)) continue
        seen.add(key)
      }
      all.push(product)
      added += 1
    }

    // Page/offset param ignored by API (same rows again) — stop or switch strategy
    if (added === 0) {
      if (!useOffset && page === 2) {
        // Retry from page 1 using offset instead of page
        useOffset = true
        page = 2
        continue
      }
      break
    }

    const total = extractTotal(res)
    if (total != null && all.length >= total) break
    if (list.length < limit) break
    page += 1
  }

  return { data: all, products: all, total: all.length }
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

export async function getWallet() {
  return fetchApi('GET', '/wallet')
}

export async function listPayments() {
  return fetchApi('GET', '/payments')
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
