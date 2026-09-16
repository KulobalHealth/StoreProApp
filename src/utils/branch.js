/**
 * Get the active branch ID (uuid) for the current session.
 * Priority: localStorage active branch uuid → user data branch_id → JWT token branch_id
 * Works for all roles — managers have branch_id in their user/token, admins select a branch.
 */
export function getSessionBranchId() {
  // 1. Check the active branch selected in the UI — always prefer uuid over numeric id
  try {
    const saved = localStorage.getItem('awosel_active_branch')
    if (saved) {
      const branch = JSON.parse(saved)
      // Prefer uuid; fall back to id so POS and Inventory resolve the same branch
      if (branch?.uuid) return branch.uuid
      if (branch?.id) return branch.id
    }
  } catch {}

  // 2. Check user data in localStorage (set at login — managers have branch_id)
  try {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      if (user?.branch_id) return user.branch_id
    }
  } catch {}

  // 3. Decode branch_id from JWT token
  try {
    const token = localStorage.getItem('token')
    if (token) {
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
        if (payload?.branch_id) return payload.branch_id
      }
    }
  } catch {}

  return null
}

/**
 * Get the numeric (bigint) branch ID for endpoints that require it
 * (e.g. /sales where branch_id is a bigint column).
 * Falls back to getSessionBranchId() if no numeric id is found.
 */
export function getNumericBranchId() {
  // 1. Check the active branch object — it may have a separate numeric `id`
  try {
    const saved = localStorage.getItem('awosel_active_branch')
    if (saved) {
      const branch = JSON.parse(saved)
      if (branch?.numeric_id != null && !isNaN(Number(branch.numeric_id))) {
        return branch.numeric_id
      }
      // If id is numeric (or numeric string) and different from uuid, use it
      if (branch?.id != null && branch.id !== branch.uuid && !isNaN(Number(branch.id))) {
        return branch.id
      }
    }
  } catch {}

  // 2. Fall back to regular branch ID (might be uuid — let backend handle it)
  return getSessionBranchId()
}

/**
 * Get the full active branch object (id, uuid, name) from localStorage.
 * Prefer the UI-selected store so admin store switches are never overridden by
 * a stale user.branch_id stub.
 */
export function getActiveBranch() {
  // 1. Selected store in the UI (admins pick one; managers set at login)
  try {
    const saved = localStorage.getItem('awosel_active_branch')
    if (saved) {
      const branch = JSON.parse(saved)
      if (branch?.uuid || branch?.id) return branch
    }
  } catch {}

  // 2. Minimal object from user profile (managers / sales)
  try {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      if (user?.branch_id) {
        return { id: user.branch_id, uuid: user.branch_id, name: user.branch_name || 'My Branch' }
      }
    }
  } catch {}

  return null
}

/**
 * Get the organization ID for the current session.
 */
export function getSessionOrgId() {
  try {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      if (user?.organization_id) return user.organization_id
    }
  } catch {}

  try {
    const token = localStorage.getItem('token')
    if (token) {
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
        if (payload?.organization_id) return payload.organization_id
      }
    }
  } catch {}

  return null
}

/**
 * Normalize a branch API record so uuid and numeric id stay distinct.
 */
export function normalizeBranchRecord(branch) {
  if (!branch || typeof branch !== 'object') return branch
  const uuid =
    branch.uuid ||
    branch.branch_uuid ||
    (typeof branch.id === 'string' && String(branch.id).includes('-') ? branch.id : null) ||
    branch.branchId ||
    null

  const numericFromFields = [branch.numeric_id, branch.branch_numeric_id]
    .find((v) => v != null && v !== '' && !Number.isNaN(Number(v)))

  let numeric = numericFromFields
  if (
    numeric == null &&
    branch.id != null &&
    !Number.isNaN(Number(branch.id)) &&
    String(branch.id) !== String(uuid || '')
  ) {
    numeric = branch.id
  }
  if (
    numeric == null &&
    branch.branch_id != null &&
    !Number.isNaN(Number(branch.branch_id)) &&
    String(branch.branch_id) !== String(uuid || '')
  ) {
    numeric = branch.branch_id
  }

  return {
    ...branch,
    uuid: uuid || (branch.id != null ? branch.id : null),
    id: numeric != null ? numeric : (branch.id || uuid),
    numeric_id: numeric != null ? numeric : branch.numeric_id,
    name: branch.name || branch.branchName || branch.branch_name || 'Unnamed Store',
    location: branch.location || branch.address || branch.branch_location || '',
    store_type: branch.store_type || branch.storeType || branch.type || '',
    logo: branch.logo || branch.logo_url || branch.image || branch.image_url || '',
  }
}

/**
 * Persist a richer branch object (e.g. after listBranches) without changing
 * the currently selected store identity.
 */
export function enrichActiveBranch(branchLike) {
  if (!branchLike) return null
  const normalized = normalizeBranchRecord(branchLike)
  try {
    const saved = localStorage.getItem('awosel_active_branch')
    const current = saved ? JSON.parse(saved) : null
    const currentKey = current?.uuid || current?.id
    const nextKey = normalized.uuid || normalized.id
    if (currentKey && nextKey && String(currentKey) !== String(nextKey) && String(current?.uuid) !== String(normalized.uuid)) {
      // Different store — don't overwrite selection
      return current
    }
    const merged = { ...(current || {}), ...normalized }
    localStorage.setItem('awosel_active_branch', JSON.stringify(merged))
    return merged
  } catch {
    return normalized
  }
}
