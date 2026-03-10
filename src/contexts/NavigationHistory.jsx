import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const NavigationHistoryContext = createContext()

export const useNavigationHistory = () => {
  const context = useContext(NavigationHistoryContext)
  if (!context) {
    throw new Error('useNavigationHistory must be used within NavigationHistoryProvider')
  }
  return context
}

export const NavigationHistoryProvider = ({ children }) => {
  const [history, setHistory] = useState([])
  const location = useLocation()
  const isNavigatingBack = useRef(false)

  useEffect(() => {
    // Skip adding to history if we're navigating back
    if (isNavigatingBack.current) {
      isNavigatingBack.current = false
      return
    }

    // Add current location to history if it's different from the last one
    setHistory(prev => {
      const lastPath = prev[prev.length - 1]
      // Only add if it's different from the last entry (prevents duplicates)
      if (prev.length === 0 || lastPath !== location.pathname) {
        return [...prev, location.pathname]
      }
      return prev
    })
  }, [location.pathname])

  const goBack = () => {
    if (history.length > 1) {
      // Mark that we're navigating back to prevent adding to history
      isNavigatingBack.current = true
      // Remove current page and go to previous
      const newHistory = [...history]
      newHistory.pop() // Remove current
      const previousPath = newHistory[newHistory.length - 1]
      // Update history before navigation
      setHistory(newHistory)
      return previousPath
    }
    return '/dashboard' // Default fallback
  }

  const canGoBack = history.length > 1

  const getPreviousPath = () => {
    if (history.length > 1) {
      return history[history.length - 2]
    }
    return null
  }

  const clearHistory = () => {
    setHistory([location.pathname])
  }

  return (
    <NavigationHistoryContext.Provider
      value={{
        history,
        goBack,
        canGoBack,
        getPreviousPath,
        clearHistory,
      }}
    >
      {children}
    </NavigationHistoryContext.Provider>
  )
}

