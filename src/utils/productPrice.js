/**
 * Resolve the sell price the same way everywhere (Inventory + POS).
 *
 * The edit form treats the base-unit row as canonical. The API sometimes updates
 * `units[].unit_price` while leaving top-level `selling_price` stale (or the reverse).
 * Prefer the base unit price when present so POS never shows an older top-level value.
 */
export function resolveProductPrice(product) {
  if (!product || typeof product !== 'object') return 0

  const baseUnit = String(product.base_unit || product.baseUnit || 'piece').toLowerCase()
  const units = Array.isArray(product.units)
    ? product.units
    : (Array.isArray(product.product_units) ? product.product_units : [])

  const toNum = (value) => {
    if (value == null || value === '') return null
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  }

  let baseUnitPrice = null
  if (units.length > 0) {
    const baseRow = units.find((u) => {
      const name = String(u.unit_name || u.unit || '').toLowerCase()
      const conv = toNum(u.conversion_quantity ?? u.conversion ?? u.base_quantity) ?? 1
      return name === baseUnit && conv === 1
    }) || units.find((u) => (toNum(u.conversion_quantity ?? u.conversion ?? u.base_quantity) ?? 1) === 1) || units[0]

    baseUnitPrice = toNum(baseRow?.unit_price ?? baseRow?.price)
  }

  const topLevel = toNum(
    product.selling_price ?? product.sellingPrice ?? product.price
  )

  // Base unit is canonical when present; otherwise top-level selling price
  return baseUnitPrice ?? topLevel ?? 0
}

export function resolveProductCost(product) {
  if (!product || typeof product !== 'object') return 0

  const baseUnit = String(product.base_unit || product.baseUnit || 'piece').toLowerCase()
  const units = Array.isArray(product.units)
    ? product.units
    : (Array.isArray(product.product_units) ? product.product_units : [])

  const toNum = (value) => {
    if (value == null || value === '') return null
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  }

  let baseUnitCost = null
  if (units.length > 0) {
    const baseRow = units.find((u) => {
      const name = String(u.unit_name || u.unit || '').toLowerCase()
      const conv = toNum(u.conversion_quantity ?? u.conversion ?? u.base_quantity) ?? 1
      return name === baseUnit && conv === 1
    }) || units.find((u) => (toNum(u.conversion_quantity ?? u.conversion ?? u.base_quantity) ?? 1) === 1) || units[0]

    baseUnitCost = toNum(baseRow?.cost_price ?? baseRow?.cost)
  }

  const topLevel = toNum(product.cost_price ?? product.costPrice ?? product.cost)
  return baseUnitCost ?? topLevel ?? 0
}
