import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

const SESSION_TIMEOUT = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const ACTIVITY_CHECK_INTERVAL = 60 * 1000 // Check every minute

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      // Check if user is already logged in and session is valid
      const isAuth = localStorage.getItem('isAuthenticated') === 'true'
      const lastActivity = localStorage.getItem('lastActivity')
      
      if (isAuth && lastActivity) {
        const timeSinceActivity = Date.now() - parseInt(lastActivity, 10)
        if (timeSinceActivity > SESSION_TIMEOUT) {
          // Session expired
          localStorage.removeItem('isAuthenticated')
          localStorage.removeItem('user')
          localStorage.removeItem('lastActivity')
          return false
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Error checking authentication:', error)
      return false
    }
  })
  
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        const parsed = JSON.parse(savedUser)
        // Validate user object
        if (parsed && parsed.username) {
          return parsed
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
    return null
  })

  // Update last activity time
  const updateActivity = useCallback(() => {
    try {
      if (isAuthenticated) {
        localStorage.setItem('lastActivity', Date.now().toString())
      }
    } catch (error) {
      console.error('Error updating activity:', error)
    }
  }, [isAuthenticated])

  // Track user activity
  useEffect(() => {
    if (!isAuthenticated) return

    // Update activity on any interaction
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart']
    const handleActivity = () => updateActivity()

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Check session validity periodically
    const intervalId = setInterval(() => {
      try {
        const lastActivity = localStorage.getItem('lastActivity')
        if (lastActivity) {
          const timeSinceActivity = Date.now() - parseInt(lastActivity, 10)
          if (timeSinceActivity > SESSION_TIMEOUT) {
            // Session expired
            logout()
            alert('Session expired. Please login again.')
          }
        }
      } catch (error) {
        console.error('Error checking session:', error)
      }
    }, ACTIVITY_CHECK_INTERVAL)

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
      clearInterval(intervalId)
    }
  }, [isAuthenticated, updateActivity])

  const login = useCallback(async (email, password) => {
    try {
      if (!email || !password) return { success: false, message: 'Email and password are required' }
      const sanitizedEmail = email.trim()
      if (!sanitizedEmail.includes('@')) return { success: false, message: 'Please enter a valid email' }

      const { login: apiLogin } = await import('../api/awoselDb.js')
      const response = await apiLogin({ email: sanitizedEmail, password })
      console.log('Login API response:', response)

      // Handle both { data: { user, token } } and { user, token } structures
      const userData = response.data?.user || response.user
      const token = response.data?.token || response.token

      if (!userData) {
        return { success: false, message: 'Login succeeded but no user data returned' }
      }

      setUser(userData)
      setIsAuthenticated(true)
      try {
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('user', JSON.stringify(userData))
        if (token) localStorage.setItem('token', token)
        localStorage.setItem('lastActivity', Date.now().toString())
      } catch (storageError) {
        console.error('Error saving to localStorage:', storageError)
      }
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: error.message || 'Network error. Is the backend running?' }
    }
  }, [])

  const logout = useCallback(() => {
    try {
      setIsAuthenticated(false)
      setUser(null)
      
      // Clean up localStorage
      const keysToRemove = ['isAuthenticated', 'user', 'lastActivity', 'token']
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key)
        } catch (error) {
          console.error(`Error removing ${key}:`, error)
        }
      })
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if error occurs
      setIsAuthenticated(false)
      setUser(null)
    }
  }, [])

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

