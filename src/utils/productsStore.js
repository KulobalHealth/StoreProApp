/**
 * Single source of truth for branch product lists across Inventory, POS, etc.
 *
 * Why this exists:
 * - Multiple concurrent fetches (mount / focus / visibility) used to race, so an
 *   older response could overwrite a newer one ("updates, then snaps back").
 * - Inventory mutations lived only in that page's local state; POS never shared them.
 *
 * Rules:
 * - Only the latest in-flight request for a branch may commit to the cache.
 * - Mutations write the fresh list into the cache directly (no waiting on POS refetch).
 * - Subscribers (POS, Inventory) render from this cache.
 */

import { listProductsByBranch } from '../api/awoselDb'
import { resolveProductPrice, resolveProductCost } from './productPrice'

/** Align top-level selling_price with base-unit price so POS/Inventory never diverge */
function normalizeProductRecord(product) {
  if (!product || typeof product !== 'object') return product
  const price = resolveProductPrice(product)
  const cost = resolveProductCost(product)
  return {
    ...product,
    selling_price: price,
    cost_price: cost,
  }
}

function normalizeProductList(products) {
  return (Array.isArray(products) ? products : []).map(normalizeProductRecord)
}

export const PRODUCTS_UPDATED_EVENT = 'awosel:products-updated'
const PRODUCTS_UPDATED_KEY = 'awosel_products_updated_at'

let cache = {
  branchId: null,
  products: [], // raw API product objects
  version: 0,
  updatedAt: 0,
}

/** After a local mutation, ignore network refreshes briefly so CDN/API lag can't snap UI back to old data */
let mutationGuardUntil = 0
const MUTATION_GUARD_MS = 30000

/**
 * Keep recently-created local rows when the API list is still lagging
 * (common right after POST /products/single).
 */
function mergeIncomingWithLocalCreates(branchId, incoming) {
  if (cache.branchId !== String(branchId) || !cache.products.length) return incoming
  const incomingIds = new Set(
    incoming.map((p) => String(p.uuid || p.id)).filter((id) => id && id !== 'undefined')
  )
  const localOnly = cache.products.filter((p) => {
    const id = String(p.uuid || p.id || '')
    const isLocalCreate = Boolean(p._localCreatedAt)
    const stillFresh = isLocalCreate && (Date.now() - Number(p._localCreatedAt) < 120000)
    const missingFromApi = !id || id === 'undefined' || !incomingIds.has(id)
    // Also match by name+sku when API hasn't assigned an id yet / id shape differs
    const matchedBySku = id && id !== 'undefined' && incomingIds.has(id)
      ? true
      : incoming.some((api) =>
          (p.sku && api.sku && String(p.sku) === String(api.sku)) ||
          (p.name && api.name && String(p.name).toLowerCase() === String(api.name).toLowerCase() &&
            String(p.barcode || '') === String(api.barcode || ''))
        )
    return stillFresh && missingFromApi && !matchedBySku
  })
  if (!localOnly.length) return incoming
  return [...localOnly, ...incoming]
}

/** @type {Map<string, { seq: number, promise: Promise<any[]> }>} */
const inflight = new Map()
/** Monotonic per-branch sequence so stale responses are discarded */
const seqByBranch = new Map()
const listeners = new Set()

function bumpSeq(branchId) {
  const next = (seqByBranch.get(branchId) || 0) + 1
  seqByBranch.set(branchId, next)
  return next
}

function currentSeq(branchId) {
  return seqByBranch.get(branchId) || 0
}

function emitLocal(reason = 'update') {
  const snapshot = getProductsSnapshot()
  listeners.forEach((fn) => {
    try { fn(snapshot) } catch (err) { console.error('productsStore listener error:', err) }
  })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PRODUCTS_UPDATED_EVENT, {
      detail: { ...snapshot, reason },
    }))
  }
}

function emitCrossTab() {
  try {
    localStorage.setItem(PRODUCTS_UPDATED_KEY, String(Date.now()))
  } catch {
    /* ignore */
  }
}

export function getProductsSnapshot() {
  return {
    branchId: cache.branchId,
    products: cache.products,
    version: cache.version,
    updatedAt: cache.updatedAt,
  }
}

