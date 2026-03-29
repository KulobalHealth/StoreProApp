/**
 * Validation and sanitization utilities for robust data handling
 */

/**
 * Validates if a value is a valid number
 */
export const isValidNumber = (value) => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

/**
 * Safely parse a number with fallback
 */
export const safeParseFloat = (value, fallback = 0) => {
  const parsed = parseFloat(value)
  return isValidNumber(parsed) ? parsed : fallback
}

/**
 * Safely parse an integer with fallback
 */
export const safeParseInt = (value, fallback = 0) => {
  const parsed = parseInt(value, 10)
  return isValidNumber(parsed) ? parsed : fallback
}

/**
 * Validate and sanitize price values
 */
export const validatePrice = (price, min = 0, max = 1000000) => {
  const parsed = safeParseFloat(price, 0)
  return Math.max(min, Math.min(max, parsed))
}

/**
 * Validate and sanitize quantity values
 */
export const validateQuantity = (qty, min = 0.25, max = 10000) => {
  const parsed = safeParseFloat(qty, 1)
  return Math.max(min, Math.min(max, parsed))
}

/**
 * Sanitize string input — trims, truncates, and escapes HTML entities
 */
export const sanitizeString = (str, maxLength = 1000) => {
  if (typeof str !== 'string') return ''
  return str
    .trim()
    .slice(0, maxLength)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Sanitize string for display (trim + truncate only, no HTML escaping)
 * Use this when the value will be set via React JSX (already escaped by React)
 */
export const sanitizeInput = (str, maxLength = 1000) => {
  if (typeof str !== 'string') return ''
  return str.trim().slice(0, maxLength)
}

/**
 * Validate phone number (basic Ghana format)
 */
export const validatePhoneNumber = (phone) => {
  if (typeof phone !== 'string') return false
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length >= 10 && cleaned.length <= 15
}

/**
 * Validate email address
 */
export const validateEmail = (email) => {
  if (typeof email !== 'string') return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Safely access nested object properties
 */
export const safeGet = (obj, path, defaultValue = undefined) => {
  try {
    const keys = path.split('.')
    let result = obj
    for (const key of keys) {
      if (result === null || result === undefined) {
        return defaultValue
      }
      result = result[key]
    }
    return result !== undefined ? result : defaultValue
  } catch (error) {
    return defaultValue
  }
}

/**
 * Validate transaction data
 */
export const validateTransaction = (transaction) => {
  const errors = []

  if (!transaction) {
    errors.push('Transaction data is missing')
    return { isValid: false, errors }
  }

  if (!Array.isArray(transaction.items) || transaction.items.length === 0) {
    errors.push('Transaction must have at least one item')
  }

  if (!isValidNumber(transaction.total) || transaction.total < 0) {
    errors.push('Invalid transaction total')
  }

  if (!transaction.paymentMethod) {
    errors.push('Payment method is required')
  }

  // Validate items
  if (Array.isArray(transaction.items)) {
    transaction.items.forEach((item, index) => {
      if (!isValidNumber(item.qty) || item.qty <= 0) {
        errors.push(`Item ${index + 1}: Invalid quantity`)
      }
      if (!isValidNumber(item.unitPrice) || item.unitPrice < 0) {
        errors.push(`Item ${index + 1}: Invalid price`)
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Format currency with error handling
 */
export const formatCurrency = (amount, currency = '₵') => {
  try {
    const num = safeParseFloat(amount, 0)
    return `${currency}${num.toFixed(2)}`
  } catch (error) {
    return `${currency}0.00`
  }
}

/**
 * Safely parse JSON with fallback
 */
export const safeJSONParse = (jsonString, fallback = null) => {
  try {
    if (typeof jsonString !== 'string') return fallback
    return JSON.parse(jsonString)
  } catch (error) {
    console.warn('JSON parse error:', error)
    return fallback
  }
}

/**
 * Safely stringify JSON
 */
export const safeJSONStringify = (obj, fallback = '{}') => {
  try {
    return JSON.stringify(obj)
  } catch (error) {
    console.warn('JSON stringify error:', error)
    return fallback
  }
}

/**
 * Debounce function for performance optimization
 */
export const debounce = (func, wait = 300) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function for performance optimization
 */
export const throttle = (func, limit = 300) => {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Generate unique ID
 */
export const generateUniqueId = (prefix = 'ID') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Check if localStorage is available and working
 */
export const isLocalStorageAvailable = () => {
  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Safe localStorage operations
 */
export const safeLocalStorage = {
  getItem: (key, defaultValue = null) => {
    try {
      if (!isLocalStorageAvailable()) return defaultValue
      const item = localStorage.getItem(key)
      return item !== null ? item : defaultValue
    } catch (error) {
      console.warn('localStorage getItem error:', error)
      return defaultValue
    }
  },

  setItem: (key, value) => {
    try {
      if (!isLocalStorageAvailable()) return false
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.warn('localStorage setItem error:', error)
      if (error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded')
      }
      return false
    }
  },

  removeItem: (key) => {
    try {
      if (!isLocalStorageAvailable()) return false
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn('localStorage removeItem error:', error)
      return false
    }
  },

  clear: () => {
    try {
      if (!isLocalStorageAvailable()) return false
      localStorage.clear()
      return true
    } catch (error) {
      console.warn('localStorage clear error:', error)
      return false
    }
  }
}

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async (
  fn,
  maxRetries = 3,
  baseDelay = 1000
) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      const delay = baseDelay * Math.pow(2, i)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

export default {
  isValidNumber,
  safeParseFloat,
  safeParseInt,
  validatePrice,
  validateQuantity,
  sanitizeString,
  validatePhoneNumber,
  validateEmail,
  safeGet,
  validateTransaction,
  formatCurrency,
  safeJSONParse,
  safeJSONStringify,
  debounce,
  throttle,
  generateUniqueId,
  isLocalStorageAvailable,
  safeLocalStorage,
  retryWithBackoff
}
