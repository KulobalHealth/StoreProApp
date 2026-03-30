import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

const AuthContext = createContext(null)

const SESSION_TIMEOUT = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const ACTIVITY_CHECK_INTERVAL = 60 * 1000 // Check every minute

/**
 * Attempt to read and validate session data from localStorage.
 * Returns { isAuthenticated, user } — both consistent.
 */
function restoreSession() {
  try {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    const isAuthFlag = localStorage.getItem('isAuthenticated')
    const lastActivity = localStorage.getItem('lastActivity')

    // Must have all critical pieces
    if (!token || !savedUser || isAuthFlag !== 'true') {
      return { isAuthenticated: false, user: null }
    }

    const parsed = JSON.parse(savedUser)
    // User object must have at least one identifying field
    if (!parsed || !(parsed.id || parsed.uuid || parsed.email || parsed.username || parsed.role)) {
      return { isAuthenticated: false, user: null }
    }

    // Check session timeout (if lastActivity exists)
    if (lastActivity) {
      const timeSinceActivity = Date.now() - parseInt(lastActivity, 10)
      if (timeSinceActivity > SESSION_TIMEOUT) {
        // Session expired — clean up
        clearSession()
        return { isAuthenticated: false, user: null }
      }
    }

    // Everything looks good
    return { isAuthenticated: true, user: parsed }
  } catch (error) {
    console.error('Error restoring session:', error)
    return { isAuthenticated: false, user: null }
  }
}

/** Remove all session keys from localStorage */
function clearSession() {
  const keys = ['isAuthenticated', 'user', 'lastActivity', 'token', 'awosel_active_branch']
  keys.forEach(key => {
    try { localStorage.removeItem(key) } catch { /* ignore */ }
  })
}

/** Write session data atomically to localStorage */
function persistSession(userData, token) {
  try {
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('isAuthenticated', 'true')
    if (token) localStorage.setItem('token', token)
    localStorage.setItem('lastActivity', Date.now().toString())
  } catch (error) {
    console.error('Error persisting session:', error)
  }
}

export const AuthProvider = ({ children }) => {
  // Restore both states together from one function so they are always consistent
  const [session, setSession] = useState(restoreSession)
  const isAuthenticated = session.isAuthenticated
  const user = session.user

  // Expose individual setters that keep the pair in sync
  const setAuth = useCallback((auth, userData) => {
    setSession({ isAuthenticated: auth, user: userData })
  }, [])

  // Throttle activity writes to once every 30 s to avoid excessive localStorage writes
  const lastActivityWrite = useRef(0)
  const updateActivity = useCallback(() => {
    if (!isAuthenticated) return
    const now = Date.now()
    if (now - lastActivityWrite.current < 30_000) return
    lastActivityWrite.current = now
    try { localStorage.setItem('lastActivity', now.toString()) } catch { /* ignore */ }
  }, [isAuthenticated])

  // Track user activity
  useEffect(() => {
    if (!isAuthenticated) return

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart']
    const handler = () => updateActivity()

    activityEvents.forEach(event =>
      window.addEventListener(event, handler, { passive: true })
    )

    // Periodic session check
    const intervalId = setInterval(() => {
      try {
        const lastActivity = localStorage.getItem('lastActivity')
        if (lastActivity) {
          const elapsed = Date.now() - parseInt(lastActivity, 10)
          if (elapsed > SESSION_TIMEOUT) {
            logout()
            alert('Session expired. Please login again.')
          }
        }
      } catch { /* ignore */ }
    }, ACTIVITY_CHECK_INTERVAL)

    return () => {
      activityEvents.forEach(event => window.removeEventListener(event, handler))
      clearInterval(intervalId)
    }
  }, [isAuthenticated, updateActivity])

  // Listen for storage changes in other tabs so logout propagates
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'isAuthenticated' && e.newValue !== 'true') {
        setAuth(false, null)
      }
      // If user data was updated in another tab, sync it
      if (e.key === 'user' && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue)
          if (updated && (updated.id || updated.email || updated.role)) {
            setAuth(true, updated)
          }
        } catch { /* ignore */ }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [setAuth])

  const login = useCallback(async (email, password) => {
    try {
      if (!email || !password) return { success: false, message: 'Email and password are required' }
      const sanitizedEmail = email.trim()
      if (!sanitizedEmail.includes('@')) return { success: false, message: 'Please enter a valid email' }

      const { login: apiLogin } = await import('../api/awoselDb.js')
      const response = await apiLogin({ email: sanitizedEmail, password })

      // Handle both { data: { user, token } } and { user, token } structures
      const userData = response.data?.user || response.user
      const token = response.data?.token || response.token

      if (!userData) {
        return { success: false, message: 'Login succeeded but no user data returned' }
      }

      // Persist first, then update React state — so if the page reloads
      // between these two lines the session is already in localStorage.
      persistSession(userData, token)
      setAuth(true, userData)

      return { success: true, user: userData }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: error.message || 'Network error. Is the backend running?' }
    }
  }, [setAuth])

  const logout = useCallback(() => {
    setAuth(false, null)
    clearSession()
  }, [setAuth])

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