export function getCachedProducts(branchId) {
  if (!branchId || cache.branchId !== String(branchId)) return null
  return cache.products
}

/**
 * Commit a fresh product list for a branch (from API fetch or post-mutation refetch).
 * Bumps the branch sequence so any older in-flight fetch cannot overwrite this.
 * Pass fromMutation: true after create/update/delete so brief network refreshes can't clobber it.
 */
export function setProductsForBranch(branchId, products, { broadcast = true, fromMutation = false } = {}) {
  if (!branchId) return
  const id = String(branchId)
  bumpSeq(id)
  cache = {
    branchId: id,
    products: normalizeProductList(products),
    version: cache.version + 1,
    updatedAt: Date.now(),
  }
  if (fromMutation) mutationGuardUntil = Date.now() + MUTATION_GUARD_MS
  inflight.delete(id)
  emitLocal(fromMutation ? 'mutation' : 'set')
  if (broadcast) emitCrossTab()
}

/** Invalidate cache so the next loadProductsForBranch hits the network. */
export function invalidateProductsCache(branchId) {
  if (branchId) {
    const id = String(branchId)
    bumpSeq(id)
    inflight.delete(id)
    if (cache.branchId === id) {
      cache = { branchId: null, products: [], version: cache.version + 1, updatedAt: Date.now() }
    }
  } else {
    bumpSeq(cache.branchId || '')
    inflight.clear()
    cache = { branchId: null, products: [], version: cache.version + 1, updatedAt: Date.now() }
  }
  emitLocal('invalidate')
  emitCrossTab()
}

/**
 * Load products for a branch. Dedupes concurrent callers and ignores stale responses.
 * @param {string} branchId
 * @param {{ force?: boolean }} [options] force=true bypasses memory cache (still dedupes in-flight)
 */
export async function loadProductsForBranch(branchId, { force = false } = {}) {
  if (!branchId) return []
  const id = String(branchId)

  if (!force) {
    const cached = getCachedProducts(id)
    if (cached) return cached
  }

  const existing = inflight.get(id)
  if (existing) return existing.promise

  const seq = bumpSeq(id)
  const promise = listProductsByBranch(id)
    .then((res) => {
      // A newer setProductsForBranch / load superseded this request
      if (seq !== currentSeq(id)) {
        return getCachedProducts(id) || []
      }
      // Mutation just wrote fresh data — don't let a lagging API/CDN response revert it
      if (Date.now() < mutationGuardUntil && cache.branchId === id && cache.products.length > 0) {
        return cache.products
      }
      const root = res?.data ?? res
      const incoming = normalizeProductList(
        Array.isArray(root)
          ? root
          : (root?.products || root?.data || root?.items || res?.products || [])
      )
      // Never drop a product that was just created locally but isn't in the API response yet
      const list = mergeIncomingWithLocalCreates(id, incoming)
      cache = {
        branchId: id,
        products: list,
        version: cache.version + 1,
        updatedAt: Date.now(),
      }
      emitLocal('fetch')
      return list
    })
    .finally(() => {
      const current = inflight.get(id)
      if (current && current.seq === seq) inflight.delete(id)
    })

  inflight.set(id, { seq, promise })
  return promise
}

/** Same-tab subscribers (React pages). */
export function subscribeProducts(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Cross-tab: other tabs wrote PRODUCTS_UPDATED_KEY.
 * Caller should force-reload for its active branch.
 */
export function onProductsUpdated(callback) {
  if (typeof window === 'undefined' || typeof callback !== 'function') return () => {}

  const handleCustom = (e) => callback(e.detail || getProductsSnapshot())
  const handleStorage = (e) => {
    if (e.key === PRODUCTS_UPDATED_KEY) callback({ crossTab: true })
  }

  window.addEventListener(PRODUCTS_UPDATED_EVENT, handleCustom)
  window.addEventListener('storage', handleStorage)
  return () => {
    window.removeEventListener(PRODUCTS_UPDATED_EVENT, handleCustom)
    window.removeEventListener('storage', handleStorage)
  }
}

/** @deprecated use setProductsForBranch after a successful mutation refetch */
export function notifyProductsUpdated() {
  emitLocal('notify')
  emitCrossTab()
}
