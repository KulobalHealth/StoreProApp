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
      // Always return uuid (not the numeric id)
      if (branch?.uuid) return branch.uuid
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
      // If id is numeric (or numeric string) and different from uuid, use it
      if (branch?.id != null && branch.id !== branch.uuid && !isNaN(Number(branch.id))) {
        return branch.id
      }
      // If id is the same as uuid, this branch was stored without a separate numeric id
      // Try to find a numeric_id field
      if (branch?.numeric_id) return branch.numeric_id
    }
  } catch {}

  // 2. Fall back to regular branch ID (might be uuid — let backend handle it)
  return getSessionBranchId()
}

/**
 * Get the full active branch object (id, uuid, name) from localStorage.
 */
export function getActiveBranch() {
  // 1. Check user data for branch info
  try {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      if (user?.branch_id) {
        // Check if we also have the full branch object in active branch
        const saved = localStorage.getItem('awosel_active_branch')
        if (saved) {
          const branch = JSON.parse(saved)
          if ((branch?.id || branch?.uuid) === user.branch_id) return branch
        }
        // Return minimal object from user data
        return { id: user.branch_id, uuid: user.branch_id, name: user.branch_name || 'My Branch' }
      }
    }
  } catch {}

  // 2. Fall back to active branch in localStorage
  try {
    const saved = localStorage.getItem('awosel_active_branch')
    if (saved) return JSON.parse(saved)
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
