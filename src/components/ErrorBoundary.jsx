import React from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0 
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error caught by boundary:', error, errorInfo)
    
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }))

    // Save error to localStorage for debugging
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent
      }
      
      const existingErrors = JSON.parse(localStorage.getItem('error_log') || '[]')
      existingErrors.unshift(errorLog)
      // Keep only last 10 errors
      localStorage.setItem('error_log', JSON.stringify(existingErrors.slice(0, 10)))
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    
    // If too many errors, clear cache
    if (this.state.errorCount > 3) {
      try {
        localStorage.clear()
        sessionStorage.clear()
      } catch (e) {
        console.error('Failed to clear storage:', e)
      }
    }
    
    window.location.reload()
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.href = '/pos'
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorCount } = this.state
      
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full border border-red-200">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-lg mr-4">
                <AlertCircle size={32} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
                <p className="text-gray-600 mt-1">
                  An unexpected error occurred. Don't worry, your data is safe.
                </p>
              </div>
            </div>

            {/* Error Details */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Error Details:</p>
              <p className="text-sm text-gray-600 font-mono break-words">
                {error?.message || 'Unknown error'}
              </p>
              {errorCount > 1 && (
                <p className="text-xs text-orange-600 mt-2">
                  This error has occurred {errorCount} time{errorCount > 1 ? 's' : ''}.
                </p>
              )}
            </div>

            {/* Stack trace (collapsed by default) */}
            {error?.stack && (
              <details className="bg-gray-50 p-4 rounded-lg mb-4">
                <summary className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Technical Details (for debugging)
                </summary>
                <pre className="text-xs text-gray-600 mt-2 overflow-auto max-h-40">
                  {error.stack}
                </pre>
              </details>
            )}

            {/* Suggested Actions */}
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">Suggested Actions:</p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Click "Reload Page" to try again</li>
                <li>Click "Go to POS" to return to the main page</li>
                {errorCount > 2 && (
                  <li className="text-orange-600">If the error persists, the app will clear its cache on next reload</li>
                )}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Home size={18} />
                Go to POS
              </button>
            </div>

            {/* Error ID for support */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Error ID: {Date.now().toString(36)}
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

