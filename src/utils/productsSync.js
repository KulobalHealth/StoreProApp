/**
 * Cross-page / cross-tab product list invalidation.
 * Inventory (and other mutators) call notifyProductsUpdated() after create/update/delete.
 * POS (and other readers) subscribe via onProductsUpdated() to refetch.
 */

export const PRODUCTS_UPDATED_EVENT = 'awosel:products-updated'
const PRODUCTS_UPDATED_KEY = 'awosel_products_updated_at'

/** Call after any product create / update / delete / stock change. */
export function notifyProductsUpdated() {
  const stamp = String(Date.now())
  try {
    localStorage.setItem(PRODUCTS_UPDATED_KEY, stamp)
  } catch {
    /* ignore quota / private mode */
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PRODUCTS_UPDATED_EVENT, { detail: { at: stamp } }))
  }
}

/**
 * Subscribe to product list changes (same-tab CustomEvent + cross-tab storage).
 * Returns an unsubscribe function.
 */
export function onProductsUpdated(callback) {
  if (typeof window === 'undefined' || typeof callback !== 'function') {
    return () => {}
  }

  const handleCustom = () => callback()
  const handleStorage = (e) => {
    if (e.key === PRODUCTS_UPDATED_KEY) callback()
  }

  window.addEventListener(PRODUCTS_UPDATED_EVENT, handleCustom)
  window.addEventListener('storage', handleStorage)

  return () => {
    window.removeEventListener(PRODUCTS_UPDATED_EVENT, handleCustom)
    window.removeEventListener('storage', handleStorage)
  }
}
